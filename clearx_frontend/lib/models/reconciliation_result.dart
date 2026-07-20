class ReconciliationResult {
  final String id;
  final String transactionAId;
  final String? transactionBId;
  final String status;
  final String amountDifference;
  final String? differenceCurrency;
  final String matchedBy;
  final String? notes;
  final DateTime? createdAt;

  ReconciliationResult({
    required this.id,
    required this.transactionAId,
    required this.transactionBId,
    required this.status,
    required this.amountDifference,
    required this.differenceCurrency,
    required this.matchedBy,
    required this.notes,
    required this.createdAt,
  });

  factory ReconciliationResult.fromJson(Map<String, dynamic> json) => ReconciliationResult(
        id: json['id'] ?? '',
        transactionAId: json['transactionAId'] ?? '',
        transactionBId: json['transactionBId'],
        status: json['status'] ?? '',
        amountDifference: json['amountDifference']?.toString() ?? '0',
        differenceCurrency: json['differenceCurrency'],
        matchedBy: json['matchedBy'] ?? '',
        notes: json['notes'],
        createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      );
}
