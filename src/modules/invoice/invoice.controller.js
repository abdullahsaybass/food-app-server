// modules/invoice/invoice.controller.js
import invoiceService                  from "./invoice.service.js";
import { mapInvoice, mapInvoiceList }  from "./invoice.mapper.js";
import { INVOICE_MESSAGES }            from "./invoice.constants.js";
import asyncHandler                    from "../../utils/asyncHandler.js";

export const getMyInvoices = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.validatedQuery;
  const { invoices, total } = await invoiceService.getMyInvoices(req.user._id, { page, limit, status });
  res.status(200).json({
    success: true,
    message: INVOICE_MESSAGES.LIST_FETCHED,
    data:    mapInvoiceList(invoices, { page, limit, total }),
  });
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
  const invoice = await invoiceService.getInvoiceById(req.params.id, req.user._id, isAdmin);
  res.status(200).json({
    success: true,
    message: INVOICE_MESSAGES.FETCHED,
    data:    mapInvoice(invoice),
  });
});

export const getInvoiceByOrderId = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
  const invoice = await invoiceService.getInvoiceByOrderId(req.params.orderId, req.user._id, isAdmin);
  res.status(200).json({
    success: true,
    message: INVOICE_MESSAGES.FETCHED,
    data:    mapInvoice(invoice),
  });
});

export const getAllInvoices = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.validatedQuery;
  const { invoices, total } = await invoiceService.getAllInvoices({ page, limit, status, search });
  res.status(200).json({
    success: true,
    message: INVOICE_MESSAGES.LIST_FETCHED,
    data:    mapInvoiceList(invoices, { page, limit, total }),
  });
});

export const voidInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.voidInvoice(req.params.id);
  res.status(200).json({
    success: true,
    message: "Invoice voided successfully.",
    data:    mapInvoice(invoice),
  });
});