import acl from '../libs/acl';

export default {
    inserted: function (el, binding) {
        if (binding.value && !acl.verify(binding.value, binding.arg)) {
            el.parentNode.removeChild(el);
        }
    },
}