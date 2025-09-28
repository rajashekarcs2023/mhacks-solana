import { Connection } from "@solana/web3.js";
interface DeFiStrategy {
    strategyId: string;
    name: string;
    description: string;
    category: 'yield' | 'trading' | 'arbitrage' | 'lending' | 'staking';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    expectedAPY: number;
    minimumAmount: number;
    protocols: string[];
    steps: string[];
    pros: string[];
    cons: string[];
    currentTVL: number;
    popularity: number;
    aiConfidence: number;
}
interface MarketConditions {
    solPrice: number;
    volatilityIndex: number;
    dexVolume24h: number;
    borrowRates: {
        [token: string]: number;
    };
    yieldRates: {
        [protocol: string]: number;
    };
    liquidityLevels: 'LOW' | 'MEDIUM' | 'HIGH';
    marketSentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
}
interface StrategyRecommendation {
    strategies: DeFiStrategy[];
    marketAnalysis: MarketConditions;
    personalizedInsights: string;
    riskWarnings: string[];
    actionPlan: string[];
    expectedOutcomes: {
        bestCase: string;
        worstCase: string;
        mostLikely: string;
    };
}
export declare function generateStrategyRecommendations(connection: Connection, userAddress: string, riskTolerance: 'conservative' | 'moderate' | 'aggressive', investmentAmount: number, timeHorizon: 'short' | 'medium' | 'long'): Promise<StrategyRecommendation>;
export {};
