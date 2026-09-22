import http from "../libs/http";

export default {
    all: () => http.post('api/permission/all'),
    remove: (id) => http.post('api/permission/delete', {
        id
    }),
    update: (data) => http.post('api/permission/update', data),
    create: (data) => http.post('api/permission/add', data),
    detail: (id) => http.get('api/permission/detail', {
        id
    }),
    list: (data) => http.post('api/permission/list', data),
}