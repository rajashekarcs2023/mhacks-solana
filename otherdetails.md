Absolutely—we can vibe-code this and keep it tight. Here’s a **clear, finish-in-5–6h plan** + the **exact files/commands** you need to get the MVP running.

---

# 🔧 What we’re building (scope)

**Trader’s Co-Pilot (Lite)** — an MCP-ish HTTP server exposing 3 Solana tools (Devnet-only):

1. `get_balance(address)` – read wallet balance
2. `explain_tx(signature)` – plain-English summary + risk flags
3. `market_buy_sim(mint, usdAmount, slippageBps)` – simulate/preview only (no real swap)

*(Optional if time allows)*
4) `airdrop_and_tip(to, sol=0.01)` – prove safe write on Devnet

---

# ✅ What you need installed

* **Node.js** 18+ (includes npm)
* **TypeScript** (`npm i -g typescript ts-node` or use local dev dep)
* **Solana Devnet** RPC (default public is fine)
* A **separate Devnet wallet** (server will also generate an ephemeral one for airdrops)

---

# 🗂️ Repo scaffold (copy this)

```
solana-mcp-lite/
  server/
    index.ts
    solana-helpers.ts        (optional, if you split helpers)
  package.json
  tsconfig.json
  .env                       (optional: DEVNET_RPC, DEMO_SECRET)
  README.md
```

---

# 📦 package.json (drop in)

```json
{
  "name": "solana-mcp-lite",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "ts-node server/index.ts",
    "start": "node dist/server/index.js",
    "build": "tsc -p ."
  },
  "dependencies": {
    "@solana/web3.js": "^1.93.0",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "ts-node": "^10.9.2",
    "typescript": "^5.6.3"
  }
}
```

---

# 🛠 tsconfig.json (drop in)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Node",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["server/**/*.ts"]
}
```

---

# 🧪 server/index.ts (starter you can run now)

```ts
import "dotenv/config";
import express from "express";
import {
  Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL,
  SystemProgram, Keypair, sendAndConfirmTransaction, Transaction
} from "@solana/web3.js";
import { z } from "zod";

/** __define-ocg__: global config & guardrails */
const varOcg = { network: "devnet", maxSlippageBps: 150, refuseMainnetByDefault: true };

const RPC = process.env.DEVNET_RPC || clusterApiUrl("devnet");
const conn = new Connection(RPC, "confirmed");

const app = express();
app.use(express.json());

// Devnet demo signer (ephemeral, never use on mainnet)
const DEMO_SECRET = process.env.DEMO_SECRET && Uint8Array.from(JSON.parse(process.env.DEMO_SECRET));
const demoKeypair = DEMO_SECRET ? Keypair.fromSecretKey(DEMO_SECRET) : Keypair.generate();

function guardrails({ slippageBps, network, mode }:{ slippageBps?: number; network?: string; mode?: string }) {
  if (varOcg.refuseMainnetByDefault && network && network !== "devnet" && mode !== "i_understand_the_risk") {
    throw new Error("Mainnet disabled. Use Devnet or set explicit override mode.");
  }
  if (slippageBps && slippageBps > varOcg.maxSlippageBps) {
    throw new Error(`Slippage too high (> ${varOcg.maxSlippageBps} bps).`);
  }
}

// ---------- 1) get_balance ----------
app.post("/tools/get_balance", async (req, res) => {
  try {
    const { address } = z.object({ address: z.string().min(32) }).parse(req.body);
    const bal = await conn.getBalance(new PublicKey(address));
    res.json({ address, lamports: bal, sol: bal / LAMPORTS_PER_SOL });
  } catch (e:any) { res.status(400).json({ error: e.message }); }
});

// ---------- 2) explain_tx (plain-English) ----------
app.post("/tools/explain_tx", async (req, res) => {
  try {
    const { signature } = z.object({ signature: z.string().min(32) }).parse(req.body);
    const parsed = await conn.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
    if (!parsed) return res.status(404).json({ error: "Transaction not found (Devnet)." });

    const accounts = parsed.transaction.message.accountKeys.map(a => a.pubkey.toBase58());
    const pre = parsed.meta?.preBalances || [];
    const post = parsed.meta?.postBalances || [];

    let movements: Array<{account:string; deltaSol:number}> = [];
    for (let i=0;i<pre.length;i++) {
      const delta = (post[i] - pre[i]) / LAMPORTS_PER_SOL;
      if (Math.abs(delta) > 0) movements.push({ account: accounts[i], deltaSol: parseFloat(delta.toFixed(9)) });
    }

    const txErr = parsed.meta?.err ? "tx_error" : null;
    const programErr = (parsed.meta?.logMessages||[]).some(l => l.includes("Error")) ? "program_error" : null;
    const riskFlags = [txErr, programErr].filter(Boolean);

    let summary = "Transaction: ";
    const sends = movements.filter(m => m.deltaSol < 0);
    const recvs = movements.filter(m => m.deltaSol > 0);
    if (sends.length && recvs.length) {
      summary += `Transfer of ~${Math.abs(sends[0].deltaSol)} SOL from ${sends[0].account.slice(0,4)}… to ${recvs[0].account.slice(0,4)}…`;
    } else summary += "No net SOL transfer detected (program interaction or CPI).";

    res.json({
      signature,
      summary,
      movements,                      // SOL deltas per account
      accountsTouched: accounts.length,
      riskFlags
    });
  } catch (e:any) { res.status(400).json({ error: e.message }); }
});

// ---------- 3) market_buy_sim (preview only) ----------
app.post("/tools/market_buy_sim", async (req, res) => {
  try {
    const schema = z.object({
      mint: z.string().default("SOL"),
      usdAmount: z.number().min(1).default(50),
      slippageBps: z.number().min(1).max(5000).default(50),
      network: z.string().default("devnet"),
      mode: z.string().optional()
    });
    const { mint, usdAmount, slippageBps, network, mode } = schema.parse(req.body);
    guardrails({ slippageBps, network, mode });

    const mockPrice = 150; // USD per SOL (replace with real source if time permits)
    const expectedFill = Number(usdAmount / mockPrice);
    const feeEstimate = 0.000005;

    res.json({
      mint, usdAmount, slippageBps,
      preview: {
        plainEnglish: `Would buy ~${expectedFill.toFixed(4)} ${mint} for $${usdAmount} with ≤${slippageBps} bps slippage (${network}).`,
        expectedFill: `${expectedFill.toFixed(4)} ${mint}`,
        feeEstimate
      }
    });
  } catch (e:any) { res.status(400).json({ error: e.message }); }
});

// ---------- 4) (Optional) airdrop_and_tip (Devnet write) ----------
app.post("/tools/airdrop_and_tip", async (req, res) => {
  try {
    const { to, sol } = z.object({ to: z.string(), sol: z.number().default(0.01) }).parse(req.body);
    const toPk = new PublicKey(to);

    const bal = await conn.getBalance(demoKeypair.publicKey);
    if (bal < 0.2 * LAMPORTS_PER_SOL) {
      await conn.requestAirdrop(demoKeypair.publicKey, 2 * LAMPORTS_PER_SOL);
    }

    const tx = new Transaction().add(SystemProgram.transfer({
      fromPubkey: demoKeypair.publicKey,
      toPubkey: toPk,
      lamports: Math.floor(sol * LAMPORTS_PER_SOL),
    }));
    const sig = await sendAndConfirmTransaction(conn, tx, [demoKeypair]);

    res.json({
      signature: sig,
      preview: `Sent ${sol} SOL (Devnet) to ${toPk.toBase58()}`,
      from: demoKeypair.publicKey.toBase58()
    });
  } catch (e:any) { res.status(400).json({ error: e.message }); }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Solana MCP Lite on :${PORT} (Devnet only)`));
```

---

# ▶️ Run it

```bash
npm i
npm run dev
# (optional) export DEVNET_RPC or DEMO_SECRET in .env
```

---

# 🔍 Quick tests (curl)

```bash
# 1) Balance
curl -sX POST localhost:8787/tools/get_balance \
  -H "content-type: application/json" \
  -d '{"address":"EnterADevnetAddressHere"}' | jq

# 2) Explain TX
curl -sX POST localhost:8787/tools/explain_tx \
  -H "content-type: application/json" \
  -d '{"signature":"EnterADevnetSignature"}' | jq

# 3) Market buy preview
curl -sX POST localhost:8787/tools/market_buy_sim \
  -H "content-type: application/json" \
  -d '{"mint":"SOL","usdAmount":50,"slippageBps":50}' | jq

# 4) (Optional) Airdrop + tip
curl -sX POST localhost:8787/tools/airdrop_and_tip \
  -H "content-type: application/json" \
  -d '{"to":"EnterRecipientDevnetAddress","sol":0.01}' | jq
```

---

# ⏱️ 5–6h “vibe code” plan

* **Hour 0–1**: scaffold + run server
* **Hour 1–2**: `get_balance`
* **Hour 2–3**: `explain_tx` (basic SOL deltas + risk flags)
* **Hour 3–4**: `market_buy_sim` w/ guardrails
* **Hour 4–5** *(optional)*: `airdrop_and_tip` write path proof
* **Hour 5–6**: README, copy-paste demo script, polish error messages

---

# 🎤 5-minute demo script

1. Ask the agent for balance → `/get_balance`
2. Paste a Devnet tx → `/explain_tx` shows human summary + risk flags
3. “If I buy $50 of SOL ≤0.5% slippage?” → `/market_buy_sim` shows preview
4. (Optional) Tip 0.01 SOL on Devnet → `/airdrop_and_tip` returns a signature

---

If you get stuck on anything while coding, paste the error—you’ll get the exact fix.
