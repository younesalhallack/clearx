class SourceConfig {
  final String sourceId;
  final String sourceName;
  final String paymentMethod;
  final Map<String, dynamic> fileFormat;
  final Map<String, dynamic> fieldMapping;
  final Map<String, dynamic>? validationRules;

  SourceConfig({
    required this.sourceId,
    required this.sourceName,
    required this.paymentMethod,
    required this.fileFormat,
    required this.fieldMapping,
    required this.validationRules,
  });

  factory SourceConfig.fromJson(Map<String, dynamic> json) => SourceConfig(
        sourceId: json['sourceId'] ?? '',
        sourceName: json['sourceName'] ?? '',
        paymentMethod: json['paymentMethod'] ?? '',
        fileFormat: Map<String, dynamic>.from(json['fileFormat'] ?? {}),
        fieldMapping: Map<String, dynamic>.from(json['fieldMapping'] ?? {}),
        validationRules: json['validationRules'] != null
            ? Map<String, dynamic>.from(json['validationRules'])
            : null,
      );
}
