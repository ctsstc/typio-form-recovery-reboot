import optionsModule from '../../../../js/modules/options/options'

export default {
    namespaced: true,
    state: {
        options: {},
    },
    getters: {
        getOption: (state) => (optionKey) => {
            if(state.options === null) {
                return null;
            }
            if(!state.options.hasOwnProperty(optionKey)) {
                throw new Error('Option requested does not exist.');
            }
            return state.options[optionKey];
        },
    },
    mutations: {
        setOptionValue(state, [key, value]) {
            if(!state.options.hasOwnProperty(key)) {
                throw new Error('Option does not exist.');
            }
            state.options[key] = value;
        },
        setOptions(state, options) {
            state.options = options;
        }
    },
    actions: {
        loadOptionsFromStorage(context) {
            optionsModule.loadFromChromeStorage(() => {
                const options = optionsModule.getAll();
                context.commit('setOptions', options);
            });
        },
        save(context) {
            let options = context.state.options;

            // Apparently the past version of me thought it was a good idea to store key combos as strings and then automatically "sanitize" (actually transform) them into arrays. Now I have to deal with this shit.
            const keysToTransform = ['keybindToggleRecDiag', 'keybindRestorePreviousSession', 'keybindOpenQuickAccess'];

            for(const key of keysToTransform) {
                if(options.hasOwnProperty(key) && Array.isArray(options[key])) {
                    options[key] = options[key].join(' + ');
                }
            }

            optionsModule.setMany(context.state.options);
        },
    }
};