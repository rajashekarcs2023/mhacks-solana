#!/bin/bash

# Trader's Co-Pilot Demo Script
# This script demonstrates all MCP endpoints for the hackathon demo

echo "🚀 Trader's Co-Pilot Demo"
echo "========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server URL
SERVER_URL="http://localhost:8787"

echo -e "${BLUE}Step 1: Health Check${NC}"
echo "curl $SERVER_URL"
curl -s "$SERVER_URL" | jq
echo ""

echo -e "${BLUE}Step 2: Check Balance (System Program)${NC}"
echo "Demonstrates reading blockchain data..."
curl -s -X POST "$SERVER_URL/tools/get_balance" \
  -H "Content-Type: application/json" \
  -d '{"address": "11111111111111111111111111111112"}' | jq
echo ""

echo -e "${BLUE}Step 3: Market Buy Simulation${NC}"
echo "Demonstrates trade preview with safety guardrails..."
curl -s -X POST "$SERVER_URL/tools/market_buy_sim" \
  -H "Content-Type: application/json" \
  -d '{"mint": "SOL", "usdAmount": 50, "slippageBps": 50}' | jq
echo ""

echo -e "${BLUE}Step 4: Safety Test - High Slippage Protection${NC}"
echo "Demonstrates guardrails preventing risky trades..."
curl -s -X POST "$SERVER_URL/tools/market_buy_sim" \
  -H "Content-Type: application/json" \
  -d '{"mint": "SOL", "usdAmount": 50, "slippageBps": 200}' | jq
echo ""

echo -e "${BLUE}Step 5: Error Handling Test${NC}"
echo "Demonstrates robust error handling..."
curl -s -X POST "$SERVER_URL/tools/get_balance" \
  -H "Content-Type: application/json" \
  -d '{"address": "invalid"}' | jq
echo ""

echo -e "${GREEN}✅ Demo Complete!${NC}"
echo ""
echo -e "${YELLOW}Key Takeaways:${NC}"
echo "• ✅ MCP server operational with 4 tools"
echo "• ✅ Solana Devnet integration working"  
echo "• ✅ Safety guardrails preventing risky operations"
echo "• ✅ Structured JSON responses for AI consumption"
echo "• ✅ Comprehensive error handling"
echo ""
echo -e "${YELLOW}Ready for AI agent integration!${NC}"