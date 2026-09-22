import http from "../libs/http";

export default {
  list: (data) => http.post("api/manuscript_bank/list", data),
  create: (data) => http.post("api/manuscript_bank/add", data),
  update: (data) => http.post("api/manuscript_bank/update", data),
  remove: (id) =>
    http.post("api/manuscript_bank/delete", {
      id,
    }),
};
