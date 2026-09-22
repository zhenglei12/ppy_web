import http from "../libs/http";

export default {
  list: (data) => http.post("api/device/list", data),
  detail: (id) => http.get("api/device/detail", { id }),
  create: (data) => http.post("api/device/add", data),
  update: (data) => http.post("api/device/update", data),
  logs: (data) => http.post("api/device/log/list", data),
  remove: (id) =>
    http.post("api/device/delete", {
      id,
    }),
};
