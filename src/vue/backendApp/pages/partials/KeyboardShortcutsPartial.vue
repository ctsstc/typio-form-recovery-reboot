<template>
    <div>
        <h2>Keyboard Shorcuts</h2>

        <form @change="$store.dispatch('options/save')">
            <div class="fancy-chk">
                <input v-model="options.keybindEnabled" type="checkbox" id="checkboxKeybindEnabled">
                <span class="chk"></span>
            </div>
            <label for="checkboxKeybindEnabled">Enable Enable keyboard shortcuts</label>

            <br>
            <br>

            <div class="keyboard-shortcut-list">
                <div v-for="option of keyboardShortcutOptions" @click="openPicker(option)" class="row">
                    <div>
                        {{ option.label }}
                    </div>
                    <div>
                        {{ options[option.key] || 'Disabled' }}
                    </div>
                </div>
            </div>

            <p>The Quick Restore Popup can be navigated with the up/down arrow keys. Press space to select, or Shift + Delete to delete the selected item.</p>
        </form>

        <keyboard-shortcut-picker v-if="pickerIsOpen" @change="onPick"></keyboard-shortcut-picker>

    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import KeyboardShortcutPicker from './KeyboardShortcutPicker.vue';

    export default {
        name: "KeyboardShortcutsPartial",
        components: {
            KeyboardShortcutPicker,
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

<style lang="scss">
    body {
        background: darkseagreen;
    }
</style>