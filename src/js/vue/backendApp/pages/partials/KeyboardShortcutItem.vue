<template>
    <div class="row">
        <div>
            {{ option.label }}
        </div>
        <div>
            <span class="keycombo">{{ value || 'Disabled' }}</span>
        </div>
        <div><a>Edit</a></div>
    </div>
</template>

<script>
    export default {
        name: "KeyboardShortcutItem",
        props: ['option', 'value'],
        mounted() {
            // Dynamically attach updated() lifecycle hook on mounted() to prevent it from triggering on doc load
            setTimeout(() => {
                this.$on('hook:updated', () => {
                    this.$el.classList.add('animate');
                    setTimeout(() => {
                        this.$el.classList.remove('animate');
                    }, 1000)
                })
            })
        },
    }
</script>

<style lang="scss" scoped>

    .row {
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;
        cursor: pointer;

        &.animate {
            animation: blockItemIn 1.5s;
            animation-delay: .1s;
        }

        @keyframes blockItemIn {
            from {
                background: #cccccc;
            }
            to {
                background: transparent;
            }
        }

        div:first-child {
            flex-grow: 1;
        }

        div:last-child {
            margin-left: 50px;
        }

        &:hover {
            background: #f0f0f0;
        }

        input {
            width: 160px;
            text-align: center;
            border: 1px solid #bfbfbf;
        }
    }

    .keycombo {
        padding: 3px 10px;
        border: 1px solid #d4d4d4;
        border-radius: 5px;
        font-size: 15px;
        background: #FFF;
        white-space: nowrap;
    }

</style>