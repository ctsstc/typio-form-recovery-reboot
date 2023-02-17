<template>
    <div>
        <h2>Keyboard Shortcuts</h2>

        <form @change="$store.dispatch('options/save')">

            <p>You may configure the keyboard shortcuts to your liking, but Typio cannot detect collisions with other existing keyboard shortcuts. If you encounter issues after changing the keyboard shortcuts, please change or disable them.</p>

            <fancy-check v-model="options.keybindEnabled">Enable Enable keyboard shortcuts</fancy-check>
            <br>

            <div class="keyboard-shortcut-list">
                <keyboard-shortcut-item v-for="option of keyboardShortcutOptions" :key="option.key" :option="option" :value="options[option.key]" @click.native="openPicker(option)"></keyboard-shortcut-item>
            </div>

            <p>The Quick Restore Popup can be navigated with the up/down arrow keys. Press space to select, or <span style="white-space: nowrap">Shift + Delete</span> to delete the selected item.</p>
        </form>

        <keyboard-shortcut-picker v-if="pickerIsOpen" @change="onPick"></keyboard-shortcut-picker>

    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import FancyCheck from '../../components/FancyCheck.vue';
    import KeyboardShortcutPicker from './KeyboardShortcutPicker.vue';
    import KeyboardShortcutItem from './KeyboardShortcutItem.vue';

    export default {
        name: "KeyboardShortcutsPartial",
        components: {
            KeyboardShortcutPicker,
            KeyboardShortcutItem,
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
    }
</style>