<template>
    <div>

        <h1>Options</h1>

        <!-- top padding for anchor links -->

        <div style="margin-top: -30px; padding-top: 30px" id="save-options">
            <save-options-partial class="card"></save-options-partial>
        </div>

        <div style="padding-top: 30px" id="restore-icon">
            <restore-icon-partial class="card"></restore-icon-partial>
        </div>

        <div style="padding-top: 30px" id="save-indicator">
            <save-indicator-partial class="card"></save-indicator-partial>
        </div>

        <div style="padding-top: 30px" id="blacklist">
            <blacklist-partial class="card"></blacklist-partial>
        </div>

        <div style="padding-top: 30px" id="keyboard-shortcuts">
            <keyboard-shortcuts-partial class="card"></keyboard-shortcuts-partial>
        </div>

        <div style="padding-top: 30px" id="context-menu">
            <context-menu-partial class="card"></context-menu-partial>
        </div>
    </div>
</template>

<script>
    import SaveOptionsPartial from './partials/SaveOptionsPartial.vue';
    import RestoreIconPartial from './partials/RestoreIconPartial.vue';
    import SaveIndicatorPartial from './partials/SaveIndicatorPartial.vue';
    import BlacklistPartial from './partials/BlacklistPartial.vue';
    import KeyboardShortcutsPartial from './partials/KeyboardShortcutsPartial.vue';
    import ContextMenuPartial from './partials/ContextMenuPartial.vue';

    function handleRouteChange(to, from, next) {
        next();

        setTimeout(() => {
            if (to.hash) {
                const el = document.querySelector(to.hash);
                if(el) {
                    window.scrollTo({
                        top: el.getBoundingClientRect().top + window.scrollY + -30,
                        behavior: 'smooth',
                    })
                    // el.scrollIntoView(true);
                    // el.classList.add('navigated-to');
                    // setTimeout(() => {
                    //     el.classList.remove('navigated-to');
                    // }, 1000)
                }
            }
        })
    }

    export default {
        name: "OptionsPage",
        components: {
            SaveOptionsPartial,
            RestoreIconPartial,
            SaveIndicatorPartial,
            BlacklistPartial,
            KeyboardShortcutsPartial,
            ContextMenuPartial,
        },
        /*
        beforeRouteEnter(to, from, next) {
            handleRouteChange(to, from, next);
        },
        beforeRouteUpdate(to, from, next) {
            handleRouteChange(to, from, next);
        },
        */
    }
</script>

<style lang="scss" scoped>
</style>