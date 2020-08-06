<template>
    <div id="toast-container" v-bind:class="[isVisible ? 'visible' : '']">
        <p class="message" v-html="message"></p>
    </div>
</template>

<script>
    export default {
        name: "Toast",
        data() {
            return {
                message: '',
                isVisible: false,
                timeout: null,
            }
        },
        methods: {
            showMessage: function(message) {
                if(this.isVisible) {
                    this.isVisible = false;
                    clearTimeout(this.timeout);
                    setTimeout(() => {
                        this.showMessage(message);
                    }, 100);
                    return false;
                }

                this.message = message;
                this.isVisible = true;

                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.isVisible = false;
                }, 4000);
            },
        },
    }
</script>