import acl from './acl';

export default {
    install: (Vue) => {
        Vue.directive('acl', acl);
    }
}