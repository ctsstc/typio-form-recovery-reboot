<template>
    <div>
        <h2>Save Indicator</h2>

        <p>The save indicator will appear when you focus on an input field Typio recognizes and animates on save.</p>

        <form @change="$store.dispatch('options/save')">
            <p>Style:</p>
            <select v-model="options.saveIndicator" style="width: 150px">
                <option value="topline">Top line</option>
                <option value="cornertriag">Corner triangle</option>
                <option value="disable">Disable</option>
            </select>
            &nbsp;
            <input type="color" v-model="options.saveIndicatorColor">
        </form>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: "SaveIndicatorPartial",
        computed: {
            ...mapState('options', ['options']),
        },
    }
</script>

<style scoped>

</style>