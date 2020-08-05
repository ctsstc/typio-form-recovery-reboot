<template>
    <div class="fancy-check-wrapper">

        <div class="fancy-check">
            <input @change="$emit('input', $event.target.checked)" :checked="this.modelValue" type="checkbox" :id="inputId">
            <span class="fake"></span>
        </div>

        <label v-if="labelText" :for="inputId">
            <template v-if="labelText === '__RENDER_SLOT__'">
                <slot></slot>
            </template>
            <template v-else>
                {{ labelText }}
            </template>
        </label>

    </div>
</template>

<script>
    export default {
        name: "FancyCheck",
        model: {
            prop: 'modelValue',
            event: 'input'
        },
        props: ['label', 'modelValue'],
        computed: {
            labelText() {
                return this.$slots.default ? "__RENDER_SLOT__" : this.label;
            },
            inputId() {
                return 'pretty-check-' + Math.random();
            },
        },
    }
</script>

<style lang="scss" scoped>
    
    .fancy-check-wrapper {
        &:hover .fancy-check {
        }
    }

    .fancy-check {
        $size: 18px;
        height: $size;
        width: $size;
        position: relative;
        display: inline-block;
        margin-right: 5px;
        top: 3px;

        .fake, input {
            position: absolute;
            top: 0; left: 0;
            height: $size; width: $size;
        }
        input {
            opacity: 0;
        }

        .fake {
            pointer-events: none;
            border: 1px solid #A8A8A8;
            border-radius: 2px;
            background: #FFF no-repeat url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMiIgaWQ9ImNoZWNrIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHdpZHRoPSIzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMSAxNCBMNSAxMCBMMTMgMTggTDI3IDQgTDMxIDggTDEzIDI2IHoiLz48L3N2Zz4=);
            background-size: 12px;
            background-position-y: -12px;
            background-position-x: center;
            transition-duration: .3s;

            &::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                z-index: -1;
                border-radius: inherit;
                background-color: rgba(51, 168, 81, 1);
            }
        }

        input:checked ~ .fake {
            border-color: #33A851;
            background-position-y: center;
            background-color: #33A851;
        }
    }
</style>