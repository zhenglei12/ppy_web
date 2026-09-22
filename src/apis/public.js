import http from "../libs/http";

export default {
  roleUserList: (alias) =>
    http.post("api/pub/role/user_list", {
      alias,
    }),
  documentClassify: (params) => http.post("api/public/classify/list", params),
  departmentAll: () => http.post("api/public/department/list"),
};
