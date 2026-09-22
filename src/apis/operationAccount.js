import http from "../libs/http";

export default {
  list: (data) => http.post("api/operation_account/list", data),
  detail: (id) => http.get("api/operation_account/detail", { id }),
  create: (data) => http.post("api/operation_account/add", data),
  update: (data) => http.post("api/operation_account/update", data),
  logs: (data) => http.post("api/operation_account/log/list", data),
  remove: (id) => http.post("api/operation_account/delete", { id }),
};
