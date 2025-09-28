// 🤝 x402 Agent Payment Protocol - Enable agent-to-agent payments on Solana
import { Connection, PublicKey, SystemProgram, Transaction, Keypair, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface X402PaymentRequest {
  from: string;           // Requesting agent ID
  to: string;             // Target agent ID  
  amount: number;         // Amount in SOL
  currency: 'SOL' | 'USDC';
  service: string;        // Service being paid for
  metadata: {
    description: string;
    duration?: number;    // Service duration in minutes
    priority?: 'low' | 'medium' | 'high';
    callback?: string;    // Webhook for completion
  };
}

interface X402PaymentResponse {
  paymentId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  actionUrl?: string;     // Solana Action/Blink URL for approval
  estimatedFee: number;
  expiresAt: string;
  message: string;
}

interface AgentService {
  agentId: string;
  serviceName: string;
  description: string;
  priceSOL: number;
  capabilities: string[];
  rating: number;
  availability: 'online' | 'busy' | 'offline';
}

// Mock agent marketplace
const AGENT_MARKETPLACE: AgentService[] = [
  {
    agentId: 'jupiter-dca-bot',
    serviceName: 'DCA Strategy Execution',
    description: 'Automated dollar-cost averaging with smart timing',
    priceSOL: 0.01,
    capabilities: ['dca', 'timing', 'slippage-optimization'],
    rating: 4.8,
    availability: 'online'
  },
  {
    agentId: 'yield-farmer-pro',
    serviceName: 'Yield Farming Analysis',
    description: 'Find and analyze best yield opportunities across Solana DeFi',
    priceSOL: 0.005,
    capabilities: ['yield-analysis', 'risk-assessment', 'apr-tracking'],
    rating: 4.6,
    availability: 'online'
  },
  {
    agentId: 'mev-protector',
    serviceName: 'MEV Protection Service',
    description: 'Protect your trades from sandwich attacks and front-running',
    priceSOL: 0.02,
    capabilities: ['mev-protection', 'priority-fees', 'private-mempool'],
    rating: 4.9,
    availability: 'busy'
  },
  {
    agentId: 'sentiment-analyzer',
    serviceName: 'Social Sentiment Analysis',
    description: 'Analyze Twitter, Discord, and forum sentiment for tokens',
    priceSOL: 0.008,
    capabilities: ['sentiment-analysis', 'social-monitoring', 'trend-detection'],
    rating: 4.4,
    availability: 'online'
  }
];

export async function listAgentServices(): Promise<AgentService[]> {
  // In production, this would query a decentralized agent registry
  return AGENT_MARKETPLACE.filter(service => service.availability !== 'offline');
}

export async function createX402Payment(
  connection: Connection,
  request: X402PaymentRequest
): Promise<X402PaymentResponse> {
  
  // Find the target service
  const service = AGENT_MARKETPLACE.find(s => s.agentId === request.to);
  if (!service) {
    throw new Error(`Agent service '${request.to}' not found in marketplace`);
  }

  // Validate payment amount
  if (request.amount < service.priceSOL) {
    throw new Error(`Insufficient payment. ${service.serviceName} requires ${service.priceSOL} SOL`);
  }

  // Generate unique payment ID
  const paymentId = `x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create Solana Action URL for payment approval
  const actionUrl = createSolanaAction(paymentId, request, service);
  
  // Calculate fees (simplified)
  const estimatedFee = 0.000005; // Base transaction fee
  
  const response: X402PaymentResponse = {
    paymentId,
    status: 'pending',
    actionUrl,
    estimatedFee,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    message: `Payment request created for ${service.serviceName}. Click the action URL to approve payment in your wallet.`
  };

  // In production, would store in database/registry
  console.log(`💳 x402 Payment Created: ${paymentId}`);
  console.log(`🔗 Action URL: ${actionUrl}`);
  
  return response;
}

export async function executeX402Payment(
  connection: Connection,
  paymentId: string,
  payerKeypair: Keypair,
  recipientAddress: string,
  amount: number
): Promise<string> {
  
  try {
    // Create transfer transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payerKeypair.publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: Math.floor(amount * LAMPORTS_PER_SOL),
      })
    );

    // Send transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payerKeypair],
      { commitment: 'confirmed' }
    );

    console.log(`✅ x402 Payment Executed: ${paymentId}`);
    console.log(`🔗 Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    // In production, would trigger service execution
    await triggerServiceExecution(paymentId, signature);
    
    return signature;
  } catch (error: any) {
    console.error(`❌ x402 Payment Failed: ${error.message}`);
    throw error;
  }
}

function createSolanaAction(
  paymentId: string,
  request: X402PaymentRequest,
  service: AgentService
): string {
  // Create Solana Action/Blink URL (simplified for demo)
  const baseUrl = 'https://dial.to/?action=solana-action';
  const params = new URLSearchParams({
    label: `Pay ${service.serviceName}`,
    description: `x402 payment to ${service.agentId} for ${service.description}`,
    amount: request.amount.toString(),
    currency: request.currency,
    recipient: service.agentId, // In production, would be service wallet address
    reference: paymentId
  });
  
  return `${baseUrl}&${params.toString()}`;
}

async function triggerServiceExecution(paymentId: string, transactionSignature: string): Promise<void> {
  // In production, this would:
  // 1. Notify the service agent that payment was received
  // 2. Trigger execution of the requested service
  // 3. Handle service completion callbacks
  // 4. Manage reputation/rating updates
  
  console.log(`🚀 Service triggered for payment ${paymentId}`);
  console.log(`📋 Transaction proof: ${transactionSignature}`);
  
  // Simulate service execution delay
  setTimeout(() => {
    console.log(`✨ Service completed for payment ${paymentId}`);
  }, 2000);
}

export function generateX402Demo(): {
  scenario: string;
  request: X402PaymentRequest;
  expectedFlow: string[];
} {
  return {
    scenario: "AI agent requests MEV protection service from another agent",
    request: {
      from: 'trader-agent-123',
      to: 'mev-protector',
      amount: 0.02,
      currency: 'SOL',
      service: 'MEV Protection Service',
      metadata: {
        description: 'Protect upcoming $1000 SOL swap from sandwich attacks',
        duration: 60,
        priority: 'high',
        callback: 'https://trader-agent-123.com/callback'
      }
    },
    expectedFlow: [
      '1. Agent creates x402 payment request',
      '2. System generates Solana Action/Blink URL',  
      '3. User approves payment in wallet',
      '4. Payment executes on Solana Devnet',
      '5. MEV protection service activates',
      '6. Service completion notification sent',
      '7. Reputation/rating updated'
    ]
  };
}