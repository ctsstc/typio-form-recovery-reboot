<template>
    <li @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" :class="isHovering ? 'hover-state' : ''">
        <router-link :to="{ name: item.routeName, hash: item.routeHash }">
            <i v-if="item.icon" :class="item.icon"></i>
            {{ item.label }}
        </router-link>

        <ul v-show="isHovering && item.children" class="sub-level">
            <navigation-item v-for="childItem of item.children" :key="childItem.label" :item="childItem"></navigation-item>
        </ul>
    </li>
</template>

<script>
    import NavigationItem from './NavigationItem.vue';

    export default {
        name: "NavigationItem",
        props: ['item'],
        data() {
            return {
                isHovering: false,
                hideTimeout: null,
            }
        },
        components: {
            NavigationItem,
        },
        methods: {
            onMouseEnter() {
                this.isHovering = true;
                clearTimeout(this.hideTimeout);
            },
            onMouseLeave() {
                if(!this.item.children) {
                    this.isHovering = false;
                    return;
                }

                clearTimeout(this.hideTimeout);
                this.hideTimeout = setTimeout(() => {
                    this.isHovering = false;
                }, 100)
            },
        },
    }
</script>

<style lang="scss" scoped>


    ul, li {
        margin: 0;
        padding: 0;
        display: block;
    }

    .root-level > li {
        position: relative;
        transition-duration: .2s;

        &.hover-state {
            background: #597eb7;
        }

        & > a {
            display: block;
            padding: 8px 25px 8px 20px;
            transition-duration: inherit;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                width: 5px;
                background: #FFF;
                transform: scaleX(0);
                transform-origin: top left;
                transition-duration: .2s;
            }

            &.router-link-active::before {
                transform: none;
                transition-duration: 1s;
            }

            i {
                position: relative;
                top: 4px;
                display: inline-block;
                font-size: 20px;
                margin-right: 5px;
                line-height: 1;

                // Set sizes to avoid jumpiness on load
                width: 20px;
                height: 24px;
            }
        }

        .sub-level {
            position: absolute;
            top: 0;
            left: 100%;
            background: #ffffff;
            padding: 15px 0;
            box-shadow: 0 0 30px #0000000d, 0 1px 5px #00000021;
            animation: subIn .8s;
            animation-timing-function: cubic-bezier(0.075, 0.820, 0.165, 1.000); /* easeOutCirc */
            transform-origin: left center;

            @keyframes subIn {
                from {
                    opacity: 0;
                    transform: scale(.97);
                }
            }

            li a {
                display: block;
                padding: 5px 25px;
                color: #2e3746;
                transition-duration: .2s;

                &:hover {
                    background: #e2e6ec;
                }
            }
        }
    }

</style>