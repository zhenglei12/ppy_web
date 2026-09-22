import LoginApi from '../apis/login';
import {
    PermissionGroup
} from '../models/Permission';

var _pending;

class AclManager {
    check() {
        return new Promise((resolve, reject) => {
            if (this.permission) {
                resolve();
            } else if (_pending) {
                _pending.then(() => resolve())
            } else {
                return reject();
            }
        })
    }

    restorePermission() {
        _pending = LoginApi.acl().then(res => {
            this.permission = new PermissionGroup(res.list);
            console.log('权限初始化完成', this.permission);
        })
        return _pending;
    }

    verify(acl, scope = 'all') {
        let res = false;
        if (!acl) {
            return true;
        }
        if (typeof acl === 'string') {
            res = this.permission.has(acl);
        } else {
            res = scope === 'one' ? !!acl.find(_ => this.permission.has(_)) : !acl.find(_ => this.permission.has(_));
        }
        if (!res) {
            console.warn('无权限', acl, scope);
        }
        return res;
    }

    destory() {
        this.permission = null;
    }
}

export default new AclManager();