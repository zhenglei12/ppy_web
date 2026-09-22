import * as moment from 'moment';
import http from './http';
import cache from './cache';

const AuthUri = 'api/qiniu/auth';
const UploadUri = 'https://upload.qiniup.com';

class UploadManage {
    constructor() {
        this.tokens = cache.get('upload') || {};
    }

    // 生成文件名
    _getFileName(space) {
        let temp = [...space];
        let now = moment().format('YYYYMMDDHHmmssSSS');
        let random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        temp.push(`${now}${random}`);
        return temp.join('-');
    }

    // 更新token
    _updateToken(disk) {
        return http.post(AuthUri, {
            disk
        }).then(res => {
            this.tokens[disk] = res.token;
            cache.forever('upload', this.tokens);
            return res.token;
        }).catch(err => Promise.reject(err));
    }

    async uploadFile(file, space) {
        if (!(file && space.length)) {
            return Promise.resolve('');
        }
        let disk = space[0];
        let token = this.tokens[disk];
        if (!token) {
            token = await this._updateToken(disk).catch(err => Promise.reject(err));
        }
        let suffix = file.name && file.name.substring(file.name.lastIndexOf('.') + 1) || 'png';
        let fileName = `${this._getFileName(space)}.${suffix}`;
        let formData = new FormData();
        formData.set('token', token);
        formData.set('key', fileName);
        formData.set('file', file);

        return new Promise((resolve, reject) => {
            http.post(UploadUri, formData, {
                    format: false,
                    ignore: true,
                })
                .then(res => {
                    this.authFail = false;
                    file.url = `${res['url']}/${res['key']}`;
                    resolve(file.url)
                })
                .catch(err => {
                    delete this.tokens[disk];
                    if (err.status === 401 && !this.authFail) {
                        this.authFail = true;
                        this.uploadFile(file, space).then(res => resolve(res)).catch(err => reject(err));
                    } else {
                        reject(err);
                    }
                })
        });
    }

    uploadList(fileList, space) {
        return Promise.all(fileList.map(_ => {
            if (!/^http/.test(_.url)) {
                return this.uploadFile(_, space);
            }
            return Promise.resolve(_.url);
        }));
    }

    getRources(fileList) {
        return fileList.map(_ => {
            return /^http/.test(_.url) ? _.url : null;
        })
    }
}

export default new UploadManage();