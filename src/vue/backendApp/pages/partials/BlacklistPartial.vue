<template>
    <div>
        <h2>Blacklist</h2>

        <div class="fancy-chk">
            <input class="autosave" type="checkbox" data-option="savePasswords" id="checkboxSavePasswords">
            <span class="chk"></span>
        </div>
        <label for="checkboxSavePasswords">Enable Enable keyboard shortcuts</label>

        <br>
        <br>

        <div class="keyboard-shortcut-list">
            <div class="row">
                <div>
                    Open/Close Recovery Dialog:
                </div>
                <div>
                    <input placeholder="disabled" type="text" value="Control + Backspace">
                </div>
            </div>
            <div class="row">
                <div>
                    Auto restore last session:
                </div>
                <div>
                    <input placeholder="disabled" type="text" value="Control + Alt + Backspace">
                </div>
            </div>
            <div class="row">
                <div>
                    Open Quick Restore for selected field:
                </div>
                <div>
                    <input placeholder="disabled" type="text" value="Control + r">
                </div>
            </div>
        </div>

        <p>The Quick Restore Popup can be navigated with the up/down arrow keys. Press space to select, or Shift + Delete to delete the selected item.</p>
    </div>
</template>

<script>
    export default {
        name: "BlacklistPartial"
    }
</script>