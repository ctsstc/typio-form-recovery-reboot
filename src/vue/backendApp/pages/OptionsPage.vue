<template>
    <div>

        <h1>Options</h1>
        <p>Make Typio yours.</p>
        <br><br>

        <save-options-partial class="options-box"></save-options-partial>

        <restore-icon-partial class="options-box"></restore-icon-partial>

        <blacklist-partial class="options-box"></blacklist-partial>

        <keyboard-shortcuts-partial class="options-box"></keyboard-shortcuts-partial>
    </div>
</template>

<script>
    import SaveOptionsPartial from './partials/SaveOptionsPartial.vue';
    import RestoreIconPartial from './partials/RestoreIconPartial.vue';
    import BlacklistPartial from './partials/BlacklistPartial.vue';
    import KeyboardShortcutsPartial from './partials/KeyboardShortcutsPartial.vue';

    export default {
        name: "OptionsPage",
        components: {
            SaveOptionsPartial,
            RestoreIconPartial,
            BlacklistPartial,
            KeyboardShortcutsPartial,
        }
    }
</script>