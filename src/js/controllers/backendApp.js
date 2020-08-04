import Vue from 'vue';
import VueRouter from 'vue-router';
import router from './routes';
import App from '../../vue/backendApp/App.vue';

Vue.use(VueRouter);


new Vue({
    el: '#app',
    router,
    render(h) { return h(App) },
});