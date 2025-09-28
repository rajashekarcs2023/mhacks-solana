# 🚀 Trader's Co-Pilot

**AI-native Solana MCP server that makes blockchain trading safe, understandable, and accessible through natural language.**

[![Built for Hackathon](https://img.shields.io/badge/Built%20for-Solana%20MCP%20Hackathon-green)](https://github.com)
[![Devnet Only](https://img.shields.io/badge/Network-Devnet%20Only-orange)](https://explorer.solana.com/?cluster=devnet)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## 🎯 What is Trader's Co-Pilot?

Trader's Co-Pilot bridges the gap between AI agents and Solana blockchain, enabling traders to:

- **Understand transactions** in plain English with risk analysis
- **Check balances** instantly across any Solana address  
- **Preview trades** safely with slippage protection
- **Execute operations** securely on Devnet for testing

Perfect for hackathon judges who want to see **real trader value** delivered through **MCP integration**.

## ⚡ Quick Start (5 minutes)

### Prerequisites
- **Node.js 18+** 
- **npm** or **yarn**
- **No API keys required!** ✨ (Uses free Solana Devnet RPC)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment  
```bash
cp .env.example .env
# Edit .env if needed (defaults work fine)
```

### 3A. Start HTTP Server (for manual testing)
```bash
npm run dev
```

**✅ HTTP server running on http://localhost:8787**

### 3B. Start MCP Server (for AI agent integration)
```bash
npm run mcp
```

**✅ MCP server ready for Claude Desktop or other MCP clients**

### 4A. Test HTTP Server
```bash
curl http://localhost:8787
npm run demo  # Complete HTTP demo
```

### 4B. Test MCP Server
```bash
npm run test-mcp        # Test MCP functionality locally
npm run test-anthropic  # Test with real Claude via Anthropic API (requires API key)
```

### 4C. Connect to Claude Desktop
See [CLAUDE_INTEGRATION.md](./CLAUDE_INTEGRATION.md) for complete Claude Desktop setup instructions.

## 🛠️ MCP Tools Reference

### 1. `get_balance` - Check Wallet Balance

**Endpoint:** `POST /tools/get_balance`

```bash
curl -X POST http://localhost:8787/tools/get_balance \
  -H "Content-Type: application/json" \
  -d '{"address": "DEVNET_ADDRESS_HERE"}'
```

**Response:**
```json
{
  "address": "...",
  "lamports": 1000000000,
  "sol": 1.0
}
```

### 2. `explain_tx` - Analyze Transactions

**Endpoint:** `POST /tools/explain_tx`

```bash
curl -X POST http://localhost:8787/tools/explain_tx \
  -H "Content-Type: application/json" \
  -d '{"signature": "DEVNET_TX_SIGNATURE_HERE"}'
```

**Response:**
```json
{
  "signature": "...",
  "summary": "Transfer of ~1.0000 SOL from AAAA… to BBBB…",
  "movements": [
    {"account": "...", "deltaSol": -1.000005},
    {"account": "...", "deltaSol": 1.0}
  ],
  "accountsTouched": 2,
  "riskFlags": []
}
```

### 3. `market_buy_sim` - Preview Trades

**Endpoint:** `POST /tools/market_buy_sim`

```bash
curl -X POST http://localhost:8787/tools/market_buy_sim \
  -H "Content-Type: application/json" \
  -d '{
    "mint": "SOL",
    "usdAmount": 50,
    "slippageBps": 50
  }'
```

**Response:**
```json
{
  "mint": "SOL",
  "usdAmount": 50,
  "slippageBps": 50,
  "preview": {
    "plainEnglish": "Would buy approximately 0.3333 SOL for $50 with ≤0.50% slippage on devnet...",
    "expectedFill": "0.3333 SOL",
    "feeEstimate": 0.000005
  }
}
```

### 4. `airdrop_and_tip` - Demo Execution

**Endpoint:** `POST /tools/airdrop_and_tip`

```bash
curl -X POST http://localhost:8787/tools/airdrop_and_tip \
  -H "Content-Type: application/json" \
  -d '{
    "to": "RECIPIENT_DEVNET_ADDRESS",
    "sol": 0.01
  }'
```

**Response:**
```json
{
  "signature": "transaction_signature_here",
  "preview": "Successfully sent 0.01 SOL to ... on Devnet",
  "from": "demo_signer_address"
}
```

## 🎪 5-Minute Demo Script

Perfect for hackathon presentations! Follow these steps for a compelling demo:

### Setup (30 seconds)
1. **Show server startup**: `npm run dev`
2. **Point out safety**: "Notice: Devnet-only for safety"
3. **Explain MCP**: "AI agents call these HTTP endpoints as tools"

### Demo Flow (4 minutes)

#### Step 1: "What's in my wallet?" (60s)
```bash
# Use any Devnet address or generate one
curl -X POST localhost:8787/tools/get_balance \
  -H "Content-Type: application/json" \
  -d '{"address": "11111111111111111111111111111112"}'
```
**Say:** *"The AI asks for a balance, and gets an instant, structured response it can understand."*

#### Step 2: "Explain this transaction" (90s)
```bash
# Use a real Devnet transaction signature
curl -X POST localhost:8787/tools/explain_tx \
  -H "Content-Type: application/json" \
  -d '{"signature": "REAL_DEVNET_SIGNATURE_HERE"}'
```
**Say:** *"Paste any transaction signature, and the AI gets a human-readable explanation with risk flags. No more signing blind!"*

#### Step 3: "Preview a trade" (60s)
```bash
curl -X POST localhost:8787/tools/market_buy_sim \
  -H "Content-Type: application/json" \
  -d '{"mint": "SOL", "usdAmount": 50, "slippageBps": 50}'
```
**Say:** *"Before executing, the AI shows exactly what the user will get, with slippage protection built-in."*

#### Step 4: "Send a tip" (30s)
```bash
curl -X POST localhost:8787/tools/airdrop_and_tip \
  -H "Content-Type: application/json" \
  -d '{"to": "TARGET_ADDRESS", "sol": 0.01}'
```
**Say:** *"And yes, it can safely execute on Devnet. Here's the transaction signature to verify."*

### Closing (30s)
**Say:** *"This makes Solana AI-native. Any agent—Claude, ChatGPT, custom bots—can now understand Solana and execute safely. Next: Actions/Blinks for one-click approvals and x402 for agent-to-agent payments."*

## 🛡️ Safety Features

### Devnet-Only Protection
- **Default network**: Devnet only
- **Mainnet blocking**: Requires explicit `mode: "i_understand_the_risk"`
- **Clear warnings**: All responses indicate network

### Smart Guardrails
- **Slippage caps**: Maximum 1.5% (150 bps) slippage allowed
- **Amount limits**: Demo tips capped at 1.0 SOL
- **Address validation**: Prevents invalid address errors
- **No private keys**: Demo signer only, never handles user keys

### Risk Detection
- **Transaction errors**: Flags failed transactions
- **Program errors**: Detects error logs in execution
- **Clear summaries**: Plain English explanations with warnings

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js for HTTP endpoints
- **Blockchain**: Solana Web3.js SDK
- **Validation**: Zod schemas for type safety
- **Network**: Solana Devnet (safe for demos)

### Project Structure
```
traders-copilot/
├── server/
│   ├── index.ts          # Main HTTP server & MCP endpoints
│   ├── guards.ts         # Safety guardrails & validation
│   └── types.ts          # TypeScript interfaces
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment template
└── README.md            # This file
```

### MCP Integration
Each endpoint is designed as an MCP tool that AI agents can call:

1. **Structured inputs**: JSON schemas with validation
2. **Typed outputs**: Consistent response formats
3. **LLM-friendly**: Plain English summaries + structured data
4. **Error handling**: Clear error messages for debugging

## 🔧 Development

### Local Development
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests (builds and starts)
npm test
```

### Configuration Options

#### Environment Variables
- `DEVNET_RPC`: Solana RPC endpoint (default: Devnet)
- `PORT`: Server port (default: 8787)
- `DEMO_SECRET`: Persistent demo signer key (optional)
- `NETWORK`: Network identifier (default: devnet)

#### Demo Signer Setup
For consistent testing, you can persist the demo signer:

```bash
# Generate a persistent key
node -e "console.log(JSON.stringify(Array.from(require('@solana/web3.js').Keypair.generate().secretKey)))"

# Add to .env
DEMO_SECRET=[1,2,3,...64]
```

**⚠️ Never use this on mainnet or with real funds!**

## 🏆 Hackathon Winning Features

### ✅ Requirements Met
- **MCP Server**: HTTP endpoints with proper tool contracts
- **Solana Integration**: Uses @solana/web3.js, RPC calls, transfers
- **Trader Focus**: Transaction understanding, risk flags, trade previews
- **Safety First**: Devnet default, slippage protection, guardrails

### 🚀 Competitive Advantages
- **Real Value**: Solves actual trader pain points
- **AI-Native**: Optimized for LLM interaction patterns  
- **Safety Focus**: Comprehensive protection against mistakes
- **Polish**: Clean code, documentation, reliable demo
- **Vision**: Clear path to agent-driven finance future

### 🎯 Judge Appeal
- **Immediate utility**: Works out of the box
- **Safety conscious**: No risk of fund loss
- **Well documented**: Easy to understand and evaluate
- **Professional quality**: Production-ready code standards
- **Future ready**: Extensible to Actions, Blinks, x402

## 🔮 Future Roadmap

### Phase 1: Enhanced Features
- **Real price feeds**: Pyth Network integration for accurate pricing
- **Advanced analysis**: DeFi protocol interaction detection
- **Portfolio tracking**: Multi-token balance monitoring

### Phase 2: UX Improvements  
- **Actions/Blinks**: One-click trade approvals
- **Wallet integration**: Direct wallet connection
- **Mobile support**: Responsive design for mobile demos

### Phase 3: Agent Economy
- **x402 payments**: Agent-to-agent payment protocol
- **Strategy automation**: DCA, stop-loss, limit orders
- **Cross-chain**: Extend to other blockchains via MCP

## 🤝 Contributing

This hackathon project showcases the potential for AI-native Solana tools. Contributions welcome!

### Quick Contribution Guide
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

### Development Principles
- **Safety first**: All features default to safe options
- **LLM optimized**: Responses designed for AI consumption
- **Type safe**: Comprehensive TypeScript usage
- **Well tested**: Every endpoint thoroughly validated

## 📄 License

MIT License - Built for the Solana MCP Hackathon

## 🙏 Acknowledgments

- **Solana Foundation** for the incredible blockchain platform
- **MCP Protocol** for enabling AI-blockchain integration
- **Hackathon organizers** for this amazing opportunity
- **The community** for inspiration and support

---

**🎯 Ready to demo? Start with `npm run dev` and follow the 5-minute demo script above!**

Built with ❤️ for the Solana MCP Hackathon