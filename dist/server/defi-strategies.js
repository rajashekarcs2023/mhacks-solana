// Mock DeFi strategies database
const STRATEGY_DATABASE = [
    {
        strategyId: 'jupiter-dca-btc',
        name: 'SOL-BTC DCA Strategy',
        description: 'Dollar-cost average into BTC using Jupiter with smart timing',
        category: 'trading',
        riskLevel: 'MEDIUM',
        expectedAPY: 15.5,
        minimumAmount: 100,
        protocols: ['Jupiter', 'Solana'],
        steps: [
            'Set up weekly DCA schedule',
            'Configure 1% slippage protection',
            'Enable automatic rebalancing',
            'Monitor performance weekly'
        ],
        pros: [
            'Reduces timing risk',
            'Automatic execution',
            'Low maintenance',
            'Benefits from volatility'
        ],
        cons: [
            'No guarantee of profits',
            'Transaction fees accumulate',
            'May miss major dips'
        ],
        currentTVL: 850000,
        popularity: 78,
        aiConfidence: 85
    },
    {
        strategyId: 'kamino-yield-farming',
        name: 'Kamino Automated Yield Farming',
        description: 'Automated liquidity provision with compounding rewards',
        category: 'yield',
        riskLevel: 'MEDIUM',
        expectedAPY: 22.3,
        minimumAmount: 250,
        protocols: ['Kamino', 'Raydium', 'Orca'],
        steps: [
            'Deposit SOL-USDC LP tokens',
            'Enable auto-compound feature',
            'Set rebalancing parameters',
            'Monitor impermanent loss'
        ],
        pros: [
            'High yield potential',
            'Automated management',
            'Diversified exposure',
            'Professional optimization'
        ],
        cons: [
            'Impermanent loss risk',
            'Smart contract risk',
            'Requires LP tokens'
        ],
        currentTVL: 1200000,
        popularity: 85,
        aiConfidence: 92
    },
    {
        strategyId: 'marinade-liquid-staking',
        name: 'Marinade Liquid Staking Plus',
        description: 'Stake SOL while earning additional yields through mSOL',
        category: 'staking',
        riskLevel: 'LOW',
        expectedAPY: 8.7,
        minimumAmount: 10,
        protocols: ['Marinade', 'Solana'],
        steps: [
            'Stake SOL for mSOL tokens',
            'Use mSOL in DeFi protocols',
            'Compound staking rewards',
            'Unstake when needed'
        ],
        pros: [
            'Liquid staking tokens',
            'Low risk profile',
            'Validator diversification',
            'Additional yield opportunities'
        ],
        cons: [
            'Lower yields than risky strategies',
            'Unstaking delays',
            'Slight mSOL premium/discount'
        ],
        currentTVL: 2100000,
        popularity: 92,
        aiConfidence: 96
    },
    {
        strategyId: 'drift-perp-momentum',
        name: 'Drift Momentum Perpetuals',
        description: 'AI-powered perpetual futures trading based on momentum signals',
        category: 'trading',
        riskLevel: 'HIGH',
        expectedAPY: 45.2,
        minimumAmount: 500,
        protocols: ['Drift Protocol'],
        steps: [
            'Analyze momentum indicators',
            'Open leveraged positions',
            'Set stop-loss and take-profit',
            'Monitor liquidation risk'
        ],
        pros: [
            'High profit potential',
            'AI-powered signals',
            '24/7 trading',
            'Leverage amplification'
        ],
        cons: [
            'High liquidation risk',
            'Requires active monitoring',
            'Significant losses possible',
            'Complex strategy'
        ],
        currentTVL: 450000,
        popularity: 56,
        aiConfidence: 73
    },
    {
        strategyId: 'solend-yield-ladder',
        name: 'Solend Multi-Asset Yield Ladder',
        description: 'Diversified lending across multiple assets with automated rebalancing',
        category: 'lending',
        riskLevel: 'LOW',
        expectedAPY: 12.1,
        minimumAmount: 150,
        protocols: ['Solend', 'Port Finance'],
        steps: [
            'Distribute capital across assets',
            'Lend to highest-yield markets',
            'Monitor utilization rates',
            'Rebalance monthly'
        ],
        pros: [
            'Stable returns',
            'Asset diversification',
            'Low maintenance',
            'Principal protection focus'
        ],
        cons: [
            'Lower yields than LP',
            'Protocol risk',
            'Interest rate fluctuation'
        ],
        currentTVL: 980000,
        popularity: 71,
        aiConfidence: 88
    }
];
export async function generateStrategyRecommendations(connection, userAddress, riskTolerance, investmentAmount, timeHorizon) {
    // Analyze current market conditions
    const marketConditions = await analyzeMarketConditions(connection);
    // Filter strategies based on user preferences
    const filteredStrategies = filterStrategiesByProfile({
        riskTolerance,
        investmentAmount,
        timeHorizon,
        marketConditions
    });
    // Rank strategies by AI confidence and market fit
    const rankedStrategies = rankStrategiesByAI(filteredStrategies, marketConditions);
    // Generate personalized insights
    const personalizedInsights = generatePersonalizedInsights(rankedStrategies, riskTolerance, investmentAmount, marketConditions);
    // Generate risk warnings
    const riskWarnings = generateRiskWarnings(rankedStrategies, marketConditions);
    // Create action plan
    const actionPlan = generateActionPlan(rankedStrategies[0], investmentAmount);
    // Predict outcomes
    const expectedOutcomes = predictOutcomes(rankedStrategies[0], marketConditions);
    return {
        strategies: rankedStrategies.slice(0, 3), // Top 3 recommendations
        marketAnalysis: marketConditions,
        personalizedInsights,
        riskWarnings,
        actionPlan,
        expectedOutcomes
    };
}
async function analyzeMarketConditions(connection) {
    // Mock market analysis (in production, would integrate with real data sources)
    return {
        solPrice: 150.25,
        volatilityIndex: 45, // Moderate volatility
        dexVolume24h: 125000000, // $125M
        borrowRates: {
            'SOL': 3.2,
            'USDC': 5.8,
            'BTC': 2.1
        },
        yieldRates: {
            'Kamino': 22.3,
            'Marinade': 8.7,
            'Solend': 12.1
        },
        liquidityLevels: 'HIGH',
        marketSentiment: 'NEUTRAL'
    };
}
function filterStrategiesByProfile(profile) {
    return STRATEGY_DATABASE.filter(strategy => {
        // Filter by risk tolerance
        if (profile.riskTolerance === 'conservative' && strategy.riskLevel === 'HIGH') {
            return false;
        }
        if (profile.riskTolerance === 'aggressive' && strategy.riskLevel === 'LOW') {
            return false; // Aggressive users might want higher risk
        }
        // Filter by minimum amount
        if (strategy.minimumAmount > profile.investmentAmount) {
            return false;
        }
        // Filter by time horizon (simplified)
        if (profile.timeHorizon === 'short' && strategy.category === 'staking') {
            return false; // Staking usually has lock-up periods
        }
        return true;
    });
}
function rankStrategiesByAI(strategies, marketConditions) {
    return strategies
        .map(strategy => {
        // Calculate dynamic score based on market conditions
        let score = strategy.aiConfidence;
        // Boost yield strategies in high-liquidity markets
        if (strategy.category === 'yield' && marketConditions.liquidityLevels === 'HIGH') {
            score += 10;
        }
        // Boost trading strategies in volatile markets
        if (strategy.category === 'trading' && marketConditions.volatilityIndex > 60) {
            score += 15;
        }
        // Boost stable strategies in bearish markets
        if (strategy.riskLevel === 'LOW' && marketConditions.marketSentiment === 'BEARISH') {
            score += 8;
        }
        return { ...strategy, dynamicScore: Math.min(100, score) };
    })
        .sort((a, b) => b.dynamicScore - a.dynamicScore);
}
function generatePersonalizedInsights(strategies, riskTolerance, investmentAmount, marketConditions) {
    const topStrategy = strategies[0];
    let insight = `Based on your ${riskTolerance} risk profile and $${investmentAmount} investment, `;
    insight += `I recommend starting with ${topStrategy.name}. `;
    if (marketConditions.marketSentiment === 'BULLISH') {
        insight += `Current bullish market conditions favor ${topStrategy.category} strategies. `;
    }
    else if (marketConditions.marketSentiment === 'BEARISH') {
        insight += `In this bearish market, focus on capital preservation and stable yields. `;
    }
    insight += `With ${marketConditions.liquidityLevels.toLowerCase()} liquidity levels, `;
    insight += `entry and exit should be smooth. `;
    if (topStrategy.expectedAPY > 20) {
        insight += `The projected ${topStrategy.expectedAPY}% APY is attractive, but remember that higher yields come with increased risks. `;
    }
    insight += `Consider starting with 25% of your capital to test the strategy before scaling up.`;
    return insight;
}
function generateRiskWarnings(strategies, marketConditions) {
    const warnings = [];
    const topStrategy = strategies[0];
    if (topStrategy.riskLevel === 'HIGH') {
        warnings.push(`⚠️ HIGH RISK: ${topStrategy.name} can result in significant losses`);
    }
    if (marketConditions.volatilityIndex > 70) {
        warnings.push(`📈 Market volatility is high - expect significant price swings`);
    }
    if (topStrategy.category === 'yield' && topStrategy.protocols.length > 1) {
        warnings.push(`🔗 Multi-protocol risk: Smart contract failures in any protocol affect returns`);
    }
    if (marketConditions.liquidityLevels === 'LOW') {
        warnings.push(`💧 Low liquidity warning: Large trades may experience slippage`);
    }
    warnings.push(`💡 Never invest more than you can afford to lose`);
    warnings.push(`🔍 Always do your own research before investing`);
    return warnings;
}
function generateActionPlan(strategy, amount) {
    const plan = [
        `1. 📚 Research ${strategy.protocols.join(', ')} protocols thoroughly`,
        `2. 🧪 Start with ${Math.min(amount * 0.25, 100)} SOL to test the strategy`,
        `3. 📱 Set up monitoring for key metrics and alerts`,
        `4. ⏰ Schedule weekly performance reviews`,
        `5. 📈 Scale up gradually after 2-4 weeks if performing well`,
        `6. 🔄 Rebalance monthly or when market conditions change significantly`,
        `7. 📊 Keep detailed records for tax purposes and performance tracking`
    ];
    // Add strategy-specific steps
    strategy.steps.forEach((step, index) => {
        plan.push(`${index + 8}. 🎯 ${step}`);
    });
    return plan;
}
function predictOutcomes(strategy, marketConditions) {
    const baseAPY = strategy.expectedAPY;
    const volatilityMultiplier = marketConditions.volatilityIndex / 100;
    return {
        bestCase: `🚀 Best case: ${(baseAPY * 1.5).toFixed(1)}% APY if market conditions remain favorable and protocol performs exceptionally`,
        worstCase: `📉 Worst case: ${Math.max(0, baseAPY * (0.5 - volatilityMultiplier)).toFixed(1)}% APY or potential loss if market crashes or protocol issues occur`,
        mostLikely: `📊 Most likely: ${(baseAPY * (0.8 + volatilityMultiplier * 0.2)).toFixed(1)}% APY based on historical performance and current market conditions`
    };
}
//# sourceMappingURL=defi-strategies.js.map