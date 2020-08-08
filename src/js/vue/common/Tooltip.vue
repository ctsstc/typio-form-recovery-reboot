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
                    el.style.top = e.clientY + 15 + 'px';
                    el.style.left = e.clientX + 'px';
                }
            }
        },
    }
</script>

<style lang="scss" scoped>

    .tooltip-wrapper {
        display: inline;
        position: relative;

        .text {
            display: inline;
            color: #d5ae39;
            cursor: help;
        }

        .tooltip {
            position: fixed;
            pointer-events: none;
            z-index: 100;
            background: white;
            padding: 15px;
            display: block;
            top: 316px;
            left: 464px;
            font-size: 15px;
            max-width: 300px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
            color: #555;
            animation: tooltipIn .1s;

            @keyframes tooltipIn {
                from {
                    opacity: 0;
                    transform: scale(.9);
                }
            }
        }
    }
</style>