import http from "../libs/http";

export default {
    all: () => http.post('api/role/all'),
    list: (data) => http.post('api/role/list', data),
    create: (data) => http.post('api/role/add', data),
    update: (data) => http.post('api/role/update', data),
    remove: (id) => http.post('api/role/delete', {
        id
    }),
    detail: (id) => http.get('api/role/detail', {
        id
    }),
    permissions: (id) => http.post('api/role/permission', {
        id
    }),
    allot: (data) => http.post('api/role/add/permission', data),
}