export interface BalanceResponse {
    address: string;
    lamports: number;
    sol: number;
}
export interface TransactionMovement {
    account: string;
    deltaSol: number;
}
export interface TransactionExplanation {
    signature: string;
    summary: string;
    movements: TransactionMovement[];
    accountsTouched: number;
    riskFlags: string[];
}
export interface TradePreview {
    plainEnglish: string;
    expectedFill: string;
    feeEstimate: number;
}
export interface MarketBuyResponse {
    mint: string;
    usdAmount: number;
    slippageBps: number;
    preview: TradePreview;
}
export interface TipResponse {
    signature: string;
    preview: string;
    from: string;
}
export interface ErrorResponse {
    error: string;
}
