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
};

export const INVOICE_NUMBER_PREFIX = "INV";