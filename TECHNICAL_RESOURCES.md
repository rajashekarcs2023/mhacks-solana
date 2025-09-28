# 📚 TECHNICAL DOCUMENTATION & RESOURCES

## 🔗 Essential Documentation Links

### Core Solana Development
- **[Solana CLI & Anchor Installation](https://solana.com/docs/intro/installation)** - Quick setup guide
- **[Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)** - Official JavaScript SDK
- **[Solana RPC Methods](https://docs.solana.com/api/http)** - Complete RPC API reference
- **[Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet)** - Transaction verification

### Transaction Analysis & Parsing
- **[getParsedTransaction - Solana Tracker](https://docs.solanatracker.io/solana-rpc/methods/getParsedTransaction)** - Detailed parsing guide
- **[getParsedTransaction - QuickNode](https://www.quicknode.com/docs/solana/getParsedTransaction)** - Alternative reference
- **[Helius Enhanced Transactions](https://www.helius.dev/docs/enhanced-transactions)** - Human-readable summaries

### MCP (Model Context Protocol)
- **[MCP Specification](https://modelcontextprotocol.io/specification/latest)** - Official protocol spec
- **[MCP Quickstart Guide](https://modelcontextprotocol.io/quickstart/user)** - Implementation guide

### Advanced Features (Stretch Goals)
- **[Solana Actions & Blinks](https://solana.com/developers/guides/advanced/actions)** - One-click approvals
- **[Pyth Network Price Feeds](https://docs.pyth.network/price-feeds/price-feeds)** - Real-time pricing
- **[x402 Payment Protocol](https://github.com/coinbase/x402)** - Agent-to-agent payments

---

## 📦 Required Dependencies

### Core Dependencies
```json
{
  "@solana/web3.js": "^1.93.0",    // Solana blockchain interactions
  "dotenv": "^16.4.5",             // Environment configuration
  "express": "^4.19.2",            // HTTP server framework
  "zod": "^3.23.8"                 // Input validation schemas
}
```

### Development Dependencies
```json
{
  "@types/express": "^4.17.21",    // TypeScript definitions
  "ts-node": "^10.9.2",            // TypeScript execution
  "typescript": "^5.6.3"           // TypeScript compiler
}
```

### Optional Enhancements
```json
{
  "@pythnetwork/client": "^2.20.0", // Price feeds (stretch goal)
  "cors": "^2.8.5",                 // CORS handling if needed
  "helmet": "^7.1.0"                // Security headers
}
```

---

## 🛠️ Development Environment Setup

### Prerequisites
- **Node.js 18+** - Runtime environment
- **npm or yarn** - Package manager
- **TypeScript** - Language and compiler
- **Solana CLI** - For Devnet interaction (optional)

### Environment Variables
```bash
# .env file
DEVNET_RPC=https://api.devnet.solana.com
PORT=8787
# Optional: Persistent demo signer (Devnet only)
DEMO_SECRET=[1,2,3,...64] # JSON array of secret key bytes
```

### Project Structure
```
solana-mcp-lite/
├── server/
│   ├── index.ts           # Main HTTP server
│   ├── guards.ts          # Safety guardrails
│   ├── explain.ts         # Transaction explanation logic
│   ├── prices.ts          # Price fetching (mock/real)
│   └── types.ts           # TypeScript interfaces
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── .env.example           # Environment template
└── README.md              # Setup and usage guide
```

---

## 🧪 Testing Resources

### Devnet Test Addresses
**Demo Wallet**: Generate with `Keypair.generate()` or use persistent one
**Test Recipient**: Use any valid Devnet address for tip testing

### Sample Devnet Transactions
- **Simple Transfer**: Look up recent transfers on Devnet explorer
- **Program Interaction**: DeFi protocol interactions for testing
- **Failed Transaction**: For error handling validation

### Curl Testing Commands
```bash
# Balance check
curl -sX POST localhost:8787/tools/get_balance \
  -H "content-type: application/json" \
  -d '{"address":"DEVNET_ADDRESS_HERE"}' | jq

# Transaction explanation
curl -sX POST localhost:8787/tools/explain_tx \
  -H "content-type: application/json" \
  -d '{"signature":"DEVNET_TX_SIGNATURE"}' | jq

# Market buy simulation
curl -sX POST localhost:8787/tools/market_buy_sim \
  -H "content-type: application/json" \
  -d '{"mint":"SOL","usdAmount":50,"slippageBps":50}' | jq

# Airdrop and tip (optional)
curl -sX POST localhost:8787/tools/airdrop_and_tip \
  -H "content-type: application/json" \
  -d '{"to":"RECIPIENT_ADDRESS","sol":0.01}' | jq
```

---

## 🔍 Key Code Patterns

### Connection Setup
```typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";

const RPC = process.env.DEVNET_RPC || clusterApiUrl("devnet");
const connection = new Connection(RPC, "confirmed");
```

### Balance Checking
```typescript
const balance = await connection.getBalance(new PublicKey(address));
const sol = balance / LAMPORTS_PER_SOL;
```

### Transaction Parsing
```typescript
const parsed = await connection.getParsedTransaction(signature, {
  maxSupportedTransactionVersion: 0
});
```

### Safety Guardrails
```typescript
function enforceDevnet(network?: string, mode?: string) {
  if (network && network !== "devnet" && mode !== "i_understand_the_risk") {
    throw new Error("Mainnet disabled. Use Devnet or explicit override.");
  }
}
```

### Error Handling
```typescript
app.post("/tools/endpoint", async (req, res) => {
  try {
    // Tool logic here
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## 🎯 Implementation Checklist

### Core Functionality
- [ ] HTTP server with Express and JSON middleware
- [ ] Solana connection to Devnet with error handling
- [ ] Zod schemas for input validation
- [ ] Structured JSON responses for all endpoints
- [ ] Comprehensive error handling with clear messages

### Safety Features
- [ ] Devnet-only enforcement with override capability
- [ ] Slippage limits and validation
- [ ] No private key handling (demo signer only)
- [ ] Clear risk flags in transaction explanations

### API Endpoints
- [ ] `POST /tools/get_balance` - Address balance lookup
- [ ] `POST /tools/explain_tx` - Transaction analysis
- [ ] `POST /tools/market_buy_sim` - Trade preview
- [ ] `POST /tools/airdrop_and_tip` - Demo execution (optional)

### Documentation
- [ ] README with setup instructions
- [ ] API documentation with request/response examples
- [ ] Demo script with exact curl commands
- [ ] Environment configuration guide

### Testing
- [ ] All endpoints tested with valid inputs
- [ ] Error handling tested with invalid inputs
- [ ] Devnet safety measures validated
- [ ] Demo flow rehearsed multiple times

---

## 🚀 Optimization Tips

### Performance
- Cache connection object (don't recreate per request)
- Use connection commitment level "confirmed" for balance
- Implement basic rate limiting if needed
- Keep responses small and structured

### Error Handling
- Validate all inputs with Zod schemas
- Return consistent error response format
- Log errors for debugging but don't expose internals
- Handle network timeouts gracefully

### Security
- Never log or store private keys
- Validate all addresses before use
- Sanitize error messages for user display
- Use environment variables for sensitive config

### Demo Preparation
- Test with multiple different transactions
- Prepare backup examples in case primary fails
- Verify all curl commands work before demo
- Have network explorer links ready for verification

---

## 📖 Reference Materials

### Solana Concepts
- **Lamports**: 1 SOL = 1,000,000,000 lamports
- **Public Key**: 32-byte address in base58 encoding
- **Transaction**: Signed instruction set with blockhash
- **Program**: On-chain executable (smart contract equivalent)

### MCP Tool Design
- **Structured Input**: JSON with required/optional fields
- **Typed Output**: Consistent response format with error handling
- **LLM-Friendly**: Plain English summaries with structured data
- **Atomic Operations**: Each tool does one thing well

### Best Practices
- **Safety First**: Default to safest option (Devnet)
- **Clear Errors**: Helpful messages for debugging
- **Performance**: Fast responses for good UX
- **Documentation**: Self-explanatory APIs and responses

This resource collection provides everything needed to build a winning Solana MCP server efficiently and safely.