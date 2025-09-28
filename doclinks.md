Short answer: yes. Give Claude a tight “doc kit” + a build brief so it can code quickly without wandering. Here’s a ready-to-use bundle.

# 1) Tiny Solana “doc kit” (authoritative links)

* **Install & Devnet setup**: Solana CLI + Anchor quick install. ([Solana][1])
* **web3.js basics** (Connection, `getBalance`, `requestAirdrop`, `sendAndConfirmTransaction`, `SystemProgram.transfer`, `getParsedTransaction`). (RPC explainer pages for parsed tx.) ([Solana Tracker][2])
* **Parsed transactions, decoding** (handy reference while you build the explainer). ([QuickNode][3])
* **Actions & Blinks** (if you add 1-click approvals later). ([Solana][4])
* **Helius Enhanced Transactions** (fast, human-readable tx summaries). ([Helius][5])
* **Pyth price feeds** (if you want real quotes/guards). ([docs.pyth.network][6])
* **MCP spec** (how tools should look/behave). ([Model Context Protocol][7])
* **x402 payments** (optional bonus track). ([GitHub][8])

# 2) Claude “build brief” (paste this as system/instructions)

> **Goal:** Implement a Devnet-only MCP-ish HTTP server exposing 3 tools for traders. Use Node.js + TypeScript + Express + `@solana/web3.js`. Validate inputs with Zod. Never ask users for private keys.
>
> **Env:** `DEVNET_RPC` (default to Solana Devnet), optional `DEMO_SECRET` (JSON array of 64-byte secret key for a demo signer).
>
> **Guardrails:** Devnet-only by default. Reject mainnet unless `mode:"i_understand_the_risk"`. Cap `slippageBps` at 150. Clear JSON errors.
>
> **Tools (HTTP POST routes + JSON schemas):**
>
> 1. `/tools/get_balance`
>    **Body:** `{ "address": string }`
>    **Return:** `{ address, lamports, sol }` using `connection.getBalance`.
>
> 2. `/tools/explain_tx`
>    **Body:** `{ "signature": string }`
>    **Return:** `{ signature, summary, movements:[{account, deltaSol}], accountsTouched, riskFlags[] }`
>
> * Fetch with `connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 })`.
>
> * Compute SOL deltas from `preBalances` vs `postBalances`.
>
> * `riskFlags` includes `"tx_error"` if `meta.err`, and `"program_error"` if any log line contains `"Error"`.
>
> 3. `/tools/market_buy_sim` (preview only)
>    **Body:** `{ mint:"SOL", usdAmount:number, slippageBps:number, network:"devnet", mode?:string }`
>    **Return:** `{ mint, usdAmount, slippageBps, preview:{ plainEnglish, expectedFill, feeEstimate } }`
>
> * For MVP, use a mock price (e.g., 150 USD/SOL). If available, add a `get_price` helper later via Pyth.
>
> *(Optional)* 4) `/tools/airdrop_and_tip`
> **Body:** `{ to:string, sol:number=0.01 }`
> **Return:** `{ signature, preview, from }`
>
> * Ensure demo signer has balance (`requestAirdrop`). Build a `SystemProgram.transfer` and `sendAndConfirmTransaction`.
>
> **Project layout:**
>
> ```
> /server/index.ts  (routes & wiring)
> /server/guards.ts (guardrails)
> /server/explain.ts (tx summary helpers)
> /server/prices.ts  (mock or Pyth-backed quotes)
> package.json, tsconfig.json, .env
> ```
>
> **Acceptance tests (curl):**
>
> * Balance:
>
>   ```bash
>   curl -sX POST :8787/tools/get_balance -H "content-type: application/json" \
>   -d '{"address":"<DEVNET_PUBKEY>"}'
>   ```
> * Explain:
>
>   ```bash
>   curl -sX POST :8787/tools/explain_tx -H "content-type: application/json" \
>   -d '{"signature":"<DEVNET_SIGNATURE>"}'
>   ```
> * Simulate:
>
>   ```bash
>   curl -sX POST :8787/tools/market_buy_sim -H "content-type: application/json" \
>   -d '{"mint":"SOL","usdAmount":50,"slippageBps":50,"network":"devnet"}'
>   ```
> * (Optional) Tip:
>
>   ```bash
>   curl -sX POST :8787/tools/airdrop_and_tip -H "content-type: application/json" \
>   -d '{"to":"<RECIPIENT_DEVNET_PUBKEY>","sol":0.01}'
>   ```
>
> **Definition of done:** All tools pass the curl tests; errors are informative; README contains setup + demo steps; Devnet-only enforcement works.

# 3) What to actually hand Claude

* The **doc kit links** above (so it can look up exact call signatures).
* The **build brief** block (so it knows endpoints, schemas, guardrails, and tests).
* Any **Devnet pubkeys/signatures** you want to use for the demo.

If you want, I can also generate the **exact files** (package.json, tsconfig, index.ts, guards.ts) as paste-ready code so Claude starts from a working scaffold instead of greenfield.

[1]: https://solana.com/docs/intro/installation?utm_source=chatgpt.com "Install the Solana CLI and Anchor with one command"
[2]: https://docs.solanatracker.io/solana-rpc/methods/getParsedTransaction?utm_source=chatgpt.com "getParsedTransaction"
[3]: https://www.quicknode.com/docs/solana/getParsedTransaction?utm_source=chatgpt.com "getParsedTransaction RPC Method | Solana Docs"
[4]: https://solana.com/developers/guides/advanced/actions?utm_source=chatgpt.com "Actions and Blinks"
[5]: https://www.helius.dev/docs/enhanced-transactions?utm_source=chatgpt.com "Solana Enhanced Transactions API - Helius Docs"
[6]: https://docs.pyth.network/price-feeds/price-feeds?utm_source=chatgpt.com "Price Feeds – Pyth Network Documentation"
[7]: https://modelcontextprotocol.io/specification/latest?utm_source=chatgpt.com "Specification"
[8]: https://github.com/coinbase/x402?utm_source=chatgpt.com "coinbase/x402: A payments protocol for the internet. ..."
