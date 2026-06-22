// modules/invoice/invoice.constants.js

export const INVOICE_STATUS = {
  DRAFT:  "draft",
  ISSUED: "issued",
  VOID:   "void",
};

export const INVOICE_MESSAGES = {
  FETCHED:      "Invoice fetched successfully.",
  LIST_FETCHED: "Invoices fetched successfully.",
  NOT_FOUND:    "Invoice not found.",
  ALREADY_VOID: "Invoice has already been voided.",
  UNAUTHORIZED: "You are not authorized to access this invoice.",
  NOTES_UPDATED:"Invoice notes updated successfully.",
};

export const INVOICE_NUMBER_PREFIX = "INV";

// ── History action labels ──────────────────────────────────────────────────────
export const HISTORY_ACTION = {
  CREATED:          "Invoice Created",
  PAYMENT_RECEIVED: "Payment Received",
  MARKED_DELIVERED: "Marked as Delivered",
  VOIDED:           "Invoice Voided",
  NOTES_UPDATED:    "Notes Updated",
};

export const HISTORY_STATUS = {
  COMPLETED: "Completed",
  PENDING:   "Pending",
  FAILED:    "Failed",
};

// ── Due-date offset (days) ─────────────────────────────────────────────────────
export const DUE_DATE_DAYS = 7;
