import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../services/auth_state.dart';
import '../screens/dashboard_screen.dart';
import '../screens/transactions_screen.dart';
import '../screens/sources_screen.dart';
import '../screens/upload_screen.dart';
import '../screens/reconciliation_screen.dart';

class _NavItem {
  final String label;
  final IconData icon;
  final Widget screen;
  const _NavItem(this.label, this.icon, this.screen);
}

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _selected = 0;

  static final List<_NavItem> _items = [
    const _NavItem('Dashboard', Icons.dashboard_outlined, DashboardScreen()),
    const _NavItem('Transactions', Icons.receipt_long_outlined, TransactionsScreen()),
    const _NavItem('Upload File', Icons.upload_file_outlined, UploadScreen()),
    const _NavItem('Reconciliation', Icons.compare_arrows_outlined, ReconciliationScreen()),
    const _NavItem('Sources', Icons.settings_input_component_outlined, SourcesScreen()),
  ];

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    return Scaffold(
      body: Row(
        children: [
          Container(
            width: 240,
            color: AppColors.surface,
            child: SafeArea(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.fromLTRB(20, 24, 20, 8),
                    child: Text(
                      'CLEARX',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Text(
                      auth.tenant?.name ?? '',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Divider(height: 1),
                  const SizedBox(height: 8),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _items.length,
                      itemBuilder: (context, index) {
                        final item = _items[index];
                        final isSelected = index == _selected;
                        return Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () => setState(() => _selected = index),
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              decoration: BoxDecoration(
                                color: isSelected ? AppColors.surfaceRaised : null,
                                borderRadius: BorderRadius.circular(8),
                                border: isSelected
                                    ? Border.all(color: AppColors.hairline)
                                    : null,
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    item.icon,
                                    size: 18,
                                    color: isSelected ? AppColors.accent : AppColors.textMuted,
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    item.label,
                                    style: TextStyle(
                                      color: isSelected
                                          ? AppColors.textPrimary
                                          : AppColors.textMuted,
                                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const Divider(height: 1),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: TextButton.icon(
                      onPressed: () => context.read<AuthState>().logout(),
                      icon: const Icon(Icons.logout, size: 16, color: AppColors.textMuted),
                      label: const Text(
                        'Sign out',
                        style: TextStyle(color: AppColors.textMuted),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const VerticalDivider(width: 1),
          Expanded(
            child: _items[_selected].screen,
          ),
        ],
      ),
    );
  }
}
