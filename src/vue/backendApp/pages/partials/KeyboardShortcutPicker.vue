<template>
    <div class="keyboard-shortcut-picker" @click="emitResponse('cancel')">
        <p>{{ pressedKeys.join(' + ') || 'Enter keyboard combination on your keyboard' }}</p>

        <p>
            <button @click="emitResponse('disable') && $event.stopPropagation()">Disable keyboard shortcut</button>
            <button @click="emitResponse('reset') && $event.stopPropagation()">Reset to default</button>
            <button @click="emitResponse('cancel') && $event.stopPropagation()">Cancel</button>
        </p>
    </div>
</template>

<script>

    export default {
        name: "KeyboardShortcutPicker",
        data() {
            return {
                pressedKeys: [],
            }
        },
        mounted() {
            document.activeElement.blur();
            document.addEventListener('keydown', this.onKeyDown);
            document.addEventListener('keyup', this.onKeyUp);
        },
        destroyed() {
            document.removeEventListener('keydown', this.onKeyDown);
            document.removeEventListener('keyup', this.onKeyUp);
        },
        methods: {
            onKeyUp(e) {
                if(this.pressedKeys.length > 1) {
                    this.emitResponse('set', this.pressedKeys);
                }
                this.pressedKeys = [];
            },
            onKeyDown(e) {
                e.preventDefault();
                e.stopPropagation();

                const key = e.key;

                if(this.pressedKeys.includes(key)) {
                    return;
                }

                if(key === 'Escape') {
                    return this.emitResponse(RESPONSE_CANCEL);
                }

                this.pressedKeys.push(key);

            },
            emitResponse(responseType, responseValue) {
                this.$emit('change', {
                    responseType,
                    responseValue,
                })
            },
        },
    }
</script>