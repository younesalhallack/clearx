import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../models/unified_transaction.dart';
import '../services/auth_state.dart';
import '../widgets/status_pill.dart';

const _statuses = ['PENDING', 'MATCHED', 'UNMATCHED', 'DISCREPANCY', 'IGNORED'];
const _sources = [
  'POS',
  'ECOM',
  'ATM',
  'BANK_FILE',
  'SWITCH',
  'PSP',
  'BILLING_SYSTEM'
];

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  String? _status;
  String? _source;
  late Future<List<UnifiedTransaction>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<UnifiedTransaction>> _load() async {
    final api = context.read<AuthState>().api;
    final json = await api.get('/transactions', query: {
      'status': _status,
      'source': _source,
    });
    return (json as List).map((e) => UnifiedTransaction.fromJson(e)).toList();
  }

  void _applyFilters() => setState(() => _future = _load());

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');

    return Scaffold(
      appBar: AppBar(title: const Text('Transactions')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
            child: Row(
              children: [
                SizedBox(
                  width: 220,
                  child: DropdownButtonFormField<String>(
                    initialValue: _status,
                    decoration: const InputDecoration(labelText: 'Status'),
                    items: [
                      const DropdownMenuItem(
                          value: null, child: Text('All statuses')),
                      ..._statuses.map(
                          (s) => DropdownMenuItem(value: s, child: Text(s))),
                    ],
                    onChanged: (v) {
                      setState(() => _status = v);
                      _applyFilters();
                    },
                  ),
                ),
                const SizedBox(width: 16),
                SizedBox(
                  width: 220,
                  child: DropdownButtonFormField<String>(
                    initialValue: _source,
                    decoration: const InputDecoration(labelText: 'Source'),
                    items: [
                      const DropdownMenuItem(
                          value: null, child: Text('All sources')),
                      ..._sources.map(
                          (s) => DropdownMenuItem(value: s, child: Text(s))),
                    ],
                    onChanged: (v) {
                      setState(() => _source = v);
                      _applyFilters();
                    },
                  ),
                ),
                const Spacer(),
                IconButton(
                    onPressed: _applyFilters, icon: const Icon(Icons.refresh)),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<UnifiedTransaction>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(
                    child: Text(
                      'Could not load transactions: ${snapshot.error}',
                      style: const TextStyle(color: AppColors.danger),
                    ),
                  );
                }
                final items = snapshot.data!;
                if (items.isEmpty) {
                  return const Center(
                    child: Text(
                      'No transactions match these filters yet.',
                      style: TextStyle(color: AppColors.textMuted),
                    ),
                  );
                }
                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: DataTable(
                      columns: const [
                        DataColumn(label: Text('Match key')),
                        DataColumn(label: Text('Method')),
                        DataColumn(label: Text('Source')),
                        DataColumn(label: Text('Amount')),
                        DataColumn(label: Text('Type')),
                        DataColumn(label: Text('Date')),
                        DataColumn(label: Text('Status')),
                        DataColumn(label: Text('File')),
                      ],
                      rows: items
                          .map(
                            (t) => DataRow(cells: [
                              DataCell(Text(t.primaryMatchKey)),
                              DataCell(Text(t.paymentMethod)),
                              DataCell(Text(t.source)),
                              DataCell(Text('${t.amount} ${t.currency}')),
                              DataCell(Text(t.type)),
                              DataCell(Text(
                                t.transactionDate != null
                                    ? dateFormat.format(t.transactionDate!)
                                    : '—',
                              )),
                              DataCell(StatusPill(status: t.status)),
                              DataCell(Text(t.sourceFileName,
                                  overflow: TextOverflow.ellipsis)),
                            ]),
                          )
                          .toList(),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
