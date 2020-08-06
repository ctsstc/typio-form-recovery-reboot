<template>
    <div>

        <h1>Options</h1>
        <p>Make Typio yours.</p>
        <br><br>

        <save-options-partial id="save-options" class="card"></save-options-partial>

        <restore-icon-partial id="restore-icon" class="card"></restore-icon-partial>

        <save-indicator-partial id="save-indicator" class="card"></save-indicator-partial>

        <blacklist-partial id="blacklist" class="card"></blacklist-partial>

        <keyboard-shortcuts-partial id="keyboard-shortcuts" class="card"></keyboard-shortcuts-partial>
    </div>
</template>

<script>
    import SaveOptionsPartial from './partials/SaveOptionsPartial.vue';
    import RestoreIconPartial from './partials/RestoreIconPartial.vue';
    import SaveIndicatorPartial from './partials/SaveIndicatorPartial.vue';
    import BlacklistPartial from './partials/BlacklistPartial.vue';
    import KeyboardShortcutsPartial from './partials/KeyboardShortcutsPartial.vue';

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
        },
        beforeRouteEnter(to, from, next) {
            handleRouteChange(to, from, next);
        },
        beforeRouteUpdate(to, from, next) {
            handleRouteChange(to, from, next);
        },
    }
</script>

<style lang="scss" scoped>
</style>