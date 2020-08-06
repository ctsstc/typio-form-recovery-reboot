<template>
    <div>
        <h2>Context menu</h2>
        <p>Typio can also be accessed with the keyboard shortcuts or using the browser toolbar icon.</p>

        <form @change="$store.dispatch('options/save')">
            <fancy-check v-model="options.hideContextItems">Hide Typio from context menu</fancy-check>
        </form>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import FancyCheck from '../../components/FancyCheck.vue';

    export default {
        name: "ContextMenuPartial",
        components: {
            FancyCheck,
        },
        computed: {
            ...mapState('options', ['options']),
        },
    }
</script>