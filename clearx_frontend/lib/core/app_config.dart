/// Central place to configure how the frontend reaches the ClearX API.
///
/// For local development this defaults to the NestJS server started via
/// `npm run start:dev` on port 3000. Override at build/run time with:
///
///   flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3000
class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );
}
