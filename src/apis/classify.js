import http from "../libs/http";

export default {
  list: (data) => http.post("api/classify/list", data),
  create: (data) => http.post("api/classify/add", data),
  update: (data) => http.post("api/classify/update", data),
  remove: (id) =>
    http.post("api/classify/delete", {
      id,
    }),
};
