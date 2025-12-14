export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'WEBSTORE';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Sheet names - pastikan nama ini sama persis dengan nama tab di Google Sheets Anda
export const SHEETS = {
  INVOICES: 'invoices',
  MASTER_ITEMS: 'master_items',
  USERS: 'users',
  INVOICE_SETTINGS: 'invoice_settings',
  ACTIVITY_LOGS: 'activity_logs',
  CATEGORIES: 'categories',
  GRADES: 'grades',
};

// Invoice statuses
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
};

export const INVOICE_STATUS_LABELS = {
  draft: 'Draft',
  sent: 'Terkirim',
  paid: 'Dibayar',
};

export const INVOICE_STATUS_COLORS = {
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date format
export const DATE_FORMAT = 'dd MMMM yyyy';
export const DATE_INPUT_FORMAT = 'yyyy-MM-dd';

// Currency
export const CURRENCY = 'IDR';
export const DEFAULT_PPN_PERCENTAGE = 11;

// Max items per invoice
export const MAX_INVOICE_ITEMS = 5;