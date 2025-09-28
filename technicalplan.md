Awesome—here’s a crisp, end-to-end **technical build plan** you can hand straight to Claude (or any MCP-capable agent) to code against. It’s optimized for a 5–6h MVP with a clean demo, and leaves hooks for stretch goals (Blinks/Actions + x402).

---

# 0) Goals & Deliverables

**Goal:** An MCP server that lets an AI agent:

1. Read trader-useful data (balances, tx explains),
2. Safely preview trades (simulation/estimates),
3. (Optional) Execute a harmless write on **Devnet** (airdrop + tip).

**Deliverables (MVP):**

* MCP server (HTTP) with tools:

  * `get_balance(address)`
  * `explain_tx(signature)`
  * `market_buy_sim(mint, usdAmount, slippageBps)`
  * *(Optional)* `airdrop_and_tip(to, sol=0.01)`
* Devnet-only guardrails, schema validation, structured JSON responses.
* README with curl tests + 5-min demo script.

**Stretch (if time):**

* Blink/Action URL stubs for future “one-click approve”.
* `watch_address(address)` polling.
* `x402_pay(to, amount, token)` API stub (spec-conformant request object, returns a placeholder Action).

---

# 1) Architecture

**Runtime:** Node.js + TypeScript
**HTTP:** Express
**Chain:** Solana Devnet via `@solana/web3.js`
**Validation:** `zod`
**Config:** `.env` (`DEVNET_RPC`, `DEMO_SECRET`)
**MCP:** Expose tools over HTTP JSON; register with Claude as MCP tools.

**High-level flow**

* Claude parses user request → chooses an MCP tool → POSTs JSON to your route.
* Server validates input (zod), enforces guardrails (Devnet-only, slippage caps).
* Server calls Solana RPC or sim logic → returns structured JSON the model can reason about.

---

# 2) Repo Layout

```
solana-mcp-lite/
  server/
    index.ts                # HTTP server, routes = MCP tools
    guards.ts               # guardrails helpers
    explain.ts              # explain_tx logic
    prices.ts               # price/preview helpers (mock or real)
    tx.ts                   # (optional) build/sim tx helpers
  package.json
  tsconfig.json
  .env.example
  README.md
```

---

# 3) Dependencies

```json
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
```

---

# 4) Environment & Keys

`.env.example`

```
DEVNET_RPC=https://api.devnet.solana.com
# Optional: persist demo signer across restarts (Devnet only)
# DEMO_SECRET=[1,2,3,...]  # JSON array of 64-byte secret key
PORT=8787
```

**Dev signer**: Generate once (Devnet only) and airdrop SOL for testing. Never request or store user seeds/keys.

---

# 5) MCP Tool Contracts (JSON Schemas & Responses)

> Keep responses **small, explicit, typed**, and **plain-English summaries** for LLMs.

## Tool: `get_balance`

**POST** `/tools/get_balance`
**Body**

```json
{ "address": "string (base58)" }
```

**Response**

```json
{
  "address": "string",
  "lamports": 123456,
  "sol": 0.000123456
}
```

## Tool: `explain_tx`

**POST** `/tools/explain_tx`
**Body**

```json
{ "signature": "string" }
```

**Response**

```json
{
  "signature": "string",
  "summary": "Transfer ~1.00 SOL from AAAA… to BBBB…",
  "movements": [{ "account":"string", "deltaSol": -1.0 }],
  "accountsTouched": 6,
  "riskFlags": ["tx_error", "program_error"]
}
```

## Tool: `market_buy_sim`

**POST** `/tools/market_buy_sim`
**Body**

```json
{
  "mint": "SOL",
  "usdAmount": 50,
  "slippageBps": 50,
  "network": "devnet",
  "mode": "optional 'i_understand_the_risk' for mainnet override"
}
```

**Response**

```json
{
  "mint": "SOL",
  "usdAmount": 50,
  "slippageBps": 50,
  "preview": {
    "plainEnglish": "Would buy ~0.3333 SOL for $50 with ≤50 bps slippage (devnet).",
    "expectedFill": "0.3333 SOL",
    "feeEstimate": 0.000005
  }
}
```

## Tool (optional): `airdrop_and_tip`

**POST** `/tools/airdrop_and_tip`
**Body**

```json
{ "to":"address", "sol": 0.01 }
```

**Response**

```json
{
  "signature": "string",
  "preview": "Sent 0.01 SOL (Devnet) to ABCD…",
  "from": "yourDemoSignerPubkey"
}
```

---

# 6) Guardrails & Policies

Create `guards.ts`:

```ts
/** __define-ocg__: global config & guardrails */
export const varOcg = { network: "devnet", maxSlippageBps: 150, refuseMainnetByDefault: true };

export function guardrails(params: { slippageBps?: number; network?: string; mode?: string }) {
  const { slippageBps, network, mode } = params;
  if (varOcg.refuseMainnetByDefault && network && network !== "devnet" && mode !== "i_understand_the_risk") {
    throw new Error("Mainnet disabled. Use Devnet or set explicit override mode.");
  }
  if (slippageBps && slippageBps > varOcg.maxSlippageBps) {
    throw new Error(`Slippage too high (> ${varOcg.maxSlippageBps} bps).`);
  }
}
```

---

# 7) Route Implementation Plan

## `server/index.ts` (HTTP + wiring)

* Load env, init Express + JSON.
* Init `Connection` to Devnet.
* Initialize demo Keypair (Devnet only).
* Implement POST routes calling helpers.

### Balance

* Parse & validate address (`zod`).
* `conn.getBalance(pubkey)`.
* Return lamports + SOL.

### Explain TX

* Parse signature.
* `conn.getParsedTransaction(sig, {maxSupportedTransactionVersion: 0})`.
* Compute per-account SOL deltas from `preBalances/postBalances`.
* Risk flags:

  * `meta.err` → `tx_error`
  * log message containing “Error” → `program_error`
* Build short natural-language `summary`.

### Market Buy (Sim)

* Parse `{mint, usdAmount, slippageBps, network, mode}`.
* `guardrails(...)`.
* **Price**: MVP uses a mock (e.g., 150 USD/SOL) to compute expected fill.

  * (Stretch) drop in real price reader in `prices.ts`.
* Return preview object.

### Airdrop + Tip (Optional)

* Ensure demo signer has some SOL:

  * if balance < 0.2 SOL → `requestAirdrop(2 SOL)`.
* Build `SystemProgram.transfer`.
* `sendAndConfirmTransaction`.
* Return signature + preview.

---

# 8) Claude Tooling Setup (MCP Registration)

Depending on your Claude environment (Desktop / API), register tools as remote HTTP endpoints with their JSON schemas. Provide Claude a short instruction like:

> “You have access to these tools. Prefer Devnet for anything stateful. Before any action, call `market_buy_sim` to preview. Always summarize tool results back to the user.”

**Tool descriptions** (for the MCP manifest):

* `get_balance`: “Return SOL balance for an address (Devnet).”
* `explain_tx`: “Explain a Devnet transaction in plain English with risk flags.”
* `market_buy_sim`: “Preview a buy order in USD with slippage guard, Devnet-only.”
* `airdrop_and_tip`: “Send a tiny SOL tip on Devnet from demo signer (for demos).”

---

# 9) Testing (curl) — copy/paste

```bash
# 1) Balance
curl -sX POST localhost:8787/tools/get_balance \
  -H "content-type: application/json" \
  -d '{"address":"<DEVNET_PUBKEY>"}' | jq

# 2) Explain TX
curl -sX POST localhost:8787/tools/explain_tx \
  -H "content-type: application/json" \
  -d '{"signature":"<DEVNET_SIGNATURE>"}' | jq

# 3) Market buy preview (simulation only)
curl -sX POST localhost:8787/tools/market_buy_sim \
  -H "content-type: application/json" \
  -d '{"mint":"SOL","usdAmount":50,"slippageBps":50,"network":"devnet"}' | jq

# 4) (Optional) Tip
curl -sX POST localhost:8787/tools/airdrop_and_tip \
  -H "content-type: application/json" \
  -d '{"to":"<RECIPIENT_DEVNET_PUBKEY>","sol":0.01}' | jq
```

---

# 10) Timeline (5–6h)

**Hour 0–1**

* Initialize repo, install deps, set up Express/TypeScript, create `.env`.

**Hour 1–2**

* Implement `get_balance`, test with curl.
* Add `guards.ts`, `zod` validation.

**Hour 2–3**

* Implement `explain_tx` (SOL deltas + risk flags + summary).

**Hour 3–4**

* Implement `market_buy_sim` (mock price, guardrails).

**Hour 4–5**

* *(Optional)* Implement `airdrop_and_tip` (prove write path).
* Add README + curl commands.

**Hour 5–6**

* Smoke test all endpoints.
* Script the 2-minute pitch + 5-minute demo.

---

# 11) Stretch Modules (slot in if time remains)

## A) Real price source (`prices.ts`)

* Add a thin wrapper to fetch a recent SOL/USD price (or mint price).
* Validate staleness and include `{conf, lastUpdateMs}` in `get_price` and `market_buy_sim`.

## B) Blink/Action endpoints (stubs)

* Add `POST /actions/market_buy` returning a **placeholder** Action payload.
* Add `blinkUrl` field in `market_buy_sim` response for future one-click flows.

## C) Watch address

* `POST /tools/watch_address` → returns a webhook URL or starts a poller (in-memory).
* MVP: poll `getSignaturesForAddress` every 5s and print to console; tell judges it’s wired.

## D) x402 stub

* `POST /tools/x402_pay` accepts x402 request JSON and returns `{actionUrl, preview}`.
* Explain in README how you’d map to Solana transfer for real settlement.

---

# 12) Acceptance Criteria

* All four routes respond with 2xx for valid input, 4xx with clear JSON errors otherwise.
* `explain_tx` returns a **plain-English** `summary` that matches the core movement.
* `market_buy_sim` enforces `slippageBps <= 150` and refuses mainnet unless overridden.
* Optional `airdrop_and_tip` returns a valid **Devnet signature** viewable in explorer.
* README contains **exact curl commands** and the **demo script**.

---

# 13) Demo Script (final)

1. “**What’s in my wallet?**” → `get_balance`
2. “**Explain this Devnet tx**” → `explain_tx` (summary + risk flags)
3. “**If I buy $50 of SOL with ≤0.5% slippage, what do I get?**” → `market_buy_sim`
4. “**Tip 0.01 SOL**” (optional) → `airdrop_and_tip` returns a signature

Close with: “This MCP makes Solana **AI-native** for traders: understand → preview → (optionally) execute—safely on Devnet. Next up: Blinks/Actions and x402 for agent-to-agent payments.”

---

If you want, I can also output the **exact files** (package.json, tsconfig, index.ts, guards.ts, explain.ts) as ready-to-paste code blocks next.
