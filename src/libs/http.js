import axios from 'axios';
import Vue from 'vue';
import AuthHandler from './auth.handler';
import acl from './acl';

const _axios = axios.create({
    timeout: 30000,
    baseURL: process.env.VUE_APP_BASE_API,
})

// 请求拦截
_axios.interceptors.request.use(
    config => {
        if (AuthHandler.hasToken()) {
            config.headers.Authorization = AuthHandler.getAuthToken();
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
)

// 响应拦截
_axios.interceptors.response.use(
    response => {
        let config = response.config;
        if (config.format === false) {
            return response.data;
        }
        if (response.data.code === 0) {
            return response.data.data;
        } else if (response.data.code === 422) {
            console.warn(`${response.data.code} --> ${response.data}`);
            if (config.ingore === true) {
                return Promise.reject(response.data);
            }
            let res = response.data;
            let err = '未知错误';
            try {
                err = Object.values(res.data).map(_ => _[0]).join('\n') || res.message || '未知错误';
            } catch {
                err = res.message || '未知错误';
            }
            new Vue().$notification.warning({
                message: "验证错误",
                description: err
            });
            return Promise.reject(response.data);
        } else {
            console.error(`${response.data.code} --> ${response.data}`);
            new Vue().$notification.error({
                message: "业务错误",
                description: response.data.message
            });
            return Promise.reject(response.data);
        }
    },
    error => {
        let response = error.response;
        let config = response.config;
        if (config.ignore === true) {
            return Promise.reject(response);
        }
        if (response.status === 401) {
            console.log('去登录');
            new Vue().$navigator.push('/login');
        } else if (response.status === 403) {
            console.log('暂无权限');
        } else if (response.status === 404) {
            new Vue().$notification.error({
                message: "错误提示",
                description: "接口未找到"
            });
        } else {
            new Vue().$notification.error({
                message: "服务错误",
                description: response.data.message || JSON.stringify(response.data)
            });
        }
        return Promise.reject(response.data);
    }
)

class HttpManager {
    get(url, params, options = {}) {
        if (!acl.verify(options.acl)) {
            return Promise.reject('无权限');
        }
        return _axios.get(url, Object.assign({}, options, {
            params: params
        }));
    }
    post(url, parmas, options = {}) {
        if (!acl.verify(options.acl)) {
            return Promise.reject('无权限');
        }
        return _axios.post(url, parmas, options);
    }
}

export default new HttpManager();