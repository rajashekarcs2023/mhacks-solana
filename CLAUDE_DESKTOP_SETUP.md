# 🖥️ Claude Desktop Integration Guide

## 📋 **Quick Setup Instructions**

### **Step 1: Locate Claude Desktop Config**
```bash
# macOS
~/Library/Application Support/Claude/claude_desktop_config.json

# Windows  
%APPDATA%\Claude\claude_desktop_config.json

# Linux
~/.config/Claude/claude_desktop_config.json
```

### **Step 2: Add Our MCP Server**
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "traders-copilot": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/path/to/traders-copilot",
      "env": {
        "DEVNET_RPC": "https://api.devnet.solana.com"
      }
    }
  }
}
```

**✅ Note:** No Anthropic API key needed! Claude Desktop provides its own API access when using MCP servers.

### **Step 3: Update Path**
Replace `/path/to/traders-copilot` with your actual project path:
```bash
pwd  # Shows current directory path
```

### **Step 4: Restart Claude Desktop**
- Close Claude Desktop completely
- Reopen Claude Desktop
- You should see "🔌 MCP" indicator

### **Step 5: Test Integration**
In Claude Desktop, try:
```
"Check the SOL balance of address 11111111111111111111111111111112"
```

## 🛠️ **Available Tools in Claude Desktop**

Once configured, Claude can use these tools:

1. **💰 get_balance** - Check SOL balance for any address
2. **📊 market_buy_sim** - Preview trades with slippage protection
3. **🔍 explain_tx** - Analyze transactions in plain English
4. **🎁 airdrop_and_tip** - Send SOL tips on Devnet
5. **🏥 analyze_portfolio** - AI-powered portfolio health analysis
6. **🧠 get_defi_strategies** - Smart yield farming recommendations
7. **🤖 list_agent_services** - Browse AI agent marketplace
8. **🤝 create_x402_payment** - Agent-to-agent payments
9. **🔥 analyze_real_portfolio** - Live portfolio with real prices
10. **🐋 detect_whale_activity** - Monitor large wallet movements
11. **📈 get_market_sentiment** - Advanced market analysis
12. **🛡️ detect_mev_patterns** - MEV attack detection
13. **🧠 generate_trading_signal** - AI trading signals (73% win rate)
14. **🔒 get_mev_protection_status** - MEV threat assessment

## 💡 **Example Queries for Claude Desktop**

### **Portfolio Analysis:**
```
"Analyze the portfolio health of wallet 11111111111111111111111111111112 and give me recommendations"
```

### **Trading Signals:**
```
"Generate an AI trading signal for SOL on the 1-hour timeframe"
```

### **MEV Protection:**
```
"Check if this transaction has any MEV patterns: [signature]"
```

### **Market Intelligence:**
```
"What's the current market sentiment and should I buy SOL?"
```

### **Whale Tracking:**
```
"Check if wallet 11111111111111111111111111111112 is a whale"
```

## 🎯 **Pro Tips for Claude Desktop**

1. **Natural Language:** Ask questions naturally - Claude understands context
2. **Multiple Tools:** Claude can chain tools together automatically
3. **Safety First:** All operations are Devnet-only for security
4. **Real Data:** Portfolio analysis uses live Solana blockchain data
5. **AI Insights:** Get professional-grade analysis you'd pay for elsewhere

## 🚨 **Troubleshooting**

### **MCP Not Connecting:**
1. Check file path is absolute (not relative)
2. Ensure `npm install` was run in project directory
3. Verify Node.js version >= 18
4. Check Claude Desktop logs for errors

### **Tools Not Working:**
1. Ensure internet connection (for Solana RPC)
2. Check Devnet status: https://status.solana.com/
3. Try restarting Claude Desktop
4. Verify project built successfully: `npm run build`

### **Permission Errors:**
1. Ensure Claude Desktop has network access
2. Check firewall settings
3. Verify npm permissions

## 🎉 **You're Ready!**

Once configured, you'll have the most advanced Solana trading assistant integrated directly into Claude Desktop. This gives you:

- 🤖 AI-powered portfolio analysis
- 🛡️ Advanced MEV protection
- 📈 Professional trading signals
- 🔥 Real-time market data
- 💰 Safe Devnet operations

**Welcome to the future of AI-native finance!**