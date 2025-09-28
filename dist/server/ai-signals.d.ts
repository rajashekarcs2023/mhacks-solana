import { Connection } from "@solana/web3.js";
import { RealDataEngine } from "./real-data-engine.js";
interface TradingSignal {
    id: string;
    timestamp: Date;
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
    confidence: number;
    timeframe: '5M' | '15M' | '1H' | '4H' | '1D';
    entry: number;
    targets: number[];
    stopLoss: number;
    riskReward: number;
    reasoning: string;
    technicalIndicators: {
        rsi: number;
        macd: {
            value: number;
            signal: number;
            histogram: number;
        };
        support: number;
        resistance: number;
        volume: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';
    };
    fundamentalFactors: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    positionSize: number;
}
interface SignalPerformance {
    totalSignals: number;
    winRate: number;
    avgReturn: number;
    bestSignal: {
        return: number;
        duration: string;
    };
    worstSignal: {
        return: number;
        duration: string;
    };
    currentStreak: {
        type: 'WIN' | 'LOSS';
        count: number;
    };
}
export declare class AITradingSignals {
    private connection;
    private realDataEngine;
    private signalHistory;
    private performance;
    constructor(connection: Connection, realDataEngine: RealDataEngine);
    generateTradingSignal(symbol: string, timeframe?: '5M' | '15M' | '1H' | '4H' | '1D'): Promise<TradingSignal>;
    private generateAISignal;
    private analyzeMarketContext;
    private calculateTechnicalIndicators;
    private generateAIReasoning;
    private getVolatilityMultiplier;
    private assessRiskLevel;
    private calculatePositionSize;
    private getFundamentalFactors;
    private getSeasonalFactors;
    getSignalHistory(symbol: string, limit?: number): Promise<TradingSignal[]>;
    getPerformanceStats(): Promise<SignalPerformance>;
    getTopSignals(timeframe?: '24H' | '7D' | '30D'): Promise<TradingSignal[]>;
    generateMarketAlert(): Promise<{
        type: 'OPPORTUNITY' | 'WARNING' | 'INFO';
        message: string;
        urgency: 'LOW' | 'MEDIUM' | 'HIGH';
        actionable: boolean;
        recommendations: string[];
    }>;
}
export {};
