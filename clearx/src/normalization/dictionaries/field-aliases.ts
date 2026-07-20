/**
 * Bilingual (Arabic + English) alias dictionary used by
 * SchemaDetectionService to guess which raw column in an uploaded file
 * corresponds to each essential UnifiedTransaction field, based purely on
 * column naming — independent of any tenant-defined field mapping.
 *
 * Aliases are stored already normalized (see normalizeHeader below):
 * lowercase, no spaces/underscores/dashes, Arabic diacritics stripped.
 */

export const ESSENTIAL_FIELDS = [
  'primaryMatchKey',
  'amount',
  'currency',
  'transactionDate',
  'type',
] as const;

export type EssentialField = (typeof ESSENTIAL_FIELDS)[number];

export const FIELD_ALIASES: Record<EssentialField, string[]> = {
  amount: [
    // English
    'amount', 'amt', 'txnamount', 'transactionamount', 'value', 'netamount',
    'grossamount', 'totalamount', 'total', 'debitamount', 'creditamount',
    // Arabic
    'المبلغ', 'مبلغ', 'القيمة', 'قيمة', 'الاجمالي', 'الإجمالي', 'صافي',
    'صافيالمبلغ', 'اجماليالمبلغ', 'قيمةالعملية', 'مبلغالعملية',
  ],
  currency: [
    'currency', 'curr', 'ccy', 'currencycode',
    'العملة', 'عملة', 'رمزالعملة', 'نوعالعملة',
  ],
  transactionDate: [
    'date', 'txndate', 'transactiondate', 'valuedate', 'postingdate',
    'processdate', 'entrydate', 'datetime',
    'التاريخ', 'تاريخ', 'تاريخالعملية', 'تاريخالمعاملة', 'تاريخالحركة',
    'تاريخالقيد', 'تاريخالتنفيذ',
  ],
  type: [
    'type', 'txntype', 'transactiontype', 'entrytype', 'drcr', 'dc',
    'النوع', 'نوع', 'نوعالعملية', 'نوعالحركة', 'دائنمدين',
  ],
  primaryMatchKey: [
    // These describe reference/identifier-style columns. Naming alone is
    // a weaker signal here than for the other fields — see
    // SchemaDetectionService, which leans more heavily on uniqueness of
    // values in the column for this particular field.
    'reference', 'ref', 'refno', 'referenceno', 'referencenumber',
    'transactionid', 'txnid', 'txnref', 'bankref', 'bankreference',
    'rrn', 'stan', 'authcode', 'id',
    'المرجع', 'رقمالمرجع', 'الرقمالمرجعي', 'رقمالعملية', 'رقمالحركة',
    'رقمالمعاملة', 'مرجعالعملية',
  ],
};

/** Known 3-letter currency codes, used for data-pattern sniffing. */
export const KNOWN_CURRENCY_CODES = new Set([
  'SAR', 'USD', 'AED', 'EGP', 'KWD', 'BHD', 'QAR', 'OMR', 'JOD', 'EUR',
  'GBP', 'TRY', 'MAD', 'TND', 'DZD', 'IQD', 'LYD', 'SDG', 'YER',
]);

/**
 * Normalizes a raw header string for comparison against the alias
 * dictionary: lowercases (Latin only — a no-op on Arabic), strips Arabic
 * diacritics (tashkeel), and removes spaces, underscores, dashes, and
 * parentheses so that "Bank Ref", "bank_ref", and "BANK-REF()" all
 * collapse to the same normalized form.
 */
export function normalizeHeader(raw: string): string {
  return raw
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, '') // Arabic diacritics (tashkeel)
    .replace(/[\s_\-()./]/g, '');
}

/**
 * Very small Levenshtein distance implementation used to catch near-miss
 * spellings (e.g. "Trasaction Date") that wouldn't otherwise match an
 * alias exactly or via substring containment.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}
