import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// ClearX visual identity.
///
/// This is a back-office reconciliation tool, not a marketing site, so the
/// palette favors legibility and calm confidence over spectacle: a deep
/// ink/slate base, a single considered accent (a settled teal-green, evoking
/// ledgers balancing rather than fintech-neon), and a warm amber reserved
/// strictly for discrepancies/attention states so it stays meaningful.
class AppColors {
  static const Color ink = Color(0xFF11161C); // app background
  static const Color surface = Color(0xFF181F27); // cards / panels
  static const Color surfaceRaised = Color(0xFF212B36); // hovered / raised
  static const Color hairline = Color(0xFF2A343F); // dividers, borders
  static const Color textPrimary = Color(0xFFE8ECEF);
  static const Color textMuted = Color(0xFF8B98A5);

  static const Color accent = Color(0xFF2FA88B); // ledger teal — primary actions
  static const Color accentMuted = Color(0xFF1F6E5C);
  static const Color warning = Color(0xFFD9A441); // discrepancies / attention
  static const Color danger = Color(0xFFD9614D); // failures / unmatched
  static const Color success = Color(0xFF2FA88B);
}

class AppTheme {
  static ThemeData get dark {
    final base = ThemeData.dark(useMaterial3: true);
    final textTheme = GoogleFonts.interTextTheme(base.textTheme).apply(
      bodyColor: AppColors.textPrimary,
      displayColor: AppColors.textPrimary,
    );

    return base.copyWith(
      scaffoldBackgroundColor: AppColors.ink,
      colorScheme: base.colorScheme.copyWith(
        primary: AppColors.accent,
        secondary: AppColors.accent,
        surface: AppColors.surface,
        error: AppColors.danger,
      ),
      textTheme: textTheme.copyWith(
        headlineMedium: GoogleFonts.robotoMono(
          textStyle: textTheme.headlineMedium,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
          letterSpacing: -0.5,
        ),
        titleLarge: GoogleFonts.robotoMono(
          textStyle: textTheme.titleLarge,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        labelSmall: textTheme.labelSmall?.copyWith(
          color: AppColors.textMuted,
          letterSpacing: 0.4,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.ink,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: const BorderSide(color: AppColors.hairline),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceRaised,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.hairline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.hairline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.accent, width: 1.4),
        ),
        labelStyle: const TextStyle(color: AppColors.textMuted),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.accent,
          foregroundColor: AppColors.ink,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.textPrimary,
          side: const BorderSide(color: AppColors.hairline),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      dividerTheme: const DividerThemeData(color: AppColors.hairline, thickness: 1),
      dataTableTheme: DataTableThemeData(
        headingTextStyle: GoogleFonts.robotoMono(
          color: AppColors.textMuted,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        dataTextStyle: GoogleFonts.robotoMono(
          color: AppColors.textPrimary,
          fontSize: 13,
        ),
        dividerThickness: 1,
      ),
    );
  }
}

/// Maps a transaction/result status string to a status color, used
/// consistently across dashboard, transactions, and results views.
Color statusColor(String status) {
  switch (status.toUpperCase()) {
    case 'MATCHED':
    case 'MANUALLY_MATCHED':
    case 'EXECUTED':
    case 'ACTIVE':
      return AppColors.success;
    case 'DISCREPANCY':
    case 'DISCREPANCY_AMOUNT':
    case 'DISCREPANCY_MISSING':
    case 'PARTIAL_MATCH':
    case 'FAILED':
    case 'SUSPENDED':
      return AppColors.danger;
    case 'PENDING':
    case 'GENERATED':
    case 'SENT':
    case 'TRIAL':
      return AppColors.warning;
    default:
      return AppColors.textMuted;
  }
}
