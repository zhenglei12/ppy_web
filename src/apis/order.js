import http from "../libs/http";

export default {
  list: data => http.post("api/business/orders/list", data),
  detail: id => http.get("api/business/orders/detail", { id }),
  create: data => http.post("api/business/orders/create", data),
  update: data => http.post("api/business/orders/update", data),
  remove: id => http.post("api/business/orders/delete", { id }),
  transition: data => http.post("api/business/orders/transition", data),
  assign: data => http.post("api/business/orders/assign", data),
  updateStatus: data => http.post("api/business/orders/status", data),
  refund: data => http.post("api/business/orders/refund", data),
  optimizers: () => http.get("api/business/orders/optimizers"),
  customers: data => http.post("api/business/customers/list", data),
  customerDetail: id => http.get("api/business/customers/detail", { id }),
  roleUsers: alias => http.post("api/pub/role/user_list", { alias }),
};
