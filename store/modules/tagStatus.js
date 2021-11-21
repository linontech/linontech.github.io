import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
    //要設置的全局訪問的state對象,要設置的初始屬性值
    showFooter: true,
    changeableNum: 0
};

const getters = {
    isShow(state) {
        //方法名隨意,主要是來承載變化的showFooter的值
        return state.showFooter
    }
};

const mutations = {

};

const actions = {

}

const store = new Vuex.Store({
    state, getters, mutations, actions
    }
);

export default {
    namespaced:true,
    store
};

