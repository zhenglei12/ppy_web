import ListSearch from './ListSearch';
import ImgPreview from './ImgPreview';

export default {
    install: (Vue) => {
        Vue.component('ListSearch', ListSearch);
        Vue.component('ImgPreview', ImgPreview);
    }
}