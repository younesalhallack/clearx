import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../models/dashboard_summary.dart';
import '../services/auth_state.dart';
import '../widgets/metric_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<DashboardSummary> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<DashboardSummary> _load() async {
    final api = context.read<AuthState>().api;
    final json = await api.get('/dashboard/summary');
    return DashboardSummary.fromJson(json);
  }

  void _refresh() => setState(() => _future = _load());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(onPressed: _refresh, icon: const Icon(Icons.refresh)),
          const SizedBox(width: 8),
        ],
      ),
      body: FutureBuilder<DashboardSummary>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Text(
                'Could not load dashboard summary: ${snapshot.error}',
                style: const TextStyle(color: AppColors.danger),
              ),
            );
          }
          final summary = snapshot.data!;
          return Padding(
            padding: const EdgeInsets.all(24),
            child: GridView.count(
              crossAxisCount: 3,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.7,
              children: [
                MetricCard(
                  label: 'Total transactions',
                  value: summary.totalTransactions.toString(),
                ),
                MetricCard(
                  label: 'Matched',
                  value: '${summary.matchedCount} (${summary.matchedPercentage.toStringAsFixed(1)}%)',
                  accentColor: AppColors.success,
                ),
                MetricCard(
                  label: 'Unmatched',
                  value: summary.unmatchedCount.toString(),
                  accentColor: AppColors.danger,
                ),
                MetricCard(
                  label: 'Discrepancies',
                  value: summary.discrepancyCount.toString(),
                  accentColor: AppColors.warning,
                ),
                MetricCard(
                  label: 'Net settlement amount',
                  value: summary.netSettlementAmount,
                  accentColor: AppColors.accent,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
