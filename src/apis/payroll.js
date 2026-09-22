import http from "../libs/http";

const post = (path, data) => http.post(`api/business/payroll/${path}`, data);

export default {
  sheets: (data) => post("sheets/list", data),
  sheetDetail: (id) => http.get("api/business/payroll/sheets/detail", { id }),
  createSheet: (data) => post("sheets/create", data),
  updateSheet: (data) => post("sheets/update", data),
  deleteSheet: (id) => post("sheets/delete", { id }),
  createItem: (data) => post("items/create", data),
  updateItem: (data) => post("items/update", data),
  deleteItem: (id) => post("items/delete", { id }),
  submitManagerReview: (data) => post("sheets/submit-manager-review", data),
  managerReview: (data) => post("items/manager-review", data),
  submitFinanceReview: (id) => post("sheets/submit-finance-review", { id }),
  financeReview: (data) => post("sheets/finance-review", data),
  adminReview: (data) => post("sheets/admin-review", data),
  adminAdjust: (data) => post("items/admin-adjust", data),
  employeeAction: (data) => post("items/employee-action", data),
  resolveAppeal: (data) => post("items/appeal-resolve", data),
  markPaid: (data) => post("sheets/mark-paid", data),
};
