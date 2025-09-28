import { Connection } from "@solana/web3.js";
interface RealTokenData {
    mint: string;
    symbol: string;
    name: string;
    decimals: number;
    supply: number;
    verified: boolean;
    logoURI?: string;
    coingeckoId?: string;
}
interface PriceData {
    price: number;
    confidence: number;
    lastUpdated: Date;
    change24h: number;
}
interface DeFiProtocol {
    name: string;
    programId: string;
    category: 'dex' | 'lending' | 'yield' | 'derivatives';
    tvl?: number;
}
export declare class RealDataEngine {
    private pythClient;
    private connection;
    private priceCache;
    constructor(connection: Connection);
    getRealPrice(symbol: string): Promise<PriceData>;
    getRealTokenData(mintAddress: string): Promise<RealTokenData | null>;
    analyzeRealPortfolio(address: string): Promise<{
        tokens: Array<{
            mint: string;
            symbol: string;
            balance: number;
            usdValue: number;
            percentage: number;
            tokenData: RealTokenData | null;
            priceData: PriceData | null;
        }>;
        totalValue: number;
        lastUpdated: Date;
    }>;
    detectDeFiProtocols(transaction: any): DeFiProtocol[];
    getMarketSentiment(): Promise<{
        overall: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
        score: number;
        indicators: {
            priceAction: number;
            volumeChange: number;
            socialSentiment: number;
            fearGreedIndex: number;
        };
        summary: string;
    }>;
}
export {};
