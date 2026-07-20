import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../models/reconciliation_result.dart';
import '../services/api_client.dart';
import '../services/auth_state.dart';
import '../widgets/status_pill.dart';

const _sources = [
  'POS',
  'ECOM',
  'ATM',
  'BANK_FILE',
  'SWITCH',
  'PSP',
  'BILLING_SYSTEM'
];
const _resultStatuses = [
  'MATCHED',
  'PARTIAL_MATCH',
  'DISCREPANCY_AMOUNT',
  'DISCREPANCY_MISSING',
  'MANUALLY_MATCHED',
];

class ReconciliationScreen extends StatefulWidget {
  const ReconciliationScreen({super.key});

  @override
  State<ReconciliationScreen> createState() => _ReconciliationScreenState();
}

class _ReconciliationScreenState extends State<ReconciliationScreen> {
  String _sourceA = 'SWITCH';
  String _sourceB = 'BANK_FILE';
  bool _running = false;
  String? _runError;
  Map<String, dynamic>? _lastCycleSummary;

  String? _resultStatusFilter;
  late Future<List<ReconciliationResult>> _resultsFuture;

  @override
  void initState() {
    super.initState();
    _resultsFuture = _loadResults();
  }

  Future<List<ReconciliationResult>> _loadResults() async {
    final api = context.read<AuthState>().api;
    final json = await api.get('/reconciliation-results', query: {
      'status': _resultStatusFilter,
    });
    return (json as List).map((e) => ReconciliationResult.fromJson(e)).toList();
  }

  Future<void> _runCycle() async {
    setState(() {
      _running = true;
      _runError = null;
    });
    try {
      final api = context.read<AuthState>().api;
      final result = await api.post('/reconciliation/run', body: {
        'sourceA': _sourceA,
        'sourceB': _sourceB,
      });
      setState(() {
        _lastCycleSummary = Map<String, dynamic>.from(result);
        _resultsFuture = _loadResults();
      });
    } on ApiException catch (e) {
      setState(() => _runError = e.message);
    } catch (e) {
      setState(() => _runError = 'Reconciliation run failed: $e');
    } finally {
      if (mounted) setState(() => _running = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reconciliation')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Run a reconciliation cycle',
                      style:
                          TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Matches PENDING transactions between two sources by primary match key.',
                      style:
                          TextStyle(color: AppColors.textMuted, fontSize: 12),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            initialValue: _sourceA,
                            decoration:
                                const InputDecoration(labelText: 'Source A'),
                            items: _sources
                                .map((s) =>
                                    DropdownMenuItem(value: s, child: Text(s)))
                                .toList(),
                            onChanged: (v) => setState(() => _sourceA = v!),
                          ),
                        ),
                        const SizedBox(width: 16),
                        const Icon(Icons.compare_arrows,
                            color: AppColors.textMuted),
                        const SizedBox(width: 16),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            initialValue: _sourceB,
                            decoration:
                                const InputDecoration(labelText: 'Source B'),
                            items: _sources
                                .map((s) =>
                                    DropdownMenuItem(value: s, child: Text(s)))
                                .toList(),
                            onChanged: (v) => setState(() => _sourceB = v!),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _running ? null : _runCycle,
                      child: _running
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: AppColors.ink),
                            )
                          : const Text('Run reconciliation cycle'),
                    ),
                    if (_runError != null) ...[
                      const SizedBox(height: 12),
                      Text(_runError!,
                          style: const TextStyle(color: AppColors.danger)),
                    ],
                    if (_lastCycleSummary != null) ...[
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 24,
                        runSpacing: 8,
                        children: [
                          _summaryStat(
                              'Cycle',
                              (_lastCycleSummary!['cycleId'] as String)
                                  .substring(0, 8)),
                          _summaryStat(
                              'A records', '${_lastCycleSummary!['totalA']}'),
                          _summaryStat(
                              'B records', '${_lastCycleSummary!['totalB']}'),
                          _summaryStat(
                              'Matched',
                              '${_lastCycleSummary!['matched']}',
                              AppColors.success),
                          _summaryStat(
                              'Amount discrepancies',
                              '${_lastCycleSummary!['discrepancyAmount']}',
                              AppColors.warning),
                          _summaryStat(
                              'Missing counterpart',
                              '${_lastCycleSummary!['discrepancyMissing']}',
                              AppColors.danger),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                const Text(
                  'Reconciliation results',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                SizedBox(
                  width: 240,
                  child: DropdownButtonFormField<String>(
                    initialValue: _resultStatusFilter,
                    decoration:
                        const InputDecoration(labelText: 'Filter by status'),
                    items: [
                      const DropdownMenuItem(
                          value: null, child: Text('All statuses')),
                      ..._resultStatuses.map(
                          (s) => DropdownMenuItem(value: s, child: Text(s))),
                    ],
                    onChanged: (v) {
                      setState(() {
                        _resultStatusFilter = v;
                        _resultsFuture = _loadResults();
                      });
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            FutureBuilder<List<ReconciliationResult>>(
              future: _resultsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 32),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
                if (snapshot.hasError) {
                  return Text(
                    'Could not load results: ${snapshot.error}',
                    style: const TextStyle(color: AppColors.danger),
                  );
                }
                final items = snapshot.data!;
                if (items.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 32),
                    child: Text(
                      'No reconciliation results yet. Run a cycle above to generate some.',
                      style: TextStyle(color: AppColors.textMuted),
                    ),
                  );
                }
                return SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Status')),
                      DataColumn(label: Text('Transaction A')),
                      DataColumn(label: Text('Transaction B')),
                      DataColumn(label: Text('Amount diff')),
                      DataColumn(label: Text('Matched by')),
                      DataColumn(label: Text('Notes')),
                    ],
                    rows: items
                        .map(
                          (r) => DataRow(cells: [
                            DataCell(StatusPill(status: r.status)),
                            DataCell(Text(r.transactionAId.substring(0, 8))),
                            DataCell(
                                Text(r.transactionBId?.substring(0, 8) ?? '—')),
                            DataCell(Text(
                                '${r.amountDifference} ${r.differenceCurrency ?? ''}')),
                            DataCell(Text(r.matchedBy)),
                            DataCell(SizedBox(
                              width: 240,
                              child: Text(r.notes ?? '—',
                                  overflow: TextOverflow.ellipsis),
                            )),
                          ]),
                        )
                        .toList(),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _summaryStat(String label, String value, [Color? color]) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            color: color ?? AppColors.textPrimary,
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ],
    );
  }
}
