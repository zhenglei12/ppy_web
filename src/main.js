import Vue from 'vue';

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
Vue.use(Antd);

// 网络请求
import http from './libs/http';
Vue.prototype.$api = http;
// 认证
import auth from './libs/auth';
Vue.prototype.$auth = auth;
// 权限
import acl from './libs/acl';
Vue.prototype.$acl = acl;
// 全局组件
import component from './components';
Vue.use(component);
// import mixin from './mixins';
// Vue.use(mixin);
import filter from './filters';
Vue.use(filter);
import directive from './directives';
Vue.use(directive);


Vue.config.productionTip = false;
Vue.config.errorHandler = (err) => {
  console.log(err);
}

(function () {
  const body = document.querySelector('body');
  const preloader = document.querySelector('.preloader');

  body.style.overflow = 'hidden';

  function remove() {
    if (!preloader) return;
    preloader.addEventListener('transitionend', function () {
      preloader.className = 'preloader-hidden';
    });

    preloader.className += ' preloader-hidden-add preloader-hidden-add-active';
  }

  setTimeout(() => {
    remove();
    body.style.overflow = '';
  }, 100);
})();

import app from './App';
import router from './router.js';
Vue.prototype.$navigator = router;

new Vue({
  render: h => h(app),
  router,
}).$mount('#app');