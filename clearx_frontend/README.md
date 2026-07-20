# ClearX Frontend (Flutter Web)

A Flutter Web client for the ClearX reconciliation & settlement API. Covers
tenant registration/login, a dashboard summary, a filterable transactions
table, a raw-file upload flow into the normalization pipeline, a source
configuration manager, and running/inspecting reconciliation cycles.

## Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) 3.22+ with web support enabled:
  ```bash
  flutter channel stable
  flutter upgrade
  flutter config --enable-web
  ```
- The ClearX backend running and reachable (see the backend README). Make
  sure `app.enableCors()` is present in the backend's `main.ts` — it's
  required for a browser-based Flutter Web app to call the API from a
  different port.

## Setup

```bash
cd clearx_frontend
flutter pub get
```

## Run in development

```bash
flutter run -d chrome
```

By default the app points at `http://localhost:3000` (the backend's default
port). If your backend runs elsewhere, override it at launch:

```bash
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3000
```

## Build for production

```bash
flutter build web --dart-define=API_BASE_URL=https://your-api-domain.com
```

The build output lands in `build/web/` — serve that directory with any
static file host (nginx, Netlify, Firebase Hosting, an S3 bucket, etc).

## Project layout

```
lib/
  core/
    app_config.dart     API base URL (overridable via --dart-define)
    theme.dart           Color palette, typography, status color mapping
  services/
    api_client.dart      Thin HTTP wrapper: JSON + Bearer token + file upload
    auth_state.dart       ChangeNotifier: login/register/logout, token persistence
  models/                 Plain Dart classes mirroring the backend DTOs/entities
  screens/
    login_screen.dart
    register_screen.dart
    dashboard_screen.dart        GET /dashboard/summary
    transactions_screen.dart     GET /transactions (status/source filters)
    sources_screen.dart          GET/POST /config/sources
    upload_screen.dart           POST /normalization/upload (multipart)
    reconciliation_screen.dart   POST /reconciliation/run, GET /reconciliation-results
  widgets/
    app_shell.dart        Persistent side navigation
    status_pill.dart      Status badge (color-coded)
    metric_card.dart       Dashboard summary card
main.dart                 Provider setup + auth-gated routing
```

## Notes / known gaps

- **Session storage**: the JWT is persisted via `shared_preferences`, which
  on Flutter Web uses browser `localStorage`. Fine for development; for a
  production deployment handling real financial data, consider a
  more hardened session strategy (short-lived tokens + refresh flow,
  `httpOnly` cookies via a BFF, etc).
- **Source configuration UI**: the spec describes a full visual drag-drop
  column mapper ("Configuration Studio"). This build gives you a working
  form where the field mapping is entered as JSON — functionally complete,
  but not the drag-drop wizard. That's a meaningfully larger UI effort
  I've left as a follow-up rather than approximating with something half-built.
- **Manual match / exception handling actions** (adjust amounts, add notes,
  approve from the dashboard) described in the product spec aren't wired
  up yet — the reconciliation results table is currently read-only.
- **Role-based access**: the frontend doesn't distinguish admin vs. regular
  tenant users; it mirrors whatever the backend's JWT guard currently allows.
- **Tests**: no widget/integration tests included yet.
