"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KNOWN_CURRENCY_CODES = exports.FIELD_ALIASES = exports.ESSENTIAL_FIELDS = void 0;
exports.normalizeHeader = normalizeHeader;
exports.levenshteinDistance = levenshteinDistance;
exports.ESSENTIAL_FIELDS = [
    'primaryMatchKey',
    'amount',
    'currency',
    'transactionDate',
    'type',
];
exports.FIELD_ALIASES = {
    amount: [
        'amount', 'amt', 'txnamount', 'transactionamount', 'value', 'netamount',
        'grossamount', 'totalamount', 'total', 'debitamount', 'creditamount',
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
        'reference', 'ref', 'refno', 'referenceno', 'referencenumber',
        'transactionid', 'txnid', 'txnref', 'bankref', 'bankreference',
        'rrn', 'stan', 'authcode', 'id',
        'المرجع', 'رقمالمرجع', 'الرقمالمرجعي', 'رقمالعملية', 'رقمالحركة',
        'رقمالمعاملة', 'مرجعالعملية',
    ],
};
exports.KNOWN_CURRENCY_CODES = new Set([
    'SAR', 'USD', 'AED', 'EGP', 'KWD', 'BHD', 'QAR', 'OMR', 'JOD', 'EUR',
    'GBP', 'TRY', 'MAD', 'TND', 'DZD', 'IQD', 'LYD', 'SDG', 'YER',
]);
function normalizeHeader(raw) {
    return raw
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[\u064B-\u0652]/g, '')
        .replace(/[\s_\-()./]/g, '');
}
function levenshteinDistance(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++)
        matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++)
        matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }
    return matrix[a.length][b.length];
}
//# sourceMappingURL=field-aliases.js.map