<template>
    <div class="tooltip-wrapper">
        <div class="text" @mousemove="onMouseMove" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave"><slot></slot></div>
        <div v-if="isVisible" ref="tooltip" class="tooltip">{{ text }}</div>
    </div>
</template>

<script>
    export default {
        name: "Tooltip",
        props: ['text'],
        data() {
            return {
                isVisible: false,
            }
        },
        methods: {
            onMouseEnter() {
                this.isVisible = true;
            },
            onMouseLeave() {
                this.isVisible = false;
            },
            onMouseMove(e) {
                const el = this.$refs.tooltip;
                if(el) {
                    el.style.top = window.scrollY + e.clientY - this.$el.offsetTop + 20 + 'px';
                    el.style.left = window.scrollX + e.clientX - this.$el.offsetLeft + 'px';
                }
            }
        },
    }
</script>