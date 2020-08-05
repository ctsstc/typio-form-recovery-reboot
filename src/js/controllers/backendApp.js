import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex'
import router from './routes';
import App from '../../vue/backendApp/App.vue';
import store from '../../vue/backendApp/store/Store';

Vue.use(VueRouter);
Vue.use(Vuex);

new Vue({
    el: '#app',
    store,
    router,
    render(h) { return h(App) },
});