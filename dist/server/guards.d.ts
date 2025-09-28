export declare const SAFETY_CONFIG: {
    network: string;
    maxSlippageBps: number;
    refuseMainnetByDefault: boolean;
    maxTipAmount: number;
    minBalance: number;
};
export interface GuardrailParams {
    slippageBps?: number;
    network?: string;
    mode?: string;
    amount?: number;
}
export declare function enforceGuardrails(params: GuardrailParams): void;
export declare function validateAddress(address: string): void;
export declare function validateTransactionSignature(signature: string): void;
