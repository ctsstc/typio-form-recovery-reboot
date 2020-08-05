<template>
    <div>
        <h2>Restore Icon</h2>
        <p>The Restore Icon appears in the top right corner of any input field Typio recognizes. Clicking it will open the Quick Restore popup for the selected field. If the icon is colliding with another extension, you can set it to display on double click, or completely disable it. You can always trigger the restore icon with the keyboard shortcut (see below).</p>

        <form @change="$store.dispatch('options/save')">
            <fancy-check v-model="options.quickAccessButtonEnabled">Enable Restore Icon</fancy-check>

            <br>

            <select v-model="options.quickAccessButtonTrigger">
                <option value="focus">Display on input focus</option>
                <option value="doubleclick">Display on input double click</option>
            </select>
        </form>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import FancyCheck from '../../components/FancyCheck.vue';

    export default {
        name: "RestoreIconPartial",
        components: {
            FancyCheck,
        },
        computed: {
            ...mapState('options', ['options']),
        },
    }
</script>