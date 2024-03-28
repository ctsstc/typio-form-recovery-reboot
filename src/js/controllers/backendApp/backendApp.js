import Vue from "vue";
import router from "../../vue/backendApp/routes";
import App from "../../vue/backendApp/App.vue";
import store from "../../vue/backendApp/store/Store";

new Vue({
  el: "#app",
  store,
  router,
  render(h) {
    return h(App);
  },
});
