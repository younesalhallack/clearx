import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/theme.dart';
import 'services/auth_state.dart';
import 'screens/login_screen.dart';
import 'widgets/app_shell.dart';

void main() {
  runApp(const ClearXApp());
}

class ClearXApp extends StatelessWidget {
  const ClearXApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthState(),
      child: MaterialApp(
        title: 'ClearX',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.dark,
        home: const _AuthGate(),
      ),
    );
  }
}

/// Shows a loading state while restoring a persisted session, then routes
/// to either the login screen or the authenticated app shell.
class _AuthGate extends StatelessWidget {
  const _AuthGate();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    if (auth.initializing) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return auth.isAuthenticated ? const AppShell() : const LoginScreen();
  }
}
