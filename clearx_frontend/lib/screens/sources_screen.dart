import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../models/source_config.dart';
import '../services/api_client.dart';
import '../services/auth_state.dart';

class SourcesScreen extends StatefulWidget {
  const SourcesScreen({super.key});

  @override
  State<SourcesScreen> createState() => _SourcesScreenState();
}

class _SourcesScreenState extends State<SourcesScreen> {
  late Future<List<SourceConfig>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<SourceConfig>> _load() async {
    final api = context.read<AuthState>().api;
    final json = await api.get('/config/sources');
    return (json as List).map((e) => SourceConfig.fromJson(e)).toList();
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _openCreateDialog() async {
    final created = await showDialog<bool>(
      context: context,
      builder: (_) => const _CreateSourceDialog(),
    );
    if (created == true) _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Source configurations'),
        actions: [
          IconButton(onPressed: _refresh, icon: const Icon(Icons.refresh)),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreateDialog,
        icon: const Icon(Icons.add),
        label: const Text('New source'),
      ),
      body: FutureBuilder<List<SourceConfig>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Text(
                'Could not load source configs: ${snapshot.error}',
                style: const TextStyle(color: AppColors.danger),
              ),
            );
          }
          final items = snapshot.data!;
          if (items.isEmpty) {
            return const Center(
              child: Text(
                'No source configs yet. Use "New source" to define how a\n'
                'bank, PSP, or switch file maps onto ClearX transactions.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textMuted),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(24),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final source = items[index];
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              source.sourceName,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceRaised,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              source.paymentMethod,
                              style: const TextStyle(
                                  fontSize: 11, color: AppColors.textMuted),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'sourceId: ${source.sourceId} · format: ${source.fileFormat['type'] ?? '—'}',
                        style: const TextStyle(
                            color: AppColors.textMuted, fontSize: 12),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Mapped fields: ${source.fieldMapping.keys.join(', ')}',
                        style: const TextStyle(
                            color: AppColors.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

/// Dialog form to create a new TenantSourceConfig. The field mapping and
/// validation rules are entered as raw JSON here — a full visual drag-drop
/// column mapper (as described in the product spec) is a larger follow-up
/// UI that would live in its own dedicated "Configuration Studio" flow.
class _CreateSourceDialog extends StatefulWidget {
  const _CreateSourceDialog();

  @override
  State<_CreateSourceDialog> createState() => _CreateSourceDialogState();
}

class _CreateSourceDialogState extends State<_CreateSourceDialog> {
  final _formKey = GlobalKey<FormState>();
  final _sourceIdController = TextEditingController();
  final _sourceNameController = TextEditingController();
  String _paymentMethod = 'BANK_TRANSFER';
  String _fileType = 'csv';
  final _fieldMappingController = TextEditingController(
    text: const JsonEncoder.withIndent('  ').convert({
      'primaryMatchKey': {
        'strategy': 'single_field',
        'fieldName': 'bank_txn_id'
      },
      'amount': {'fieldName': 'amount', 'transform': 'divide:100'},
      'currency': {'fieldName': 'currency_code', 'defaultValue': 'SAR'},
      'transactionDate': {
        'fieldName': 'txn_date',
        'format': 'DD/MM/YYYY HH:mm:ss'
      },
    }),
  );
  bool _submitting = false;
  String? _error;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    Map<String, dynamic> fieldMapping;
    try {
      fieldMapping = jsonDecode(_fieldMappingController.text);
    } catch (_) {
      setState(() => _error = 'Field mapping must be valid JSON');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final api = context.read<AuthState>().api;
      await api.post('/config/sources', body: {
        'sourceId': _sourceIdController.text.trim(),
        'sourceName': _sourceNameController.text.trim(),
        'paymentMethod': _paymentMethod,
        'fileFormat': {
          'type': _fileType,
          'delimiter': ',',
          'encoding': 'utf-8',
          'hasHeader': true,
          'skipRows': 0,
        },
        'fieldMapping': fieldMapping,
      });
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'Request failed: $e');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 560, maxHeight: 640),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'New source configuration',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 20),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        TextFormField(
                          controller: _sourceIdController,
                          decoration: const InputDecoration(
                            labelText: 'Source ID',
                            hintText: 'e.g. bank-of-x-daily-file',
                          ),
                          validator: (v) =>
                              (v == null || v.isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _sourceNameController,
                          decoration:
                              const InputDecoration(labelText: 'Display name'),
                          validator: (v) =>
                              (v == null || v.isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                initialValue: _paymentMethod,
                                decoration: const InputDecoration(
                                    labelText: 'Payment method'),
                                items: const [
                                  'CARD',
                                  'EBPP',
                                  'BANK_TRANSFER',
                                  'WALLET',
                                  'DIRECT_DEBIT',
                                ]
                                    .map((m) => DropdownMenuItem(
                                        value: m, child: Text(m)))
                                    .toList(),
                                onChanged: (v) =>
                                    setState(() => _paymentMethod = v!),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                initialValue: _fileType,
                                decoration: const InputDecoration(
                                    labelText: 'File type'),
                                items: const ['csv', 'xlsx', 'json']
                                    .map((t) => DropdownMenuItem(
                                        value: t, child: Text(t)))
                                    .toList(),
                                onChanged: (v) =>
                                    setState(() => _fileType = v!),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _fieldMappingController,
                          decoration: const InputDecoration(
                              labelText: 'Field mapping (JSON)'),
                          maxLines: 10,
                          style: const TextStyle(
                              fontFamily: 'monospace', fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!,
                      style: const TextStyle(color: AppColors.danger)),
                ],
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      child: const Text('Cancel'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: _submitting ? null : _submit,
                      child: _submitting
                          ? const SizedBox(
                              height: 16,
                              width: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: AppColors.ink),
                            )
                          : const Text('Create'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
