Absolutely — here’s a crisp, copy-paste brief of **what the Solana MCP track wants you to build**, distilled from the mentor notes you shared.

# Hackathon Track — Required & Expected

## Core requirement (eligibility)

* **Build an MCP server (tools)** that an AI agent can call.
* Those tools must **use Solana tech**: RPC / `@solana/web3.js`, Anchor/Rust backends, token transfers, Actions/Blinks, NFTs, price oracles, analytics, etc.
* Bonus path: integrate **x402 agent-to-agent payments** with **Solana settlement** (SOL/USDC).

## Problem focus (what they care about)

* **Useful for traders on Solana**, or
* **Simplifies understanding of financial markets** on Solana (risk, fees, positions, tx intent, pricing, execution preview).

## Minimum viable deliverable (what to actually ship)

* An **MCP server** exposing at least:

  * **1–2 read tools** (e.g., `get_balance`, `explain_tx`, `get_price/analyze_trend`).
  * **1 action tool** (safe on **Devnet**): e.g., `airdrop_and_tip` **or** a **trade preview** that returns an **Action/Blink** for user approval.
* **Devnet by default** (no real funds). Clear guardrails if you expose mainnet.
* **LLM demo**: natural-language prompt → MCP tools called → clear, human-readable outputs → (optional) wallet approve via Action/Blink.

## Judging signals (what makes it score high)

* **Trader value**: real utility (explain tx intent, show risk flags, preview fills/fees, DCA/stop-loss planning).
* **AI-native**: clean MCP tool contracts, LLM-friendly JSON, one-shot “ask → answer/action”.
* **Safety/UX**: Devnet default, simulations, slippage caps, plain-English summaries, no private keys handled.
* **Polish & speed**: low latency, tidy README, reliable live demo.
* **Creativity/vision**: show how this enables agent workflows (stretch: x402 payments, Actions/Blinks, alerts).

## Disqualifiers / red flags

* No actual **MCP** interface (just a regular API with no tool contract).
* Touching **mainnet** without explicit warnings/override.
* Handling **user seed phrases/private keys** on the server.
* Demo that doesn’t run, or unclear value for traders.

---

# Submission checklist (handy)

* [ ] **Repo** with MCP server (Node/TS or Rust), `README.md`, `curl` examples.
* [ ] **Tool specs** (inputs/outputs) documented for `get_balance`, `explain_tx`, and one **action** (preview or Devnet transfer).
* [ ] **Env**: `.env.example` (RPC URL, optional dev signer for Devnet).
* [ ] **Safety**: Devnet-only default; guardrails (slippage, mainnet override).
* [ ] **Demo script**: 3 steps (balance → explain tx → trade preview / tip) + optional Blink/Action click.
* [ ] **Short video/GIF** (backup) showing tools in action.
* [ ] **(Bonus)** x402 payment tool stub wired to Solana transfer.

---

# One-paragraph brief (paste to Claude as “what to build”)

> Build a Devnet-only **MCP server** for Solana that helps **traders**. Expose tools: `get_balance(address)`, `explain_tx(signature)` with human-readable risk flags, and **one action**: either `market_buy_sim(mint, usdAmount, slippageBps)` returning a preview (and, if time, an **Action/Blink** URL) or `airdrop_and_tip(to, sol)` to prove safe execution. Use `@solana/web3.js`, enforce Devnet default and slippage limits, never handle user private keys. Optimize responses for LLMs (small, typed JSON + plain-English `summary`). Provide a 5-minute demo flow (balance → explain tx → preview/approve) and a README with `curl` tests. *(Stretch)* Add x402 agent payments using Solana for settlement.

If you want, I can bundle this with your **exact repo scaffold + README** text in one go so Claude can start generating code immediately.
