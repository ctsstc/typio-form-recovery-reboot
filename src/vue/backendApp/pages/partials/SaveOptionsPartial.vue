<template>
    <div>
        <h2>Save &amp; Restore</h2>

        <p>Save data for &nbsp;<input style="width: 40px; padding: 5px; font-size: 15px; text-align: center;" maxlength="4" type="text">&nbsp; days</p>

        <br>

        <div class="fancy-chk">
            <input class="autosave" type="checkbox" data-option="savePasswords" id="checkboxSavePasswords">
            <span class="chk"></span>
        </div>
        <label for="checkboxSavePasswords">Save password fields</label>

        <br>

        <div class="fancy-chk">
            <input class="autosave" type="checkbox" data-option="saveCreditCards" id="checkboxSaveCreditCards">
            <span class="chk"></span>
        </div>
        <label for="checkboxSaveCreditCards">
            Save credit card numbers
            <tooltip text="Typio will attempt to ignore credit card numbers based on the length and structure of the number. Numbers similar to credit cards will also be ignored.">(info)</tooltip>
        </label>

        <br>
            <p class="note change-msg hidden">Psst. Disabling these options will not delete any currently saved data.</p>

            <div class="fancy-chk">
                <input class="autosave" type="checkbox" data-option="cloneOnRestore" id="checkboxcloneOnRestore">
                <span class="chk"></span>
            </div>
            <label for="checkboxcloneOnRestore">
                Clone entries on restoration
                <tooltip text="Entries will be copied into the current session upon restoration.">(info)</tooltip>
            </label>

            <br>

            <div class="fancy-chk">
                <input class="autosave" type="checkbox" data-option="resetEditablesBetweenRestorations" id="checkboxResetEditablesBetweenRestorations">
                <span class="chk"></span>
            </div>
            <label for="checkboxResetEditablesBetweenRestorations">
                Reset inputs between restorations
                <tooltip text="All input fields will be reset to their default value before restoration. When recovering multiple sessions, fields will be cleared inbetween.">(info)</tooltip>
            </label>

    </div>
</template>

<script>
    import Tooltip from '../../../partials/Tooltip.vue';

    export default {
        name: "SaveOptionsPartial",
        components: {
            Tooltip,
        },
    }
</script>