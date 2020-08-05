<template>
    <div>
        <h2>Keyboard Shorcuts</h2>

        <form @change="$store.dispatch('options/save')">
            <fancy-check v-model="options.keybindEnabled">Enable Enable keyboard shortcuts</fancy-check>

            <br>

            <div class="keyboard-shortcut-list">
                <div v-for="option of keyboardShortcutOptions" @click="openPicker(option)" class="row">
                    <div>
                        {{ option.label }}
                    </div>
                    <div>
                        <span class="keycombo">{{ options[option.key] || 'Disabled' }}</span>
                    </div>
                    <div><a>Edit</a></div>
                </div>
            </div>

            <p>The Quick Restore Popup can be navigated with the up/down arrow keys. Press space to select, or Shift + Delete to delete the selected item.</p>
        </form>

        <keyboard-shortcut-picker v-if="pickerIsOpen" @change="onPick"></keyboard-shortcut-picker>

    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import FancyCheck from '../../components/FancyCheck.vue';
    import KeyboardShortcutPicker from './KeyboardShortcutPicker.vue';

    export default {
        name: "KeyboardShortcutsPartial",
        components: {
            KeyboardShortcutPicker,
            FancyCheck,
        },
        data() {
            return {
                pickerIsOpen: false,
                pickerIsOpenFor: null,
                keyboardShortcutOptions: [
                    {
                        key: 'keybindToggleRecDiag',
                        label: 'Open/Close Recovery Dialog',
                    },
                    {
                        key: 'keybindRestorePreviousSession',
                        label: 'Restore last session',
                    },
                    {
                        key: 'keybindOpenQuickAccess',
                        label: 'Open Quick Restore for selected field',
                    },
                ],
            }
        },
        computed: {
            ...mapState('options', ['options']),
        },
        methods: {
            openPicker(option) {
                this.pickerIsOpenFor = option;
                this.pickerIsOpen = true;
            },
            onPick({ responseType, responseValue }) {
                const optionKey = this.pickerIsOpenFor.key;

                if(responseType === 'set') {
                    this.options[optionKey] = responseValue.join(' + ');

                } else if(responseType === 'disable') {
                    this.options[optionKey] = '';

                } else if(responseType === 'reset') {
                    this.$store.commit('options/resetSingleOption', optionKey);
                }

                this.$store.dispatch('options/save');

                this.pickerIsOpenFor = null;
                this.pickerIsOpen = false;
            },
        },
    }
</script>

<style lang="scss" scoped>
    .keyboard-shortcut-list {
        border: 1px solid #d4d4d4;

        .row {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            cursor: pointer;

            div:first-child {
                flex-grow: 1;
            }

            div:last-child {
                margin-left: 50px;
            }

            &:hover {
                background: #f0f0f0;
            }

            input {
                width: 160px;
                text-align: center;
                border: 1px solid #bfbfbf;
            }
        }
    }

    .keycombo {
        padding: 3px 10px;
        border: 1px solid #d4d4d4;
        border-radius: 5px;
        font-size: 15px;
        background: #FFF;
        white-space: nowrap;
    }
</style>