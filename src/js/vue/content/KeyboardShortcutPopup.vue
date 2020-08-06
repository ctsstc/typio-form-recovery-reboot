<template>
    <div id="keyboardShortcutPopup" class="modal-container" v-bind:class="{'hidden': !visible}" v-on:click="backgroundClickHide($event)">
        <div class="modal">

            <div class="modal-header">
                <p class="title">Typio Keyboard Shortcuts</p>
                <button v-on:click="closeModal()" class="close icon-close"></button>
            </div>

            <div class="modal-content">

                <p v-if="isDisabled" class="error">You have disabled keyboard shortcuts in the options.</p>

                <div class="combo-group">
                    <div class="combo">
                        <p class="description">Open/Close recovery dialog</p>
                        <p class="keys" v-html="keybindToggleRecDiag"></p>
                    </div>
                    <div class="combo">
                        <p class="description">Restore previous session</p>
                        <p class="keys" v-html="keybindRestorePreviousSession"></p>
                    </div>
                </div>

                <div class="combo-group">
                    <div class="combo">
                        <p class="description">Open Quick Restore for focused field</p>
                        <p class="keys" v-html="keybindOpenQuickAccess"></p>
                    </div>
                    <div class="combo">
                        <p class="description">Navigate items</p>
                        <p class="keys"><span class="key">▲</span> <span class="key">▼</span></p>
                    </div>
                    <div class="combo">
                        <p class="description">Select item</p>
                        <p class="keys"><span class="key">Space</span></p>
                    </div>
                    <div class="combo">
                        <p class="description">Delete item</p>
                        <p class="keys"><span class="key">Shift</span> <span class="key">Delete</span></p>
                    </div>
                </div>


                <div style="text-align: center;"><a v-on:click="openSettings();">Change keyboard combinations in options</a></div>

            </div>
        </div>
    </div>
</template>

<script>
    import keyboardShortcuts from '../../modules/keyboardShortcuts';
    import Options from '../../modules/options/options';

    export default {
        name: "KeyboardShortcutPopup",
        data() {
            return {
                visible: true,
                isDisabled : false,
                keybindToggleRecDiag : 'false',
                keybindRestorePreviousSession : 'false',
                keybindOpenQuickAccess : 'false'
            }
        },
        mounted: function() {
            this.fetchOptions();
        },
        methods: {
            show: function() {
                document.activeElement.blur();
                this.visible = true;
            },
            fetchOptions: function() {
                this.isDisabled = !Options.get('keybindEnabled');
                this.keybindToggleRecDiag = keyboardShortcuts.printableKey(Options.get('keybindToggleRecDiag'));
                this.keybindRestorePreviousSession = keyboardShortcuts.printableKey(Options.get('keybindRestorePreviousSession'));
                this.keybindOpenQuickAccess = keyboardShortcuts.printableKey(Options.get('keybindOpenQuickAccess'));
            },
            openSettings: function() {
                chrome.runtime.sendMessage({action: 'openSettings'});
            },
            closeModal: function() {
                this.visible = false;
            },
            backgroundClickHide: function(e) {
                if(e.path[0].classList.contains('modal-container')) this.closeModal();
            },
        },
    }
</script>

<style scoped>

</style>