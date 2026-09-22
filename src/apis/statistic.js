import http from "../libs/http";

export default {
  all: (data) => http.post("api/edit/statistics/all/list", data),
  day: (data) => http.post("api/edit/statistics/day/list", data),
  list: (data) => http.post("api/staff/statistics/list", data),
  order: (data) => http.post("api/edit/order/list", data),
  export: (data) =>
    http.post("api/staff/statistics/list/export", data, {
      format: false,
      responseType: "blob",
    }),
};
