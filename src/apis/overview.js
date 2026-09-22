import http from "../libs/http";

export default {
  dashboard: () => http.get("api/business/overview/dashboard"),
};
