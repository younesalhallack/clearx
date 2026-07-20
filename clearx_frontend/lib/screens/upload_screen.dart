import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../models/source_config.dart';
import '../services/api_client.dart';
import '../services/auth_state.dart';

class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key});

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  late Future<List<SourceConfig>> _sourcesFuture;
  String? _selectedSourceId;
  PlatformFile? _pickedFile;
  bool _uploading = false;
  String? _error;
  Map<String, dynamic>? _summary;

  @override
  void initState() {
    super.initState();
    _sourcesFuture = _loadSources();
  }

  Future<List<SourceConfig>> _loadSources() async {
    final api = context.read<AuthState>().api;
    final json = await api.get('/config/sources');
    return (json as List).map((e) => SourceConfig.fromJson(e)).toList();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['csv', 'xlsx', 'xls', 'json'],
      withData: true, // required on Web to get file bytes
    );
    if (result != null && result.files.isNotEmpty) {
      setState(() {
        _pickedFile = result.files.first;
        _summary = null;
        _error = null;
      });
    }
  }

  Future<void> _upload() async {
    if (_selectedSourceId == null) {
      setState(() => _error = 'Choose a source configuration first');
      return;
    }
    if (_pickedFile == null || _pickedFile!.bytes == null) {
      setState(() => _error = 'Choose a file to upload');
      return;
    }

    setState(() {
      _uploading = true;
      _error = null;
      _summary = null;
    });

    try {
      final api = context.read<AuthState>().api;
      final result = await api.uploadFile(
        '/normalization/upload',
        bytes: _pickedFile!.bytes!,
        filename: _pickedFile!.name,
        query: {'sourceId': _selectedSourceId},
      );
      setState(() => _summary = Map<String, dynamic>.from(result));
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'Upload failed: $e');
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upload transaction file')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Upload a raw CSV, Excel, or JSON file from a bank, PSP, or\n'
                  'switch. It will be parsed and normalized using the field\n'
                  'mapping from the source configuration you select.',
                  style: TextStyle(color: AppColors.textMuted),
                ),
                const SizedBox(height: 24),
                FutureBuilder<List<SourceConfig>>(
                  future: _sourcesFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const LinearProgressIndicator();
                    }
                    if (snapshot.hasError) {
                      return Text(
                        'Could not load source configs: ${snapshot.error}',
                        style: const TextStyle(color: AppColors.danger),
                      );
                    }
                    final sources = snapshot.data!;
                    if (sources.isEmpty) {
                      return const Text(
                        'No source configurations exist yet. Create one under '
                        '"Sources" before uploading a file.',
                        style: TextStyle(color: AppColors.warning),
                      );
                    }
                    return DropdownButtonFormField<String>(
                      initialValue: _selectedSourceId,
                      decoration: const InputDecoration(
                          labelText: 'Source configuration'),
                      items: sources
                          .map((s) => DropdownMenuItem(
                                value: s.sourceId,
                                child: Text('${s.sourceName} (${s.sourceId})'),
                              ))
                          .toList(),
                      onChanged: (v) => setState(() => _selectedSourceId = v),
                    );
                  },
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: _pickFile,
                  icon: const Icon(Icons.attach_file),
                  label: Text(_pickedFile?.name ?? 'Choose file'),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _uploading ? null : _upload,
                  child: _uploading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppColors.ink),
                        )
                      : const Text('Upload and normalize'),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Text(_error!,
                      style: const TextStyle(color: AppColors.danger)),
                ],
                if (_summary != null) ...[
                  const SizedBox(height: 24),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Normalization summary',
                            style: TextStyle(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 12),
                          Text('Total records: ${_summary!['totalRecords']}'),
                          Text(
                            'Saved: ${_summary!['savedRecords']}',
                            style: const TextStyle(color: AppColors.success),
                          ),
                          Text(
                            'Rejected: ${_summary!['rejectedRecords']}',
                            style: const TextStyle(color: AppColors.danger),
                          ),
                          if ((_summary!['rejectionReasons'] as List?)
                                  ?.isNotEmpty ??
                              false) ...[
                            const SizedBox(height: 12),
                            const Text(
                              'Rejection reasons',
                              style: TextStyle(
                                  color: AppColors.textMuted, fontSize: 12),
                            ),
                            const SizedBox(height: 4),
                            ...((_summary!['rejectionReasons'] as List)
                                .take(10)
                                .map(
                                  (r) => Text(
                                    '  · row ${r['index']}: ${r['reason']}',
                                    style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textMuted),
                                  ),
                                )),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
