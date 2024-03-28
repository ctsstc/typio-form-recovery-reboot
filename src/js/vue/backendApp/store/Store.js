import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import options from "./modules/options";

export default new Vuex.Store({
  modules: {
    options,
  },
});
