import { createApp, h } from 'vue';
import router from '../../vue/backendApp/routes';
import App from '../../vue/backendApp/App.vue';
import store from '../../vue/backendApp/store/Store';

createApp({
    router,
    store,
    render() { return h(App) }
}).mount('#app');