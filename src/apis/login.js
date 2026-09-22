import http from '../libs/http';

export default {
    login: (data) => http.post('api/auth/login', data),
    logout: () => http.post('api/auth/logout'),
    detail: () => http.get('api/user/detail'),
    acl: () => http.get('api/user/permission'),
}