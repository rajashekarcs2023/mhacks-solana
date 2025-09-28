# 🤖 Claude Desktop Integration Guide

This guide shows you how to connect **Trader's Co-Pilot** to Claude Desktop as an MCP server.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Test MCP Server
```bash
# Test the MCP server functionality
node test-mcp-client.js
```

### 3. Configure Claude Desktop

**Option A: Automatic Setup**
Copy the configuration from `claude-desktop-config.json` to your Claude Desktop configuration:

**macOS:**
```bash
cp claude-desktop-config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Option B: Manual Setup**
Add this to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "traders-copilot": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/path/to/your/mhacks-solana",
      "env": {
        "DEVNET_RPC": "https://api.devnet.solana.com"
      }
    }
  }
}
```

**⚠️ Important:** Update the `cwd` path to match your actual project directory.

### 4. Restart Claude Desktop
After updating the configuration, restart Claude Desktop to load the new MCP server.

## 🛠️ Available Tools in Claude

Once connected, Claude will have access to these Solana tools:

### 📊 **get_balance**
Check SOL balance for any address on Devnet
```
"What's the balance of address 11111111111111111111111111111112?"
```

### 🔍 **explain_tx** 
Analyze transactions with risk flags and plain English explanations
```
"Explain this transaction: [paste Devnet transaction signature]"
```

### 💹 **market_buy_sim**
Preview trades safely with slippage protection
```
"What if I buy $50 worth of SOL with 0.5% slippage?"
```

### 💸 **airdrop_and_tip**
Send small SOL tips on Devnet for demonstration
```
"Send 0.01 SOL to address [recipient address] on Devnet"
```

## 🎪 Example Conversation Flow

Here's what you can do with Claude once connected:

**You:** "What's in the Solana system program address?"

**Claude:** *[uses get_balance tool]* "The system program address (11111111111111111111111111111112) has 218.677678 SOL. This is a special system account that handles basic operations like transfers and account creation."

**You:** "What would happen if I tried to buy $100 worth of SOL with high slippage?"

**Claude:** *[uses market_buy_sim tool]* "If you tried to buy $100 worth of SOL with high slippage, the system would prevent it. Our safety guardrails cap slippage at 1.5% (150 basis points) to protect you from excessive losses. Would you like me to show you a safe simulation instead?"

**You:** "Show me a safe simulation for buying $100 of SOL"

**Claude:** *[uses market_buy_sim tool]* "Here's a safe simulation: You would buy approximately 0.6667 SOL for $100 with ≤0.50% slippage on Devnet. The minimum fill would be 0.6633 SOL at $150 per SOL. Transaction fee estimate: 0.000005 SOL."

## 🔧 Troubleshooting

### MCP Server Not Connecting
1. **Check Node.js version**: Ensure you have Node.js 18+
2. **Verify dependencies**: Run `npm install` in the project directory
3. **Test server independently**: Run `npm run mcp` to see if it starts
4. **Check paths**: Ensure the `cwd` in your Claude config matches your project path

### Tools Not Appearing
1. **Restart Claude Desktop** after configuration changes
2. **Check configuration syntax**: Ensure your JSON is valid
3. **View Claude logs**: Check Claude Desktop's console for error messages

### Solana Connection Issues
- **Devnet RPC**: The server uses Solana Devnet by default for safety
- **Network timeouts**: Try again if you get connection errors
- **Address validation**: Ensure addresses are valid base58 Solana addresses

## 🛡️ Safety Features

- **Devnet Only**: All operations happen on Devnet, no real funds at risk
- **Slippage Protection**: Maximum 1.5% slippage to prevent excessive losses  
- **Input Validation**: All parameters validated before processing
- **No Private Keys**: Server never handles user private keys
- **Error Handling**: Clear error messages for troubleshooting

## 🎯 Demo Commands for Judges

Perfect commands to show off the integration:

1. **"Check the balance of the system program address"**
2. **"What would happen if I buy $50 of SOL with 0.5% slippage?"**
3. **"Try to buy SOL with 3% slippage"** (shows safety guardrails)
4. **"Send 0.01 SOL to [any Devnet address]"** (shows execution capability)

## 🚀 Next Steps

This MCP integration demonstrates the future of AI-driven finance:

- **Any AI Agent** can now interact with Solana safely
- **Natural Language** queries translate to blockchain operations
- **Built-in Safety** prevents costly mistakes
- **Extensible Platform** for advanced DeFi strategies

**Ready to revolutionize how AI interacts with blockchain!** 🌟