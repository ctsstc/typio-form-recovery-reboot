import optionsModule from "../../../../modules/options/options";
import defaultOptionsModule from "../../../../modules/options/defaultOptions";

export default {
  namespaced: true,
  state: {
    options: {},
  },
  getters: {
    getOption: (state) => (optionKey) => {
      if (state.options === null) {
        return null;
      }
      if (!state.options.hasOwnProperty(optionKey)) {
        throw new Error("Option requested does not exist.");
      }
      return state.options[optionKey];
    },
  },
  mutations: {
    resetSingleOption(state, key) {
      state.options[key] = defaultOptionsModule.get(key);
    },
    setOptions(state, options) {
      state.options = options;
    },
  },
  actions: {
    loadOptionsFromStorage(context) {
      optionsModule.loadFromChromeStorage(() => {
        const options = optionsModule.getAll();
        context.commit("setOptions", options);
      });
    },
    save(context) {
      optionsModule.setMany(context.state.options);
    },
  },
};
