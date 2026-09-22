import http from "../libs/http";

export const departmentApi = {
  list: (data) => http.post("api/department/list", data),
  create: (data) => http.post("api/department/add", data),
  update: (data) => http.post("api/department/update", data),
  remove: (id) =>
    http.post("api/department/delete", {
      id,
    }),
};
