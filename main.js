import Vue from 'vue'
// import HelloWorld from './components/HelloWorld'
// import TagColorLoader from './components/TagColorLoader'
import Pagination  from './components/Pagination'
// import {mapState, mapGetters, mapActions} from 'vuex';
import { BPagination, BTable } from 'bootstrap-vue';

Vue.component('b-table', BTable);
Vue.component('b-pagination', BPagination);

Vue.component('vnode-to-html', {
    props: ['vnode'],
    render(createElement) {
        return createElement("template", {
            'class': {
                'template-4-select': true
            }
        }, [this.vnode]);
    },
    mounted() {
        this.$emit('html', [...this.$el.childNodes].map(n => n.outerHTML).join('\n'));
    }
});

const app = new Vue({
    el: '#app',
    delimiters: ['#{', '}'],
    components: {
        Pagination: Pagination,
    }
});
