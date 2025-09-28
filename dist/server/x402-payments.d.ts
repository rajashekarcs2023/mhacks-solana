import { Connection, Keypair } from "@solana/web3.js";
interface X402PaymentRequest {
    from: string;
    to: string;
    amount: number;
    currency: 'SOL' | 'USDC';
    service: string;
    metadata: {
        description: string;
        duration?: number;
        priority?: 'low' | 'medium' | 'high';
        callback?: string;
    };
}
interface X402PaymentResponse {
    paymentId: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    actionUrl?: string;
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
export declare function listAgentServices(): Promise<AgentService[]>;
export declare function createX402Payment(connection: Connection, request: X402PaymentRequest): Promise<X402PaymentResponse>;
export declare function executeX402Payment(connection: Connection, paymentId: string, payerKeypair: Keypair, recipientAddress: string, amount: number): Promise<string>;
export declare function generateX402Demo(): {
    scenario: string;
    request: X402PaymentRequest;
    expectedFlow: string[];
};
export {};
