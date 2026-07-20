class FieldSuggestion {
  final String targetField;
  final String? matchedColumn;
  final double confidence;
  final String reason;

  FieldSuggestion({
    required this.targetField,
    required this.matchedColumn,
    required this.confidence,
    required this.reason,
  });

  factory FieldSuggestion.fromJson(Map<String, dynamic> json) => FieldSuggestion(
        targetField: json['targetField'] ?? '',
        matchedColumn: json['matchedColumn'],
        confidence: (json['confidence'] ?? 0).toDouble(),
        reason: json['reason'] ?? '',
      );
}

class MatchedSourceConfig {
  final String sourceId;
  final String sourceName;

  MatchedSourceConfig({required this.sourceId, required this.sourceName});

  factory MatchedSourceConfig.fromJson(Map<String, dynamic> json) => MatchedSourceConfig(
        sourceId: json['sourceId'] ?? '',
        sourceName: json['sourceName'] ?? '',
      );
}

class DetectionResult {
  final String signature;
  final List<String> headers;
  final List<Map<String, dynamic>> sampleRows;
  final Map<String, dynamic> guessedFileFormat;
  final MatchedSourceConfig? matchedConfig;
  final List<FieldSuggestion>? suggestions;
  final bool allEssentialFieldsCovered;

  DetectionResult({
    required this.signature,
    required this.headers,
    required this.sampleRows,
    required this.guessedFileFormat,
    required this.matchedConfig,
    required this.suggestions,
    required this.allEssentialFieldsCovered,
  });

  factory DetectionResult.fromJson(Map<String, dynamic> json) => DetectionResult(
        signature: json['signature'] ?? '',
        headers: List<String>.from(json['headers'] ?? []),
        sampleRows: List<Map<String, dynamic>>.from(json['sampleRows'] ?? []),
        guessedFileFormat: Map<String, dynamic>.from(json['guessedFileFormat'] ?? {}),
        matchedConfig: json['matchedConfig'] != null
            ? MatchedSourceConfig.fromJson(json['matchedConfig'])
            : null,
        suggestions: json['suggestions'] != null
            ? (json['suggestions'] as List).map((e) => FieldSuggestion.fromJson(e)).toList()
            : null,
        allEssentialFieldsCovered: json['allEssentialFieldsCovered'] ?? false,
      );
}
