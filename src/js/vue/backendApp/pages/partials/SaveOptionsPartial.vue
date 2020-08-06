<template>
    <div>
        <h2>Save &amp; Restore</h2>

        <form @change="$store.dispatch('options/save')">

            <p>Save data for &nbsp;<input v-model="options.storageTimeDays" style="width: 40px; padding: 5px; font-size: 15px; text-align: center;" maxlength="4" type="text">&nbsp; days</p>

            <fancy-check v-model="options.savePasswords">Save password fields</fancy-check>

            <fancy-check v-model="options.saveCreditCards">
                Save credit card numbers
                <tooltip text="Typio will attempt to ignore credit card numbers based on the length and structure of the number. Numbers similar to credit cards will also be ignored.">(info)</tooltip>
            </fancy-check>

            <p class="note change-msg hidden">Psst. Disabling these options will not delete any currently saved data.</p>


            <fancy-check v-model="options.cloneOnRestore">
                Clone entries on restoration
                <tooltip text="Entries will be copied into the current session upon restoration.">(info)</tooltip>
            </fancy-check>

            <fancy-check v-model="options.resetEditablesBetweenRestorations">
                Reset inputs between restorations
                <tooltip text="All input fields will be reset to their default value before restoration. When recovering multiple sessions, fields will be cleared inbetween.">(info)</tooltip>
            </fancy-check>

        </form>

    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import Tooltip from '../../../common/Tooltip.vue';
    import FancyCheck from '../../components/FancyCheck.vue';

    export default {
        name: "SaveOptionsPartial",
        components: {
            Tooltip,
            FancyCheck,
        },
        computed: {
            ...mapState('options', ['options']),
        },
    }
</script>