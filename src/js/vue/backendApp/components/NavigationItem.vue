<template>
    <li @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" :class="isHovering ? 'hover-state' : ''">
        <router-link :to="{ name: item.routeName, hash: item.routeHash }">
            <i v-if="item.icon" :class="item.icon"></i>
            {{ item.label }}
        </router-link>

        <ul v-if="isHovering && item.children" class="sub-level">
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

        &.hover-state {
            background: #385177;
        }

        & > a {
            display: block;
            padding: 8px 25px 8px 20px;
            border-left: 5px solid transparent;

            &.router-link-active {
                border-left-color: #FFF;
            }

            i {
                position: relative;
                top: 4px;
                display: inline-block;
                font-size: 20px;
                margin-right: 5px;
                line-height: 1;
            }
        }

        .sub-level {
            position: absolute;
            top: 0;
            left: 100%;
            background: #385177;
            padding: 15px 0;

            li a {
                display: block;
                padding: 5px 25px;

                &:hover {
                    background: #42628f;
                }
            }
        }
    }

</style>