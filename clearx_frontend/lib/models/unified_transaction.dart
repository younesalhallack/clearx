class UnifiedTransaction {
  final String id;
  final String paymentMethod;
  final String primaryMatchKey;
  final String amount;
  final String currency;
  final String type;
  final DateTime? transactionDate;
  final String status;
  final String source;
  final String sourceFileName;

  UnifiedTransaction({
    required this.id,
    required this.paymentMethod,
    required this.primaryMatchKey,
    required this.amount,
    required this.currency,
    required this.type,
    required this.transactionDate,
    required this.status,
    required this.source,
    required this.sourceFileName,
  });

  factory UnifiedTransaction.fromJson(Map<String, dynamic> json) => UnifiedTransaction(
        id: json['id'] ?? '',
        paymentMethod: json['paymentMethod'] ?? '',
        primaryMatchKey: json['primaryMatchKey'] ?? '',
        amount: json['amount']?.toString() ?? '0',
        currency: json['currency'] ?? '',
        type: json['type'] ?? '',
        transactionDate: json['transactionDate'] != null
            ? DateTime.tryParse(json['transactionDate'])
            : null,
        status: json['status'] ?? '',
        source: json['source'] ?? '',
        sourceFileName: json['sourceFileName'] ?? '',
      );
}
