// Safety guardrails for Trader's Co-Pilot

export const SAFETY_CONFIG = {
  network: "devnet",
  maxSlippageBps: 150, // 1.5% maximum slippage
  refuseMainnetByDefault: true,
  maxTipAmount: 1.0, // Maximum SOL for tips
  minBalance: 0.1 // Minimum balance to maintain for demo signer
};

export interface GuardrailParams {
  slippageBps?: number;
  network?: string;
  mode?: string;
  amount?: number;
}

export function enforceGuardrails(params: GuardrailParams): void {
  const { slippageBps, network, mode, amount } = params;

  // Network safety check
  if (SAFETY_CONFIG.refuseMainnetByDefault && 
      network && 
      network !== "devnet" && 
      mode !== "i_understand_the_risk") {
    throw new Error(
      `Mainnet operations disabled for safety. Use 'devnet' or set mode: 'i_understand_the_risk'`
    );
  }

  // Slippage protection
  if (slippageBps !== undefined && slippageBps > SAFETY_CONFIG.maxSlippageBps) {
    throw new Error(
      `Slippage too high (${slippageBps} bps). Maximum allowed: ${SAFETY_CONFIG.maxSlippageBps} bps (${SAFETY_CONFIG.maxSlippageBps / 100}%)`
    );
  }

  // Amount limits for tips/transfers
  if (amount !== undefined && amount > SAFETY_CONFIG.maxTipAmount) {
    throw new Error(
      `Amount too high (${amount} SOL). Maximum allowed: ${SAFETY_CONFIG.maxTipAmount} SOL for demo purposes`
    );
  }
}

export function validateAddress(address: string): void {
  if (!address || address.length < 32 || address.length > 44) {
    throw new Error("Invalid Solana address format");
  }
}

export function validateTransactionSignature(signature: string): void {
  if (!signature || signature.length < 64 || signature.length > 128) {
    throw new Error("Invalid transaction signature format");
  }
}