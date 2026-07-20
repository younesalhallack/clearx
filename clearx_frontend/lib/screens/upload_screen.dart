import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../models/detection_result.dart';
import '../services/api_client.dart';
import '../services/auth_state.dart';

const _essentialFieldLabels = {
  'primaryMatchKey': 'Matching key (reference used to pair transactions)',
  'amount': 'Amount',
  'currency': 'Currency',
  'transactionDate': 'Transaction date',
  'type': 'Type (credit/debit)',
};

const _paymentMethods = [
  'CARD',
  'EBPP',
  'BANK_TRANSFER',
  'WALLET',
  'DIRECT_DEBIT'
];

/// Upload flow with no upfront schema requirement: the tenant just picks a
/// file. The backend analyzes it (POST /normalization/detect):
///  - if it recognizes the file's column shape from a previously confirmed
///    mapping, it's imported immediately with no extra step;
///  - otherwise, suggested field mappings (with confidence scores) are
///    shown for review — nothing is imported until the tenant explicitly
///    confirms, regardless of how confident the suggestions are.
class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key});

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

enum _Stage { pickFile, analyzing, review, importing, done }

class _UploadScreenState extends State<UploadScreen> {
  PlatformFile? _pickedFile;
  _Stage _stage = _Stage.pickFile;
  String? _error;

  DetectionResult? _detection;
  Map<String, dynamic>? _finalSummary;
  String? _recognizedSourceName;

  // Review-stage form state.
  final _sourceIdController = TextEditingController();
  final _sourceNameController = TextEditingController();
  String _paymentMethod = 'BANK_TRANSFER';
  late Map<String, String?> _fieldSelections; // targetField -> chosen column

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['csv', 'xlsx', 'xls', 'json'],
      withData: true, // required on Web to get file bytes
    );
    if (result != null && result.files.isNotEmpty) {
      setState(() {
        _pickedFile = result.files.first;
        _error = null;
        _detection = null;
        _finalSummary = null;
        _recognizedSourceName = null;
        _stage = _Stage.pickFile;
      });
    }
  }

  Future<void> _analyze() async {
    if (_pickedFile == null || _pickedFile!.bytes == null) {
      setState(() => _error = 'Choose a file first');
      return;
    }

    setState(() {
      _stage = _Stage.analyzing;
      _error = null;
    });

    try {
      final api = context.read<AuthState>().api;
      final result = await api.uploadFile(
        '/normalization/detect',
        bytes: _pickedFile!.bytes!,
        filename: _pickedFile!.name,
      );
      final detection = DetectionResult.fromJson(result);

      if (detection.matchedConfig != null) {
        // Recognized shape — a human already confirmed this mapping on a
        // previous upload, so we import immediately with no extra step.
        await _importRecognized(detection.matchedConfig!.sourceId,
            detection.matchedConfig!.sourceName);
        return;
      }

      // New shape — always show suggestions for review, never auto-import,
      // regardless of how confident the suggestions are.
      setState(() {
        _detection = detection;
        _fieldSelections = {
          for (final s in detection.suggestions ?? <FieldSuggestion>[])
            s.targetField: s.matchedColumn,
        };
        _sourceIdController.text = _slugify(_pickedFile!.name);
        _sourceNameController.text = _pickedFile!.name;
        _stage = _Stage.review;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _stage = _Stage.pickFile;
      });
    } catch (e) {
      setState(() {
        _error = 'Analysis failed: $e';
        _stage = _Stage.pickFile;
      });
    }
  }

  Future<void> _importRecognized(String sourceId, String sourceName) async {
    setState(() {
      _stage = _Stage.importing;
      _recognizedSourceName = sourceName;
    });
    try {
      final api = context.read<AuthState>().api;
      final result = await api.uploadFile(
        '/normalization/upload',
        bytes: _pickedFile!.bytes!,
        filename: _pickedFile!.name,
        query: {'sourceId': sourceId},
      );
      setState(() {
        _finalSummary = Map<String, dynamic>.from(result);
        _stage = _Stage.done;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _stage = _Stage.pickFile;
      });
    } catch (e) {
      setState(() {
        _error = 'Import failed: $e';
        _stage = _Stage.pickFile;
      });
    }
  }

  Future<void> _confirmAndImport() async {
    final missing = _essentialFieldLabels.keys
        .where((field) =>
            _fieldSelections[field] == null || _fieldSelections[field]!.isEmpty)
        .toList();
    if (missing.isNotEmpty) {
      setState(
          () => _error = 'Choose a column for every field before confirming');
      return;
    }
    if (_sourceIdController.text.trim().isEmpty ||
        _sourceNameController.text.trim().isEmpty) {
      setState(() => _error = 'Source ID and name are required');
      return;
    }

    setState(() {
      _stage = _Stage.importing;
      _error = null;
    });

    final fieldMapping = <String, dynamic>{
      for (final entry in _fieldSelections.entries)
        entry.key: {'strategy': 'single_field', 'fieldName': entry.value},
    };

    try {
      final api = context.read<AuthState>().api;
      final result = await api.uploadFile(
        '/normalization/confirm-and-import',
        bytes: _pickedFile!.bytes!,
        filename: _pickedFile!.name,
        fields: {
          'columnSignature': _detection!.signature,
          'sourceId': _sourceIdController.text.trim(),
          'sourceName': _sourceNameController.text.trim(),
          'paymentMethod': _paymentMethod,
          'fileFormat': jsonEncode(_detection!.guessedFileFormat),
          'fieldMapping': jsonEncode(fieldMapping),
        },
      );
      setState(() {
        _finalSummary = Map<String, dynamic>.from(result['summary']);
        _stage = _Stage.done;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _stage = _Stage.review;
      });
    } catch (e) {
      setState(() {
        _error = 'Import failed: $e';
        _stage = _Stage.review;
      });
    }
  }

  void _reset() {
    setState(() {
      _pickedFile = null;
      _detection = null;
      _finalSummary = null;
      _recognizedSourceName = null;
      _error = null;
      _stage = _Stage.pickFile;
    });
  }

  String _slugify(String filename) {
    final base = filename.split('.').first;
    return base
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'(^-+|-+$)'), '');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upload transaction file')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Upload a raw CSV, Excel, or JSON file from a bank, PSP, or '
                  'switch — no predefined template required. The system '
                  'analyzes the file and suggests how its columns map onto '
                  'ClearX fields. Once you confirm a mapping, files with the '
                  'same column structure are recognized and imported '
                  'automatically from then on.',
                  style: TextStyle(color: AppColors.textMuted),
                ),
                const SizedBox(height: 24),
                if (_stage == _Stage.pickFile ||
                    _stage == _Stage.analyzing) ...[
                  OutlinedButton.icon(
                    onPressed: _stage == _Stage.analyzing ? null : _pickFile,
                    icon: const Icon(Icons.attach_file),
                    label: Text(_pickedFile?.name ?? 'Choose file'),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _stage == _Stage.analyzing ? null : _analyze,
                    child: _stage == _Stage.analyzing
                        ? const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SizedBox(
                                height: 16,
                                width: 16,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: AppColors.ink),
                              ),
                              SizedBox(width: 10),
                              Text('Analyzing file...'),
                            ],
                          )
                        : const Text('Analyze file'),
                  ),
                ],
                if (_stage == _Stage.importing) ...[
                  const Center(child: CircularProgressIndicator()),
                  if (_recognizedSourceName != null) ...[
                    const SizedBox(height: 12),
                    Center(
                      child: Text(
                        'Recognized as "$_recognizedSourceName" — importing automatically...',
                        style: const TextStyle(color: AppColors.textMuted),
                      ),
                    ),
                  ],
                ],
                if (_stage == _Stage.review && _detection != null)
                  _buildReviewForm(),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Text(_error!,
                      style: const TextStyle(color: AppColors.danger)),
                ],
                if (_stage == _Stage.done && _finalSummary != null)
                  _buildSummaryCard(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReviewForm() {
    final detection = _detection!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  detection.allEssentialFieldsCovered
                      ? Icons.check_circle_outline
                      : Icons.info_outline,
                  size: 18,
                  color: detection.allEssentialFieldsCovered
                      ? AppColors.success
                      : AppColors.warning,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    detection.allEssentialFieldsCovered
                        ? 'New file shape — all fields were confidently detected. Review before confirming.'
                        : 'New file shape — some fields need your input.',
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ..._essentialFieldLabels.entries.map((entry) {
              final suggestion = detection.suggestions?.firstWhere(
                (s) => s.targetField == entry.key,
                orElse: () => FieldSuggestion(
                  targetField: entry.key,
                  matchedColumn: null,
                  confidence: 0,
                  reason: '',
                ),
              );
              return Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      flex: 2,
                      child: Text(entry.value,
                          style: const TextStyle(fontSize: 13)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: DropdownButtonFormField<String>(
                        initialValue: _fieldSelections[entry.key],
                        decoration: const InputDecoration(labelText: 'Column'),
                        items: detection.headers
                            .map((h) => DropdownMenuItem(
                                value: h,
                                child:
                                    Text(h, overflow: TextOverflow.ellipsis)))
                            .toList(),
                        onChanged: (v) =>
                            setState(() => _fieldSelections[entry.key] = v),
                      ),
                    ),
                    const SizedBox(width: 12),
                    SizedBox(
                      width: 56,
                      child:
                          suggestion != null && suggestion.matchedColumn != null
                              ? Text(
                                  '${(suggestion.confidence * 100).round()}%',
                                  textAlign: TextAlign.end,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: suggestion.confidence >= 0.6
                                        ? AppColors.success
                                        : AppColors.warning,
                                  ),
                                )
                              : const Text('—',
                                  textAlign: TextAlign.end,
                                  style: TextStyle(color: AppColors.textMuted)),
                    ),
                  ],
                ),
              );
            }),
            const Divider(height: 32),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _sourceIdController,
                    decoration: const InputDecoration(
                        labelText: 'Source ID (for future recognition)'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _sourceNameController,
                    decoration:
                        const InputDecoration(labelText: 'Display name'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _paymentMethod,
              decoration: const InputDecoration(labelText: 'Payment method'),
              items: _paymentMethods
                  .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                  .toList(),
              onChanged: (v) => setState(() => _paymentMethod = v!),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                TextButton(onPressed: _reset, child: const Text('Cancel')),
                const Spacer(),
                ElevatedButton(
                  onPressed: _confirmAndImport,
                  child: const Text('Confirm and import'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard() {
    final summary = _finalSummary!;
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.check_circle_outline,
                      size: 18, color: AppColors.success),
                  SizedBox(width: 8),
                  Text('Import complete',
                      style: TextStyle(fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 12),
              Text('Total records: ${summary['totalRecords']}'),
              Text('Saved: ${summary['savedRecords']}',
                  style: const TextStyle(color: AppColors.success)),
              Text('Rejected: ${summary['rejectedRecords']}',
                  style: const TextStyle(color: AppColors.danger)),
              const SizedBox(height: 16),
              OutlinedButton(
                  onPressed: _reset, child: const Text('Upload another file')),
            ],
          ),
        ),
      ),
    );
  }
}
