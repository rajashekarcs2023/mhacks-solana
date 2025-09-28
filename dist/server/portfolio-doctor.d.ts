import { Connection } from "@solana/web3.js";
interface TokenHolding {
    mint: string;
    symbol: string;
    amount: number;
    usdValue: number;
    percentage: number;
}
interface RiskMetrics {
    diversificationScore: number;
    volatilityRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    rugPullRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    liquidityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    concentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}
interface PortfolioAnalysis {
    address: string;
    totalValue: number;
    holdings: TokenHolding[];
    riskMetrics: RiskMetrics;
    healthScore: number;
    recommendations: string[];
    warnings: string[];
    aiInsights: string;
}
export declare function analyzePortfolio(connection: Connection, address: string): Promise<PortfolioAnalysis>;
export {};
