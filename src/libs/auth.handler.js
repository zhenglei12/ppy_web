import Cache from './cache';

var _token;

class AuthHandlerManager {
  constructor() {
    _token = Cache.get('token');
  }
  hasToken() {
    return !!_token;
  }
  saveToken(token) {
    _token = token;
    Cache.forever('token', token, {
      force: true,
    })
  }
  clearToken() {
    _token = null;
    Cache.remove('token');
  }
  getAuthToken() {
    return _token && `Bearer ${_token}`;
  }
}

export default new AuthHandlerManager();