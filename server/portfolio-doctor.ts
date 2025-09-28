// 🏥 AI Portfolio Doctor - Advanced portfolio analysis with risk scoring
import { Connection, PublicKey } from "@solana/web3.js";

interface TokenHolding {
  mint: string;
  symbol: string;
  amount: number;
  usdValue: number;
  percentage: number;
}

interface RiskMetrics {
  diversificationScore: number; // 0-100
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
  healthScore: number; // 0-100
  recommendations: string[];
  warnings: string[];
  aiInsights: string;
}

export async function analyzePortfolio(
  connection: Connection,
  address: string
): Promise<PortfolioAnalysis> {
  try {
    const publicKey = new PublicKey(address);
    
    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    });

    // Mock holdings for demo (in production, would integrate with Jupiter/CoinGecko APIs)
    const mockHoldings: TokenHolding[] = [
      { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', amount: 10.5, usdValue: 1575, percentage: 75 },
      { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', amount: 300, usdValue: 300, percentage: 14.3 },
      { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT', amount: 150, usdValue: 150, percentage: 7.1 },
      { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', amount: 1000000, usdValue: 75, percentage: 3.6 }
    ];

    const totalValue = mockHoldings.reduce((sum, h) => sum + h.usdValue, 0);

    // AI-powered risk analysis
    const riskMetrics = calculateRiskMetrics(mockHoldings, totalValue);
    const healthScore = calculateHealthScore(riskMetrics, mockHoldings);
    const recommendations = generateRecommendations(riskMetrics, mockHoldings);
    const warnings = generateWarnings(riskMetrics, mockHoldings);
    const aiInsights = generateAIInsights(mockHoldings, riskMetrics, healthScore);

    return {
      address,
      totalValue,
      holdings: mockHoldings,
      riskMetrics,
      healthScore,
      recommendations,
      warnings,
      aiInsights
    };
  } catch (error: any) {
    throw new Error(`Portfolio analysis failed: ${error.message}`);
  }
}

function calculateRiskMetrics(holdings: TokenHolding[], totalValue: number): RiskMetrics {
  // Diversification score (based on number of holdings and concentration)
  const diversificationScore = Math.min(100, holdings.length * 15 + (100 - Math.max(...holdings.map(h => h.percentage))));
  
  // Volatility risk (based on token types and concentrations)
  const memeTokenPercentage = holdings
    .filter(h => ['BONK', 'WIF', 'PEPE'].includes(h.symbol))
    .reduce((sum, h) => sum + h.percentage, 0);
  
  const volatilityRisk = memeTokenPercentage > 50 ? 'EXTREME' : 
                        memeTokenPercentage > 25 ? 'HIGH' :
                        memeTokenPercentage > 10 ? 'MEDIUM' : 'LOW';

  // Rug pull risk (based on unknown tokens)
  const unknownTokens = holdings.filter(h => !['SOL', 'USDC', 'USDT'].includes(h.symbol));
  const rugPullRisk = unknownTokens.length > 5 ? 'HIGH' :
                     unknownTokens.length > 2 ? 'MEDIUM' : 'LOW';

  // Liquidity risk (based on token market caps - simplified)
  const liquidityRisk = totalValue < 1000 ? 'HIGH' : 
                       totalValue < 10000 ? 'MEDIUM' : 'LOW';

  // Concentration risk
  const maxConcentration = Math.max(...holdings.map(h => h.percentage));
  const concentrationRisk = maxConcentration > 80 ? 'HIGH' :
                           maxConcentration > 60 ? 'MEDIUM' : 'LOW';

  return {
    diversificationScore,
    volatilityRisk,
    rugPullRisk,
    liquidityRisk,
    concentrationRisk
  };
}

function calculateHealthScore(riskMetrics: RiskMetrics, holdings: TokenHolding[]): number {
  let score = riskMetrics.diversificationScore;
  
  // Penalty for high risks
  if (riskMetrics.volatilityRisk === 'EXTREME') score -= 30;
  else if (riskMetrics.volatilityRisk === 'HIGH') score -= 20;
  else if (riskMetrics.volatilityRisk === 'MEDIUM') score -= 10;

  if (riskMetrics.rugPullRisk === 'HIGH') score -= 25;
  else if (riskMetrics.rugPullRisk === 'MEDIUM') score -= 10;

  if (riskMetrics.concentrationRisk === 'HIGH') score -= 20;
  else if (riskMetrics.concentrationRisk === 'MEDIUM') score -= 10;

  // Bonus for stablecoins
  const stablecoinPercentage = holdings
    .filter(h => ['USDC', 'USDT'].includes(h.symbol))
    .reduce((sum, h) => sum + h.percentage, 0);
  
  if (stablecoinPercentage > 20) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function generateRecommendations(riskMetrics: RiskMetrics, holdings: TokenHolding[]): string[] {
  const recommendations = [];

  if (riskMetrics.diversificationScore < 50) {
    recommendations.push("🎯 Diversify across more tokens to reduce concentration risk");
  }

  if (riskMetrics.volatilityRisk === 'EXTREME') {
    recommendations.push("⚠️ Consider reducing meme token exposure to below 25%");
  }

  if (riskMetrics.concentrationRisk === 'HIGH') {
    recommendations.push("📊 Your top holding is over 80% - consider rebalancing");
  }

  const stablecoinPercentage = holdings
    .filter(h => ['USDC', 'USDT'].includes(h.symbol))
    .reduce((sum, h) => sum + h.percentage, 0);

  if (stablecoinPercentage < 10) {
    recommendations.push("💰 Add 10-20% stablecoins for portfolio stability");
  }

  if (holdings.length < 3) {
    recommendations.push("🔄 Consider adding blue-chip tokens like JUP, RAY, or JTO");
  }

  recommendations.push("🔍 Monitor your portfolio weekly for rebalancing opportunities");

  return recommendations;
}

function generateWarnings(riskMetrics: RiskMetrics, holdings: TokenHolding[]): string[] {
  const warnings = [];

  if (riskMetrics.rugPullRisk === 'HIGH') {
    warnings.push("🚨 HIGH RUG PULL RISK: Multiple unknown tokens detected");
  }

  if (riskMetrics.volatilityRisk === 'EXTREME') {
    warnings.push("📈 EXTREME VOLATILITY: Portfolio may swing wildly in value");
  }

  if (riskMetrics.concentrationRisk === 'HIGH') {
    warnings.push("⚖️ HIGH CONCENTRATION: Over 80% in single asset");
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.usdValue, 0);
  if (totalValue < 100) {
    warnings.push("💡 Small portfolio size may limit diversification options");
  }

  return warnings;
}

function generateAIInsights(holdings: TokenHolding[], riskMetrics: RiskMetrics, healthScore: number): string {
  const solPercentage = holdings.find(h => h.symbol === 'SOL')?.percentage || 0;
  const stablecoinPercentage = holdings
    .filter(h => ['USDC', 'USDT'].includes(h.symbol))
    .reduce((sum, h) => sum + h.percentage, 0);

  let insight = `Your portfolio health score is ${healthScore}/100. `;

  if (healthScore >= 80) {
    insight += "🎉 Excellent! You have a well-balanced, low-risk portfolio. ";
  } else if (healthScore >= 60) {
    insight += "👍 Good portfolio structure with room for optimization. ";
  } else if (healthScore >= 40) {
    insight += "⚠️ Moderate risk portfolio that needs rebalancing. ";
  } else {
    insight += "🚨 High-risk portfolio requiring immediate attention. ";
  }

  if (solPercentage > 70) {
    insight += "Your SOL concentration suggests strong conviction in Solana's future, but consider diversifying to manage volatility. ";
  }

  if (stablecoinPercentage < 10) {
    insight += "Adding stablecoins would provide a safety buffer during market downturns. ";
  }

  insight += `With ${riskMetrics.volatilityRisk.toLowerCase()} volatility risk, `;
  
  if (riskMetrics.volatilityRisk === 'LOW') {
    insight += "your portfolio should remain relatively stable during market fluctuations.";
  } else if (riskMetrics.volatilityRisk === 'MEDIUM') {
    insight += "expect moderate price swings but manageable risk.";
  } else {
    insight += "be prepared for significant value fluctuations and consider risk management strategies.";
  }

  return insight;
}