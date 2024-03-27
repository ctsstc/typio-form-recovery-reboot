import Vuex from "vuex";
import Vue from "vue";
Vue.use(Vuex);

import options from "./modules/options";

export default new Vuex.Store({
  modules: {
    options,
  },
});
