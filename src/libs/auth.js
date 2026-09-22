import LoginApi from "../apis/login";
import AuthHandler from "./auth.handler";
import Acl from "./acl";
import router from "../router";

var _user;
var _pending;

class AuthManager {
  constructor() {
    if (AuthHandler.hasToken()) {
      Acl.restorePermission();
      // 页面刷新时尝试恢复登录态；失败由路由守卫统一跳转登录页。
      this.restoreUser().catch(() => {});
    }
  }

  login(data) {
    return LoginApi.login(data).then((res) => {
      console.log("登录", res);
      AuthHandler.saveToken(res.token);
      return Promise.all([Acl.restorePermission(), this.restoreUser()]);
    });
  }

  logout() {
    return LoginApi.logout().then(() => {
      _user = null;
      AuthHandler.clearToken();
      Acl.destory();
      router.push("/login");
    });
  }

  check() {
    if (!AuthHandler.hasToken()) {
      return Promise.reject(new Error("未登录"));
    }

    if (_user) {
      return Promise.resolve(_user);
    }

    if (_pending) {
      return _pending.then(() => {
        if (!_user) {
          throw new Error("登录状态已失效");
        }
        return _user;
      });
    }

    return Promise.reject(new Error("未登录"));
  }

  restoreUser() {
    _pending = LoginApi.detail()
      .then((res) => {
        console.log("用户信息", res);
        _user = res;
      })
      .catch(() => {
        AuthHandler.clearToken();
        _user = null;
        Acl.destory();
        throw new Error("登录状态已失效");
      })
      .finally(() => {
        _pending = null;
      });
    return _pending;
  }

  user() {
    return _user;
  }

  hasRoleId(roleId) {
    return !!(_user && _user.roles && _user.roles.some((role) => Number(role.id) === Number(roleId)));
  }

  /**
   * 是客服
   */
  get isService() {
    return _user && !!_user.roles.find((_) => _.alias == "staff");
  }

  /**
   * 编辑
   */
  get isEditor() {
    return _user && !!_user.roles.find((_) => _.alias == "edit" || _.alias == "edit_admin");
  }

  /**
   * 编辑主管
   */
  get isEditAdmin() {
    return _user && !!_user.roles.find((_) => _.alias == "edit_admin");
  }

  /**
   * 财务
   */
  get isFinance() {
    return _user && !!_user.roles.find((_) => _.alias == "finance");
  }

  /**
   * Admin
   */
  get isAdmin() {
    return _user && !!_user.roles.find((_) => _.alias == "admin");
  }
}

export default new AuthManager();
