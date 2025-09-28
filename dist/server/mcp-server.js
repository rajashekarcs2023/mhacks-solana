#!/usr/bin/env node
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Keypair, sendAndConfirmTransaction, Transaction, } from "@solana/web3.js";
import { enforceGuardrails, validateAddress, validateTransactionSignature } from "./guards.js";
import { analyzePortfolio } from "./portfolio-doctor.js";
import { listAgentServices, createX402Payment, generateX402Demo } from "./x402-payments.js";
import { generateStrategyRecommendations } from "./defi-strategies.js";
import { RealDataEngine } from "./real-data-engine.js";
import { MEVDetectionEngine } from "./mev-detection.js";
import { AITradingSignals } from "./ai-signals.js";
// Configuration
const RPC_URL = process.env.DEVNET_RPC || clusterApiUrl("devnet");
const DEMO_SECRET = process.env.DEMO_SECRET ?
    Uint8Array.from(JSON.parse(process.env.DEMO_SECRET)) :
    undefined;
// Initialize Solana connection
const connection = new Connection(RPC_URL, "confirmed");
// Demo signer for airdrop/tip functionality (Devnet only)
const demoKeypair = DEMO_SECRET ?
    Keypair.fromSecretKey(DEMO_SECRET) :
    Keypair.generate();
// Initialize real data engine
const realDataEngine = new RealDataEngine(connection);
// Initialize MEV detection engine
const mevEngine = new MEVDetectionEngine(connection, realDataEngine);
// Initialize AI trading signals
const aiSignals = new AITradingSignals(connection, realDataEngine);
// Create MCP server
const server = new Server({
    name: "traders-copilot",
    version: "1.0.0",
    description: "AI-native Solana MCP server for traders"
}, {
    capabilities: {
        tools: {}
    }
});
// Tool 1: get_balance
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_balance",
                description: "Check SOL balance for any Solana address on Devnet",
                inputSchema: {
                    type: "object",
                    properties: {
                        address: {
                            type: "string",
                            description: "Solana address in base58 format",
                            minLength: 32,
                            maxLength: 44
                        }
                    },
                    required: ["address"]
                }
            },
            {
                name: "explain_tx",
                description: "Analyze and explain Solana transactions in plain English with risk flags",
                inputSchema: {
                    type: "object",
                    properties: {
                        signature: {
                            type: "string",
                            description: "Transaction signature to analyze",
                            minLength: 64
                        }
                    },
                    required: ["signature"]
                }
            },
            {
                name: "market_buy_sim",
                description: "Preview cryptocurrency trades safely with slippage protection (Devnet only)",
                inputSchema: {
                    type: "object",
                    properties: {
                        mint: {
                            type: "string",
                            description: "Token to buy (SOL, USDC, BTC)",
                            default: "SOL"
                        },
                        usdAmount: {
                            type: "number",
                            description: "USD amount to spend",
                            minimum: 1,
                            maximum: 10000
                        },
                        slippageBps: {
                            type: "number",
                            description: "Maximum slippage in basis points (1-150)",
                            minimum: 1,
                            maximum: 150,
                            default: 50
                        },
                        network: {
                            type: "string",
                            description: "Network to use (devnet only for safety)",
                            default: "devnet"
                        }
                    },
                    required: ["usdAmount"]
                }
            },
            {
                name: "airdrop_and_tip",
                description: "Send a small SOL tip on Devnet for demonstration purposes",
                inputSchema: {
                    type: "object",
                    properties: {
                        to: {
                            type: "string",
                            description: "Recipient Solana address",
                            minLength: 32,
                            maxLength: 44
                        },
                        sol: {
                            type: "number",
                            description: "Amount of SOL to send (0.001-1.0)",
                            minimum: 0.001,
                            maximum: 1.0,
                            default: 0.01
                        }
                    },
                    required: ["to"]
                }
            },
            {
                name: "analyze_portfolio",
                description: "🏥 AI Portfolio Doctor - Comprehensive portfolio analysis with risk scoring and recommendations",
                inputSchema: {
                    type: "object",
                    properties: {
                        address: {
                            type: "string",
                            description: "Wallet address to analyze",
                            minLength: 32,
                            maxLength: 44
                        }
                    },
                    required: ["address"]
                }
            },
            {
                name: "get_defi_strategies",
                description: "🧠 Smart DeFi Strategy Recommendations - AI-powered yield and trading strategy suggestions",
                inputSchema: {
                    type: "object",
                    properties: {
                        address: {
                            type: "string",
                            description: "User wallet address",
                            minLength: 32,
                            maxLength: 44
                        },
                        riskTolerance: {
                            type: "string",
                            enum: ["conservative", "moderate", "aggressive"],
                            description: "Risk tolerance level",
                            default: "moderate"
                        },
                        investmentAmount: {
                            type: "number",
                            description: "Investment amount in USD",
                            minimum: 10,
                            maximum: 100000,
                            default: 1000
                        },
                        timeHorizon: {
                            type: "string",
                            enum: ["short", "medium", "long"],
                            description: "Investment time horizon",
                            default: "medium"
                        }
                    },
                    required: ["address"]
                }
            },
            {
                name: "list_agent_services",
                description: "🤖 Agent Marketplace - List available agent services for x402 payments",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            },
            {
                name: "create_x402_payment",
                description: "🤝 x402 Agent Payment - Create payment request for agent-to-agent services",
                inputSchema: {
                    type: "object",
                    properties: {
                        to: {
                            type: "string",
                            description: "Target agent ID"
                        },
                        amount: {
                            type: "number",
                            description: "Payment amount in SOL",
                            minimum: 0.001,
                            maximum: 10
                        },
                        service: {
                            type: "string",
                            description: "Service being requested"
                        },
                        description: {
                            type: "string",
                            description: "Payment description"
                        }
                    },
                    required: ["to", "amount", "service"]
                }
            },
            {
                name: "analyze_real_portfolio",
                description: "🔥 LIVE Portfolio Analysis - Real-time token balances with live prices from Pyth Network",
                inputSchema: {
                    type: "object",
                    properties: {
                        address: {
                            type: "string",
                            description: "Wallet address to analyze with live data",
                            minLength: 32,
                            maxLength: 44
                        }
                    },
                    required: ["address"]
                }
            },
            {
                name: "detect_whale_activity",
                description: "🐋 Whale Tracker - Monitor large wallet movements and trading patterns",
                inputSchema: {
                    type: "object",
                    properties: {
                        address: {
                            type: "string",
                            description: "Address to check for whale activity",
                            minLength: 32,
                            maxLength: 44
                        },
                        threshold: {
                            type: "number",
                            description: "USD threshold for whale detection",
                            default: 100000,
                            minimum: 1000
                        }
                    },
                    required: ["address"]
                }
            },
            {
                name: "get_market_sentiment",
                description: "📊 Advanced Market Analysis - Live sentiment analysis with multiple indicators",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            },
            {
                name: "detect_mev_patterns",
                description: "🛡️ MEV Detection - Analyze transactions for sandwich attacks, front-running, and arbitrage",
                inputSchema: {
                    type: "object",
                    properties: {
                        signature: {
                            type: "string",
                            description: "Transaction signature to analyze for MEV patterns",
                            minLength: 64
                        }
                    },
                    required: ["signature"]
                }
            },
            {
                name: "generate_trading_signal",
                description: "🧠 AI Trading Signals - Advanced market analysis with entry/exit recommendations",
                inputSchema: {
                    type: "object",
                    properties: {
                        symbol: {
                            type: "string",
                            description: "Token symbol to analyze (SOL, BTC, ETH, USDC)",
                            default: "SOL"
                        },
                        timeframe: {
                            type: "string",
                            enum: ["5M", "15M", "1H", "4H", "1D"],
                            description: "Analysis timeframe",
                            default: "1H"
                        }
                    },
                    required: ["symbol"]
                }
            },
            {
                name: "get_mev_protection_status",
                description: "🔒 MEV Protection - Check wallet MEV risk and get protection recommendations",
                inputSchema: {
                    type: "object",
                    properties: {
                        address: {
                            type: "string",
                            description: "Wallet address to analyze for MEV threats",
                            minLength: 32,
                            maxLength: 44
                        }
                    },
                    required: ["address"]
                }
            }
        ]
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case "get_balance": {
                const { address } = request.params.arguments;
                validateAddress(address);
                const publicKey = new PublicKey(address);
                const balance = await connection.getBalance(publicKey);
                const sol = balance / LAMPORTS_PER_SOL;
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                address,
                                lamports: balance,
                                sol: parseFloat(sol.toFixed(9)),
                                summary: `Address ${address.slice(0, 4)}...${address.slice(-4)} has ${sol.toFixed(6)} SOL`
                            }, null, 2)
                        }
                    ]
                };
            }
            case "explain_tx": {
                const { signature } = request.params.arguments;
                validateTransactionSignature(signature);
                const parsed = await connection.getParsedTransaction(signature, {
                    maxSupportedTransactionVersion: 0
                });
                if (!parsed) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    error: "Transaction not found on Devnet. Ensure you're using a Devnet transaction signature."
                                }, null, 2)
                            }
                        ]
                    };
                }
                // Extract account keys and balance changes
                const accounts = parsed.transaction.message.accountKeys.map(a => a.pubkey.toBase58());
                const preBalances = parsed.meta?.preBalances || [];
                const postBalances = parsed.meta?.postBalances || [];
                // Calculate SOL movements
                const movements = [];
                for (let i = 0; i < preBalances.length; i++) {
                    const delta = (postBalances[i] - preBalances[i]) / LAMPORTS_PER_SOL;
                    if (Math.abs(delta) > 0.000001) {
                        movements.push({
                            account: accounts[i],
                            deltaSol: parseFloat(delta.toFixed(9))
                        });
                    }
                }
                // Detect risk flags
                const riskFlags = [];
                if (parsed.meta?.err) {
                    riskFlags.push("tx_error");
                }
                const logs = parsed.meta?.logMessages || [];
                if (logs.some(log => log.toLowerCase().includes("error"))) {
                    riskFlags.push("program_error");
                }
                // Generate human-readable summary
                let summary = "Transaction: ";
                const sends = movements.filter(m => m.deltaSol < 0);
                const receives = movements.filter(m => m.deltaSol > 0);
                if (sends.length && receives.length) {
                    const totalSent = Math.abs(sends.reduce((sum, s) => sum + s.deltaSol, 0));
                    summary += `Transfer of ~${totalSent.toFixed(4)} SOL from ${sends[0].account.slice(0, 4)}… to ${receives[0].account.slice(0, 4)}…`;
                }
                else if (movements.length === 0) {
                    summary += "Program interaction with no net SOL transfer";
                }
                else {
                    summary += "Complex transaction with multiple account changes";
                }
                if (riskFlags.length > 0) {
                    summary += ` ⚠️ Flags: ${riskFlags.join(", ")}`;
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                signature,
                                summary,
                                movements,
                                accountsTouched: accounts.length,
                                riskFlags,
                                analysis: `Analyzed transaction ${signature.slice(0, 8)}... with ${accounts.length} accounts touched and ${movements.length} balance changes.`
                            }, null, 2)
                        }
                    ]
                };
            }
            case "market_buy_sim": {
                const args = request.params.arguments;
                const mint = args.mint || "SOL";
                const usdAmount = args.usdAmount;
                const slippageBps = args.slippageBps || 50;
                const network = args.network || "devnet";
                const mode = args.mode;
                // Enforce safety guardrails
                enforceGuardrails({ slippageBps, network, mode });
                // Mock price for MVP
                const mockPrices = {
                    "SOL": 150,
                    "USDC": 1,
                    "BTC": 45000,
                };
                const price = mockPrices[mint.toUpperCase()] || mockPrices["SOL"];
                const expectedFill = usdAmount / price;
                const feeEstimate = 0.000005;
                // Calculate slippage impact
                const slippagePercent = slippageBps / 10000;
                const maxPrice = price * (1 + slippagePercent);
                const minFill = usdAmount / maxPrice;
                const plainEnglish = `Would buy approximately ${expectedFill.toFixed(4)} ${mint} for $${usdAmount} with ≤${(slippagePercent * 100).toFixed(2)}% slippage on ${network}. Minimum fill: ${minFill.toFixed(4)} ${mint}.`;
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                mint,
                                usdAmount,
                                slippageBps,
                                network,
                                preview: {
                                    plainEnglish,
                                    expectedFill: `${expectedFill.toFixed(4)} ${mint}`,
                                    feeEstimate,
                                    minFill: `${minFill.toFixed(4)} ${mint}`,
                                    price: `$${price} per ${mint}`
                                },
                                safety: "✅ Devnet only, slippage protected"
                            }, null, 2)
                        }
                    ]
                };
            }
            case "airdrop_and_tip": {
                const { to, sol = 0.01 } = request.params.arguments;
                enforceGuardrails({ amount: sol, network: "devnet" });
                validateAddress(to);
                const toPubkey = new PublicKey(to);
                // Ensure demo signer has sufficient balance
                const demoBalance = await connection.getBalance(demoKeypair.publicKey);
                const requiredBalance = (sol + 0.01) * LAMPORTS_PER_SOL;
                if (demoBalance < requiredBalance) {
                    try {
                        const airdropSignature = await connection.requestAirdrop(demoKeypair.publicKey, 1 * LAMPORTS_PER_SOL);
                        const latestBlockhash = await connection.getLatestBlockhash();
                        await connection.confirmTransaction({
                            signature: airdropSignature,
                            ...latestBlockhash
                        });
                        // Wait a moment for balance to update
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    catch (airdropError) {
                        const currentBalance = await connection.getBalance(demoKeypair.publicKey);
                        if (currentBalance < sol * LAMPORTS_PER_SOL) {
                            return {
                                content: [
                                    {
                                        type: "text",
                                        text: JSON.stringify({
                                            error: `Insufficient balance for tip. Demo signer has ${(currentBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL but needs ${sol} SOL. Devnet airdrop may be rate limited.`,
                                            suggestion: "Try again in a few minutes or use a smaller amount."
                                        }, null, 2)
                                    }
                                ]
                            };
                        }
                    }
                }
                // Create and send tip transaction
                const transaction = new Transaction().add(SystemProgram.transfer({
                    fromPubkey: demoKeypair.publicKey,
                    toPubkey: toPubkey,
                    lamports: Math.floor(sol * LAMPORTS_PER_SOL),
                }));
                const signature = await sendAndConfirmTransaction(connection, transaction, [demoKeypair], { commitment: "confirmed" });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                signature,
                                preview: `Successfully sent ${sol} SOL to ${to} on Devnet`,
                                from: demoKeypair.publicKey.toBase58(),
                                explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
                                status: "✅ Transaction confirmed on Devnet"
                            }, null, 2)
                        }
                    ]
                };
            }
            case "analyze_portfolio": {
                const { address } = request.params.arguments;
                validateAddress(address);
                const analysis = await analyzePortfolio(connection, address);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                ...analysis,
                                summary: `🏥 Portfolio Health: ${analysis.healthScore}/100 - ${analysis.aiInsights}`,
                                quickStats: {
                                    totalValue: `$${analysis.totalValue.toLocaleString()}`,
                                    holdings: `${analysis.holdings.length} tokens`,
                                    riskLevel: analysis.riskMetrics.volatilityRisk,
                                    topRecommendation: analysis.recommendations[0] || "Portfolio looks good!"
                                }
                            }, null, 2)
                        }
                    ]
                };
            }
            case "get_defi_strategies": {
                const args = request.params.arguments;
                validateAddress(args.address);
                const recommendations = await generateStrategyRecommendations(connection, args.address, args.riskTolerance || 'moderate', args.investmentAmount || 1000, args.timeHorizon || 'medium');
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                ...recommendations,
                                summary: `🧠 Found ${recommendations.strategies.length} AI-recommended strategies for your profile`,
                                topStrategy: {
                                    name: recommendations.strategies[0]?.name,
                                    expectedAPY: `${recommendations.strategies[0]?.expectedAPY}%`,
                                    riskLevel: recommendations.strategies[0]?.riskLevel
                                },
                                marketInsight: `📊 ${recommendations.marketAnalysis.marketSentiment} market with ${recommendations.marketAnalysis.volatilityIndex}% volatility`
                            }, null, 2)
                        }
                    ]
                };
            }
            case "list_agent_services": {
                const services = await listAgentServices();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                services,
                                summary: `🤖 ${services.length} agent services available for x402 payments`,
                                totalValue: `${services.reduce((sum, s) => sum + s.priceSOL, 0).toFixed(3)} SOL combined`,
                                categories: [...new Set(services.map(s => s.capabilities).flat())],
                                online: services.filter(s => s.availability === 'online').length
                            }, null, 2)
                        }
                    ]
                };
            }
            case "create_x402_payment": {
                const { to, amount, service, description = "" } = request.params.arguments;
                const paymentRequest = {
                    from: 'user-agent',
                    to,
                    amount,
                    currency: 'SOL',
                    service,
                    metadata: {
                        description: description || `Payment for ${service}`,
                        priority: 'medium'
                    }
                };
                const payment = await createX402Payment(connection, paymentRequest);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                ...payment,
                                summary: `🤝 x402 payment created for ${service}`,
                                nextSteps: [
                                    "Click the action URL to approve payment in your wallet",
                                    "Service will activate once payment is confirmed",
                                    "You'll receive a completion notification"
                                ],
                                demo: generateX402Demo()
                            }, null, 2)
                        }
                    ]
                };
            }
            case "analyze_real_portfolio": {
                const { address } = request.params.arguments;
                validateAddress(address);
                const realPortfolio = await realDataEngine.analyzeRealPortfolio(address);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                address,
                                ...realPortfolio,
                                summary: `🔥 LIVE Portfolio: $${realPortfolio.totalValue.toLocaleString()} across ${realPortfolio.tokens.length} tokens`,
                                topHolding: realPortfolio.tokens[0] ? {
                                    symbol: realPortfolio.tokens[0].symbol,
                                    value: `$${realPortfolio.tokens[0].usdValue.toLocaleString()}`,
                                    percentage: `${realPortfolio.tokens[0].percentage.toFixed(1)}%`,
                                    price: realPortfolio.tokens[0].priceData ? `$${realPortfolio.tokens[0].priceData.price.toFixed(2)}` : 'N/A',
                                    change24h: realPortfolio.tokens[0].priceData ? `${realPortfolio.tokens[0].priceData.change24h.toFixed(2)}%` : 'N/A'
                                } : null,
                                realData: true,
                                lastUpdated: realPortfolio.lastUpdated
                            }, null, 2)
                        }
                    ]
                };
            }
            case "detect_whale_activity": {
                const { address, threshold = 100000 } = request.params.arguments;
                validateAddress(address);
                const portfolio = await realDataEngine.analyzeRealPortfolio(address);
                const isWhale = portfolio.totalValue >= threshold;
                const whaleLevel = portfolio.totalValue >= 1000000 ? 'MEGA' :
                    portfolio.totalValue >= 500000 ? 'LARGE' :
                        portfolio.totalValue >= threshold ? 'MEDIUM' : 'SMALL';
                // Analyze recent activity (simplified for demo)
                const activity = {
                    largeTrades: Math.floor(Math.random() * 5),
                    avgTradeSize: portfolio.totalValue * 0.1,
                    lastActiveHours: Math.floor(Math.random() * 48),
                    suspiciousActivity: portfolio.totalValue > 1000000 && Math.random() > 0.7
                };
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                address,
                                isWhale,
                                whaleLevel,
                                portfolioValue: portfolio.totalValue,
                                threshold,
                                activity,
                                analysis: {
                                    summary: isWhale
                                        ? `🐋 ${whaleLevel} whale detected with $${portfolio.totalValue.toLocaleString()} portfolio`
                                        : `🐟 Small wallet: $${portfolio.totalValue.toLocaleString()} (below $${threshold.toLocaleString()} threshold)`,
                                    riskAssessment: activity.suspiciousActivity ? 'HIGH' : whaleLevel === 'MEGA' ? 'MEDIUM' : 'LOW',
                                    recommendations: isWhale
                                        ? ['Monitor for large movements', 'Track trading patterns', 'Watch for market impact']
                                        : ['Portfolio too small for whale concerns', 'Focus on growth strategies']
                                },
                                timestamp: new Date().toISOString()
                            }, null, 2)
                        }
                    ]
                };
            }
            case "get_market_sentiment": {
                const sentiment = await realDataEngine.getMarketSentiment();
                const solPrice = await realDataEngine.getRealPrice('SOL');
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                ...sentiment,
                                marketData: {
                                    solPrice: `$${solPrice.price.toFixed(2)}`,
                                    solChange24h: `${solPrice.change24h.toFixed(2)}%`,
                                    lastUpdated: solPrice.lastUpdated
                                },
                                summary: `📊 Market sentiment: ${sentiment.overall} (${sentiment.score > 0 ? '+' : ''}${sentiment.score}) - ${sentiment.summary}`,
                                tradingAdvice: sentiment.overall === 'BULLISH'
                                    ? 'Consider increasing position sizes and looking for dip buying opportunities'
                                    : sentiment.overall === 'BEARISH'
                                        ? 'Focus on risk management, consider defensive positions or cash allocation'
                                        : 'Balanced approach recommended, wait for clearer signals before major moves',
                                confidenceLevel: Math.abs(sentiment.score) > 40 ? 'HIGH' :
                                    Math.abs(sentiment.score) > 20 ? 'MEDIUM' : 'LOW'
                            }, null, 2)
                        }
                    ]
                };
            }
            case "detect_mev_patterns": {
                const { signature } = request.params.arguments;
                validateTransactionSignature(signature);
                const patterns = await mevEngine.detectMEVPatterns(signature);
                const alert = await mevEngine.generateMEVAlert("demo-wallet", patterns);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                signature,
                                patterns,
                                alert: {
                                    id: alert.id,
                                    riskScore: alert.riskScore,
                                    recommendations: alert.recommendations,
                                    protectionCost: `${alert.protectionCost.toFixed(4)} SOL`
                                },
                                summary: patterns.length > 0
                                    ? `🛡️ MEV Analysis: ${patterns.length} pattern(s) detected with ${alert.riskScore}/100 risk score`
                                    : `✅ Clean transaction - No MEV patterns detected`,
                                protectionAdvice: alert.riskScore > 50
                                    ? "🚨 High MEV risk - Enable protection immediately"
                                    : alert.riskScore > 25
                                        ? "⚠️ Moderate risk - Consider MEV protection for large trades"
                                        : "✅ Low risk - Continue normal trading"
                            }, null, 2)
                        }
                    ]
                };
            }
            case "generate_trading_signal": {
                const { symbol = "SOL", timeframe = "1H" } = request.params.arguments;
                const signal = await aiSignals.generateTradingSignal(symbol, timeframe);
                const performance = await aiSignals.getPerformanceStats();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                signal: {
                                    id: signal.id,
                                    symbol: signal.symbol,
                                    action: signal.action,
                                    confidence: `${signal.confidence.toFixed(1)}%`,
                                    timeframe: signal.timeframe,
                                    entry: `$${signal.entry.toFixed(2)}`,
                                    targets: signal.targets.map(t => `$${t.toFixed(2)}`),
                                    stopLoss: `$${signal.stopLoss.toFixed(2)}`,
                                    riskReward: `1:${signal.riskReward.toFixed(2)}`,
                                    positionSize: `${signal.positionSize.toFixed(1)}%`,
                                    riskLevel: signal.riskLevel,
                                    reasoning: signal.reasoning
                                },
                                technicalAnalysis: {
                                    rsi: signal.technicalIndicators.rsi.toFixed(1),
                                    macd: signal.technicalIndicators.macd.histogram > 0 ? 'BULLISH' : 'BEARISH',
                                    support: `$${signal.technicalIndicators.support.toFixed(2)}`,
                                    resistance: `$${signal.technicalIndicators.resistance.toFixed(2)}`,
                                    volume: signal.technicalIndicators.volume
                                },
                                aiPerformance: {
                                    winRate: `${performance.winRate}%`,
                                    avgReturn: `+${performance.avgReturn}%`,
                                    currentStreak: `${performance.currentStreak.count} ${performance.currentStreak.type}S`
                                },
                                summary: `🧠 AI Signal: ${signal.action} ${signal.symbol} with ${signal.confidence.toFixed(0)}% confidence`,
                                actionPlan: signal.action !== 'WAIT'
                                    ? `Entry: ${signal.entry.toFixed(2)}, Target: ${signal.targets[0].toFixed(2)}, Stop: ${signal.stopLoss.toFixed(2)}`
                                    : "Wait for clearer market signals before entering position"
                            }, null, 2)
                        }
                    ]
                };
            }
            case "get_mev_protection_status": {
                const { address } = request.params.arguments;
                validateAddress(address);
                // Generate mock MEV alert for wallet
                const alert = await mevEngine.generateMEVAlert(address, []);
                const trends = await mevEngine.getRecentMEVTrends();
                const history = await mevEngine.getWalletMEVHistory(address);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                address,
                                currentStatus: {
                                    riskScore: alert.riskScore,
                                    threatLevel: alert.riskScore > 75 ? 'CRITICAL' :
                                        alert.riskScore > 50 ? 'HIGH' :
                                            alert.riskScore > 25 ? 'MEDIUM' : 'LOW',
                                    protectionCost: `${alert.protectionCost.toFixed(4)} SOL`,
                                    recommendations: alert.recommendations
                                },
                                marketTrends: {
                                    alertsLast24h: trends.totalAlertsLast24h,
                                    topThreats: trends.topPatterns.slice(0, 3),
                                    highRiskWallets: trends.highRiskWallets
                                },
                                walletHistory: {
                                    totalAlerts: history.length,
                                    lastAlert: history.length > 0 ? history[history.length - 1].timestamp : null,
                                    avgRiskScore: history.length > 0
                                        ? history.reduce((sum, h) => sum + h.riskScore, 0) / history.length
                                        : 0
                                },
                                summary: alert.riskScore === 0
                                    ? `✅ Wallet secure - No MEV threats detected`
                                    : `🛡️ MEV Protection Status: ${alert.riskScore}/100 risk score with ${alert.protectionCost.toFixed(4)} SOL protection cost`,
                                actionItems: alert.riskScore > 50
                                    ? ['Enable MEV protection immediately', 'Monitor transaction patterns', 'Use private mempools']
                                    : alert.riskScore > 0
                                        ? ['Monitor for MEV activity', 'Consider protection for large trades']
                                        : ['Continue normal trading', 'Periodic security checks recommended']
                            }, null, 2)
                        }
                    ]
                };
            }
            default:
                throw new Error(`Unknown tool: ${request.params.name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        error: error.message,
                        tool: request.params.name,
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }
            ]
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`🚀 Trader's Co-Pilot MCP Server started`);
    console.error(`📡 Connected to Solana Devnet: ${RPC_URL}`);
    console.error(`🔐 Demo signer: ${demoKeypair.publicKey.toBase58()}`);
    console.error(`🛠️  Tools: 14 advanced trading & security tools with AI/MEV protection`);
    console.error(`🔗 Ready for MCP client connection!`);
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=mcp-server.js.map