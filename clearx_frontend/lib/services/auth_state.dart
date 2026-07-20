import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/tenant.dart';
import 'api_client.dart';

const _tokenPrefsKey = 'clearx_access_token';

/// App-wide auth/session state. Holds the single shared [ApiClient]
/// instance (with the current JWT attached) so every screen issues
/// authenticated requests without re-plumbing the token themselves.
class AuthState extends ChangeNotifier {
  final ApiClient api = ApiClient();

  String? _token;
  Tenant? _tenant;
  bool _initializing = true;

  String? get token => _token;
  Tenant? get tenant => _tenant;
  bool get isAuthenticated => _token != null;
  bool get initializing => _initializing;

  AuthState() {
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_tokenPrefsKey);
    if (saved != null) {
      _token = saved;
      api.setToken(saved);
    }
    _initializing = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final result = await api.post('/auth/login', body: {
      'email': email,
      'password': password,
    });
    await _applySession(result);
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    String? defaultCurrency,
    String? timezone,
  }) async {
    final result = await api.post('/auth/register', body: {
      'name': name,
      'email': email,
      'password': password,
      if (defaultCurrency != null && defaultCurrency.isNotEmpty)
        'defaultCurrency': defaultCurrency,
      if (timezone != null && timezone.isNotEmpty) 'timezone': timezone,
    });
    await _applySession(result);
  }

  Future<void> _applySession(dynamic result) async {
    final accessToken = result['accessToken'] as String;
    final tenantJson = result['tenant'] as Map<String, dynamic>;

    _token = accessToken;
    _tenant = Tenant.fromJson(tenantJson);
    api.setToken(accessToken);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenPrefsKey, accessToken);

    notifyListeners();
  }

  Future<void> logout() async {
    _token = null;
    _tenant = null;
    api.setToken(null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenPrefsKey);
    notifyListeners();
  }
}
