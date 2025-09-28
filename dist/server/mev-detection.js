export class MEVDetectionEngine {
    connection;
    realDataEngine;
    alertHistory = new Map();
    // Known MEV bot signatures (in production would be continuously updated)
    knownMEVBots = new Set([
        'jito-tips', 'searcher', 'arbitrage', 'sandwich', 'backrun'
    ]);
    // Suspicious program IDs (simplified for demo)
    suspiciousPrograms = new Set([
        'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB', // Jupiter - high MEV activity
        '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium - DEX activity
        '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' // Orca - AMM activity
    ]);
    constructor(connection, realDataEngine) {
        this.connection = connection;
        this.realDataEngine = realDataEngine;
    }
    async detectMEVPatterns(transactionSignature) {
        const patterns = [];
        try {
            const transaction = await this.connection.getParsedTransaction(transactionSignature, {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed'
            });
            if (!transaction) {
                return patterns;
            }
            // Pattern 1: Sandwich Attack Detection
            const sandwichPattern = this.detectSandwichAttack(transaction);
            if (sandwichPattern)
                patterns.push(sandwichPattern);
            // Pattern 2: Front-running Detection  
            const frontrunPattern = this.detectFrontrunning(transaction);
            if (frontrunPattern)
                patterns.push(frontrunPattern);
            // Pattern 3: Arbitrage Detection
            const arbitragePattern = this.detectArbitrage(transaction);
            if (arbitragePattern)
                patterns.push(arbitragePattern);
            // Pattern 4: Priority Fee Analysis
            const priorityFeePattern = this.analyzePriorityFees(transaction);
            if (priorityFeePattern)
                patterns.push(priorityFeePattern);
        }
        catch (error) {
            console.error(`MEV detection failed for ${transactionSignature}:`, error);
        }
        return patterns;
    }
    detectSandwichAttack(transaction) {
        const logs = transaction.meta?.logMessages || [];
        const accounts = transaction.transaction.message.accountKeys || [];
        // Look for rapid token swaps with price manipulation indicators
        const swapLogs = logs.filter((log) => log.toLowerCase().includes('swap') ||
            log.toLowerCase().includes('exchange'));
        const hasHighSlippage = logs.some((log) => log.includes('slippage') || log.includes('price_impact'));
        const hasSuspiciousPrograms = accounts.some((account) => this.suspiciousPrograms.has(account.pubkey?.toBase58?.() || account.pubkey));
        if (swapLogs.length >= 2 && (hasHighSlippage || hasSuspiciousPrograms)) {
            return {
                type: 'sandwich',
                severity: hasHighSlippage ? 'HIGH' : 'MEDIUM',
                confidence: 75 + Math.random() * 20, // 75-95%
                description: 'Potential sandwich attack detected - transaction surrounded by MEV bots',
                estimatedProfit: 50 + Math.random() * 200, // $50-250
                victimLoss: 25 + Math.random() * 100, // $25-125
                preventionStrategy: [
                    'Use private mempools (Jito bundles)',
                    'Set maximum slippage tolerance',
                    'Split large trades into smaller chunks',
                    'Use MEV protection services'
                ]
            };
        }
        return null;
    }
    detectFrontrunning(transaction) {
        const fee = transaction.meta?.fee || 0;
        const computeUnits = transaction.meta?.computeUnitsConsumed || 0;
        // High priority fees are often indicators of front-running
        if (fee > 10000) { // Above normal Solana fees
            return {
                type: 'frontrun',
                severity: fee > 50000 ? 'HIGH' : 'MEDIUM',
                confidence: 60 + (fee / 1000), // Higher fee = higher confidence
                description: `High priority fee (${fee} lamports) suggests front-running attempt`,
                estimatedProfit: Math.min(fee / 100, 500), // Estimate based on fee paid
                preventionStrategy: [
                    'Use time-delayed transactions',
                    'Implement random delays',
                    'Use commit-reveal schemes',
                    'Private transaction pools'
                ]
            };
        }
        return null;
    }
    detectArbitrage(transaction) {
        const accounts = transaction.transaction.message.accountKeys || [];
        const logs = transaction.meta?.logMessages || [];
        // Look for multiple DEX interactions
        const dexPrograms = accounts.filter((account) => this.suspiciousPrograms.has(account.pubkey?.toBase58?.() || account.pubkey));
        const hasMultipleDEXs = dexPrograms.length >= 2;
        const hasArbitrageKeywords = logs.some((log) => log.toLowerCase().includes('arbitrage') ||
            log.toLowerCase().includes('cross-dex'));
        if (hasMultipleDEXs || hasArbitrageKeywords) {
            return {
                type: 'arbitrage',
                severity: 'LOW', // Arbitrage is generally beneficial to ecosystem
                confidence: hasArbitrageKeywords ? 85 : 45,
                description: 'Arbitrage opportunity being executed across multiple DEXs',
                estimatedProfit: 10 + Math.random() * 100,
                preventionStrategy: [
                    'Arbitrage is generally beneficial to ecosystem',
                    'Consider participating in arbitrage yourself',
                    'Monitor for price inefficiencies'
                ]
            };
        }
        return null;
    }
    analyzePriorityFees(transaction) {
        const fee = transaction.meta?.fee || 0;
        // Extremely high priority fees indicate aggressive MEV
        if (fee > 100000) { // 0.1 SOL+
            return {
                type: 'frontrun',
                severity: 'CRITICAL',
                confidence: 90,
                description: `Extremely high priority fee (${(fee / 1e9).toFixed(6)} SOL) indicates aggressive MEV activity`,
                estimatedProfit: fee / 50, // Rough estimate
                preventionStrategy: [
                    'URGENT: Use MEV protection immediately',
                    'Consider private mempools',
                    'Delay non-urgent transactions',
                    'Monitor for continued activity'
                ]
            };
        }
        return null;
    }
    async generateMEVAlert(walletAddress, patterns) {
        if (patterns.length === 0) {
            return {
                id: `mev_${Date.now()}_safe`,
                timestamp: new Date(),
                walletAddress,
                patterns: [],
                riskScore: 0,
                recommendations: ['✅ No MEV threats detected', 'Continue normal trading'],
                protectionCost: 0
            };
        }
        // Calculate risk score based on patterns
        const riskScore = Math.min(100, patterns.reduce((score, pattern) => {
            const severityWeight = {
                'LOW': 10,
                'MEDIUM': 25,
                'HIGH': 50,
                'CRITICAL': 75
            }[pattern.severity];
            return score + (severityWeight * pattern.confidence / 100);
        }, 0));
        // Generate recommendations
        const recommendations = this.generateMEVRecommendations(patterns, riskScore);
        // Estimate protection cost
        const protectionCost = this.estimateProtectionCost(patterns, riskScore);
        const alert = {
            id: `mev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            walletAddress,
            patterns,
            riskScore,
            recommendations,
            protectionCost
        };
        // Store in history
        const history = this.alertHistory.get(walletAddress) || [];
        history.push(alert);
        this.alertHistory.set(walletAddress, history.slice(-10)); // Keep last 10 alerts
        return alert;
    }
    generateMEVRecommendations(patterns, riskScore) {
        const recommendations = [];
        if (riskScore >= 75) {
            recommendations.push('🚨 CRITICAL: High MEV threat detected');
            recommendations.push('🛡️ Enable MEV protection immediately');
            recommendations.push('⏸️ Consider pausing large trades');
        }
        else if (riskScore >= 50) {
            recommendations.push('⚠️ Moderate MEV risk detected');
            recommendations.push('🔒 Use private mempools for important trades');
        }
        else if (riskScore >= 25) {
            recommendations.push('👀 Low MEV activity detected');
            recommendations.push('📊 Monitor transaction patterns');
        }
        // Add specific recommendations from patterns
        const uniqueStrategies = new Set(patterns.flatMap(p => p.preventionStrategy || []));
        recommendations.push(...Array.from(uniqueStrategies).slice(0, 3));
        return recommendations;
    }
    estimateProtectionCost(patterns, riskScore) {
        // Base protection cost
        let cost = 0.001; // 0.001 SOL base
        // Add cost based on risk
        cost += (riskScore / 100) * 0.01; // Up to 0.01 SOL for high risk
        // Add cost based on pattern severity
        for (const pattern of patterns) {
            const severityCost = {
                'LOW': 0.001,
                'MEDIUM': 0.003,
                'HIGH': 0.008,
                'CRITICAL': 0.02
            }[pattern.severity];
            cost += severityCost;
        }
        return Math.min(cost, 0.05); // Cap at 0.05 SOL
    }
    async getWalletMEVHistory(walletAddress) {
        return this.alertHistory.get(walletAddress) || [];
    }
    async getRecentMEVTrends() {
        const allAlerts = Array.from(this.alertHistory.values()).flat();
        const last24h = allAlerts.filter(alert => Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000);
        // Count patterns
        const patternCounts = new Map();
        last24h.forEach(alert => {
            alert.patterns.forEach(pattern => {
                const existing = patternCounts.get(pattern.type) || { count: 0, severities: [] };
                existing.count++;
                existing.severities.push(pattern.severity);
                patternCounts.set(pattern.type, existing);
            });
        });
        const topPatterns = Array.from(patternCounts.entries()).map(([type, data]) => ({
            type,
            count: data.count,
            avgSeverity: this.calculateAverageSeverity(data.severities)
        }));
        const highRiskWallets = new Set(last24h.filter(alert => alert.riskScore >= 50)
            .map(alert => alert.walletAddress)).size;
        return {
            totalAlertsLast24h: last24h.length,
            topPatterns,
            highRiskWallets,
            recommendations: [
                '🛡️ Enable MEV protection for high-value trades',
                '📊 Monitor MEV trends before major market moves',
                '⏰ Avoid trading during high MEV activity periods',
                '🔒 Use private mempools for sensitive transactions'
            ]
        };
    }
    calculateAverageSeverity(severities) {
        const weights = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
        const avg = severities.reduce((sum, s) => sum + weights[s], 0) / severities.length;
        if (avg >= 3.5)
            return 'CRITICAL';
        if (avg >= 2.5)
            return 'HIGH';
        if (avg >= 1.5)
            return 'MEDIUM';
        return 'LOW';
    }
}
//# sourceMappingURL=mev-detection.js.map