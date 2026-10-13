import http from "../libs/http";

export default {
  salesDashboard: () => http.get("api/business/sales/dashboard"),
  deliveryDashboard: () => http.get("api/business/delivery/dashboard"),
  financeDashboard: () => http.get("api/business/finance/dashboard"),
  deliveryProjects: data => http.post("api/business/delivery/projects/list", data),
  financePlans: data => http.post("api/business/finance/payment-plans/list", data),
  weiwenjiaCustomers: data => http.post("api/business/weiwenjia/customers/list", data),
  syncWeiwenjiaCustomers: () => http.post("api/business/weiwenjia/customers/sync"),
  weiwenjiaCrmDashboard: data => http.get("api/business/weiwenjia/crm/dashboard", data),
  syncWeiwenjiaCrm: data => http.post("api/business/weiwenjia/crm/sync", data, { acl: "crm.followup.manage", timeout: 120000 }),
};
