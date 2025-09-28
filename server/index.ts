#!/usr/bin/env node
import "dotenv/config";
import express from "express";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { z } from "zod";
import { enforceGuardrails, validateAddress, validateTransactionSignature } from "./guards";
import type {
  BalanceResponse,
  TransactionExplanation,
  MarketBuyResponse,
  TipResponse,
  ErrorResponse,
} from "./types";

// Configuration
const RPC_URL = process.env.DEVNET_RPC || clusterApiUrl("devnet");
const PORT = parseInt(process.env.PORT || "8787");
const DEMO_SECRET = process.env.DEMO_SECRET ? 
  Uint8Array.from(JSON.parse(process.env.DEMO_SECRET)) : 
  undefined;

// Initialize Solana connection
const connection = new Connection(RPC_URL, "confirmed");

// Demo signer for airdrop/tip functionality (Devnet only)
const demoKeypair = DEMO_SECRET ? 
  Keypair.fromSecretKey(DEMO_SECRET) : 
  Keypair.generate();

// Express app setup
const app = express();
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Trader's Co-Pilot",
    version: "0.1.0",
    description: "AI-native Solana MCP server for traders",
    network: "devnet",
    endpoints: [
      "POST /tools/get_balance",
      "POST /tools/explain_tx", 
      "POST /tools/market_buy_sim",
      "POST /tools/airdrop_and_tip"
    ],
    demoSigner: demoKeypair.publicKey.toBase58(),
    status: "operational"
  });
});

// 1. GET BALANCE - Check SOL balance for any address
app.post("/tools/get_balance", async (req, res) => {
  try {
    const schema = z.object({
      address: z.string().min(32, "Address too short").max(44, "Address too long")
    });
    
    const { address } = schema.parse(req.body);
    validateAddress(address);
    
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    const sol = balance / LAMPORTS_PER_SOL;
    
    const response: BalanceResponse = {
      address,
      lamports: balance,
      sol: parseFloat(sol.toFixed(9))
    };
    
    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = { error: error.message };
    res.status(400).json(errorResponse);
  }
});

// 2. EXPLAIN TRANSACTION - Human-readable transaction analysis
app.post("/tools/explain_tx", async (req, res) => {
  try {
    const schema = z.object({
      signature: z.string().min(64, "Signature too short")
    });
    
    const { signature } = schema.parse(req.body);
    validateTransactionSignature(signature);
    
    const parsed = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });
    
    if (!parsed) {
      return res.status(404).json({ 
        error: "Transaction not found on Devnet. Ensure you're using a Devnet transaction signature." 
      });
    }
    
    // Extract account keys and balance changes
    const accounts = parsed.transaction.message.accountKeys.map(a => a.pubkey.toBase58());
    const preBalances = parsed.meta?.preBalances || [];
    const postBalances = parsed.meta?.postBalances || [];
    
    // Calculate SOL movements
    const movements = [];
    for (let i = 0; i < preBalances.length; i++) {
      const delta = (postBalances[i] - preBalances[i]) / LAMPORTS_PER_SOL;
      if (Math.abs(delta) > 0.000001) { // Only show significant changes
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
      summary += `Transfer of ~${totalSent.toFixed(4)} SOL from ${sends[0].account.slice(0,4)}… to ${receives[0].account.slice(0,4)}…`;
    } else if (movements.length === 0) {
      summary += "Program interaction with no net SOL transfer";
    } else {
      summary += "Complex transaction with multiple account changes";
    }
    
    if (riskFlags.length > 0) {
      summary += ` ⚠️ Flags: ${riskFlags.join(", ")}`;
    }
    
    const response: TransactionExplanation = {
      signature,
      summary,
      movements,
      accountsTouched: accounts.length,
      riskFlags
    };
    
    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = { error: error.message };
    res.status(400).json(errorResponse);
  }
});

// 3. MARKET BUY SIMULATION - Preview trades safely
app.post("/tools/market_buy_sim", async (req, res) => {
  try {
    const schema = z.object({
      mint: z.string().default("SOL"),
      usdAmount: z.number().min(1, "Amount too small").max(10000, "Amount too large for demo"),
      slippageBps: z.number().min(1, "Slippage too low").max(5000, "Slippage too high").default(50),
      network: z.string().default("devnet"),
      mode: z.string().optional()
    });
    
    const { mint, usdAmount, slippageBps, network, mode } = schema.parse(req.body);
    
    // Enforce safety guardrails
    enforceGuardrails({ slippageBps, network, mode });
    
    // Mock price for MVP (in production, would use Pyth or another oracle)
    const mockPrices: Record<string, number> = {
      "SOL": 150, // USD per SOL
      "USDC": 1,  // USD per USDC
      "BTC": 45000, // For demonstration
    };
    
    const price = mockPrices[mint.toUpperCase()] || mockPrices["SOL"];
    const expectedFill = usdAmount / price;
    const feeEstimate = 0.000005; // ~5k lamports typical transaction fee
    
    // Calculate slippage impact
    const slippagePercent = slippageBps / 10000;
    const maxPrice = price * (1 + slippagePercent);
    const minFill = usdAmount / maxPrice;
    
    const response: MarketBuyResponse = {
      mint,
      usdAmount,
      slippageBps,
      preview: {
        plainEnglish: `Would buy approximately ${expectedFill.toFixed(4)} ${mint} for $${usdAmount} with ≤${(slippagePercent * 100).toFixed(2)}% slippage on ${network}. Minimum fill: ${minFill.toFixed(4)} ${mint}.`,
        expectedFill: `${expectedFill.toFixed(4)} ${mint}`,
        feeEstimate
      }
    };
    
    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = { error: error.message };
    res.status(400).json(errorResponse);
  }
});

// 4. AIRDROP AND TIP - Demo execution capability (Devnet only)
app.post("/tools/airdrop_and_tip", async (req, res) => {
  try {
    const schema = z.object({
      to: z.string().min(32, "Recipient address too short"),
      sol: z.number().min(0.001, "Amount too small").max(1.0, "Amount too large for demo").default(0.01)
    });
    
    const { to, sol } = schema.parse(req.body);
    
    // Enforce safety guardrails
    enforceGuardrails({ amount: sol, network: "devnet" });
    validateAddress(to);
    
    const toPubkey = new PublicKey(to);
    
    // Ensure demo signer has sufficient balance
    const demoBalance = await connection.getBalance(demoKeypair.publicKey);
    const requiredBalance = (sol + 0.01) * LAMPORTS_PER_SOL; // SOL amount + minimal buffer
    
    if (demoBalance < requiredBalance) {
      console.log(`Demo signer needs more SOL. Requesting airdrop...`);
      try {
        const airdropSignature = await connection.requestAirdrop(
          demoKeypair.publicKey,
          1 * LAMPORTS_PER_SOL
        );
        
        // Wait for airdrop confirmation with timeout
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
          signature: airdropSignature,
          ...latestBlockhash
        });
        console.log(`Airdrop completed: ${airdropSignature}`);
        
        // Wait a moment for balance to update
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (airdropError: any) {
        console.log(`Airdrop failed, but continuing with existing balance: ${airdropError.message}`);
        
        // Check if we have enough for the tip anyway
        const currentBalance = await connection.getBalance(demoKeypair.publicKey);
        if (currentBalance < sol * LAMPORTS_PER_SOL) {
          throw new Error(`Insufficient balance for tip. Demo signer has ${(currentBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL but needs ${sol} SOL. Devnet airdrop may be rate limited.`);
        }
      }
    }
    
    // Create and send tip transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: demoKeypair.publicKey,
        toPubkey: toPubkey,
        lamports: Math.floor(sol * LAMPORTS_PER_SOL),
      })
    );
    
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [demoKeypair],
      {
        commitment: "confirmed"
      }
    );
    
    const response: TipResponse = {
      signature,
      preview: `Successfully sent ${sol} SOL to ${to} on Devnet`,
      from: demoKeypair.publicKey.toBase58()
    };
    
    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = { error: error.message };
    res.status(400).json(errorResponse);
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  const errorResponse: ErrorResponse = { 
    error: "Internal server error. Please try again." 
  };
  res.status(500).json(errorResponse);
});

// 404 handler
app.use((req, res) => {
  const errorResponse: ErrorResponse = { 
    error: `Endpoint not found: ${req.method} ${req.path}. Available: GET /, POST /tools/*` 
  };
  res.status(404).json(errorResponse);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Trader's Co-Pilot MCP Server running on port ${PORT}`);
  console.log(`📡 Connected to Solana Devnet: ${RPC_URL}`);
  console.log(`🔐 Demo signer: ${demoKeypair.publicKey.toBase58()}`);
  console.log(`🛠️  Available tools:`);
  console.log(`   • POST /tools/get_balance - Check wallet balance`);
  console.log(`   • POST /tools/explain_tx - Analyze transactions`);
  console.log(`   • POST /tools/market_buy_sim - Preview trades`);
  console.log(`   • POST /tools/airdrop_and_tip - Demo execution (Devnet)`);
  console.log(`\n🔗 Ready for MCP integration!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🔄 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});