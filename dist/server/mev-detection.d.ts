import { Connection } from "@solana/web3.js";
import { RealDataEngine } from "./real-data-engine.js";
interface MEVPattern {
    type: 'sandwich' | 'frontrun' | 'arbitrage' | 'liquidation';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    description: string;
    estimatedProfit?: number;
    victimLoss?: number;
    preventionStrategy?: string[];
}
interface MEVAlert {
    id: string;
    timestamp: Date;
    walletAddress: string;
    patterns: MEVPattern[];
    riskScore: number;
    recommendations: string[];
    protectionCost: number;
}
export declare class MEVDetectionEngine {
    private connection;
    private realDataEngine;
    private alertHistory;
    private knownMEVBots;
    private suspiciousPrograms;
    constructor(connection: Connection, realDataEngine: RealDataEngine);
    detectMEVPatterns(transactionSignature: string): Promise<MEVPattern[]>;
    private detectSandwichAttack;
    private detectFrontrunning;
    private detectArbitrage;
    private analyzePriorityFees;
    generateMEVAlert(walletAddress: string, patterns: MEVPattern[]): Promise<MEVAlert>;
    private generateMEVRecommendations;
    private estimateProtectionCost;
    getWalletMEVHistory(walletAddress: string): Promise<MEVAlert[]>;
    getRecentMEVTrends(): Promise<{
        totalAlertsLast24h: number;
        topPatterns: Array<{
            type: string;
            count: number;
            avgSeverity: string;
        }>;
        highRiskWallets: number;
        recommendations: string[];
    }>;
    private calculateAverageSeverity;
}
export {};
