class DashboardSummary {
  final int totalTransactions;
  final int matchedCount;
  final double matchedPercentage;
  final int unmatchedCount;
  final int discrepancyCount;
  final String netSettlementAmount;

  DashboardSummary({
    required this.totalTransactions,
    required this.matchedCount,
    required this.matchedPercentage,
    required this.unmatchedCount,
    required this.discrepancyCount,
    required this.netSettlementAmount,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) => DashboardSummary(
        totalTransactions: json['totalTransactions'] ?? 0,
        matchedCount: json['matchedCount'] ?? 0,
        matchedPercentage: (json['matchedPercentage'] ?? 0).toDouble(),
        unmatchedCount: json['unmatchedCount'] ?? 0,
        discrepancyCount: json['discrepancyCount'] ?? 0,
        netSettlementAmount: json['netSettlementAmount']?.toString() ?? '0',
      );
}
