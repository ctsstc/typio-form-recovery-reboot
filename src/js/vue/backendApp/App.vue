<template>
    <div class="app">

        <div class="sidebar">
            <navigation class="navigation"></navigation>
        </div>

        <div class="main">

            <!--<div class="top-bar">-->
                <!--<div class="left">-->
                    <!--Typio Form Recovery-->
                <!--</div>-->
                <!--<div class="right">-->
                    <!--<a target="_blank" href="https://chrome.google.com/webstore/detail/typio-form-recovery/djkbihbnjhkjahbhjaadbepppbpoedaa/reviews">Review Typio</a>-->
                <!--</div>-->
            <!--</div>-->

            <router-view class="page-container"></router-view>

        </div>

    </div>
</template>

<script>
    import Navigation from './components/Navigation.vue';

    export default {
        name: "App",
        components: {
            Navigation,
        },
        mounted() {
            this.$store.dispatch('options/loadOptionsFromStorage');

            // Vue router doesn't scroll to anchors on page load
            if(this.$route.hash) {
                const el = document.querySelector(this.$route.hash);
                if(el) {
                    el.scrollIntoView(true);
                }
            }
        }
    }
</script>

<style lang="scss">

    body {
        font-family: 'Helvetica', sans-serif;
        font-size: 16px;
        margin: 0;
        overflow-y: scroll;
        background: #f9f9f9;
        color: #444;
        line-height: 1.4;
    }

    *, *::before, *::after {
        box-sizing: border-box;
    }

    a {
        color: #486da7;
        text-decoration: none;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }

    .app {
        display: flex;

        .sidebar {
            position: relative;
            z-index: 1;
            flex: 0 1 auto;
            background: #486da7;
            color: #FFF;
            min-height: 100vh;

            .navigation {
                position: sticky;
                top: 0;
            }

            a {
                color: #FFF;
                text-decoration: none;
                white-space: nowrap;
            }
        }

        .main {
            position: relative;
            flex: 1 1 auto;
            background: #f5f5f5;
            padding: 80px 60px 50vh;

            .top-bar {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
                padding: 15px 20px;
                font-size: 14px;
                border-bottom: 1px solid #e2e2e2;
                color: #4a4a4a;
                background: #FFF;

                a {
                    color: #486ca7;
                    text-decoration: none;

                    &:hover {
                        text-decoration: underline;
                    }
                }                
            }

            .page-container {
                max-width: 800px;
                margin: 0 auto;
            }
        }
    }



    h1 {
        font-weight: 300;
        font-size: 42px;
        margin: 0 0 40px;
    }
    h2 {
        font-weight: 400;
        font-size: 22px;
        margin: 0;
        padding: 0;
        color: #333;
        position: relative;
    }
    h3 {
        font-weight: 400;
        font-size: 19px;
        margin: 0;
    }


    .card {
        padding: 30px;
        margin-bottom: 20px;
        background: white;
        position: relative;
        border: 1px solid #e4e4e4;

        /*
        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: #00000008;
            border-radius: inherit;
            transform-origin: bottom left;
            transition-duration: .3s;
            pointer-events: none;
            transform: scaleX(1.01) rotate(2deg);
        }
        */

    }


    select {
        padding: 8px 10px;
        font-size: 15px;
    }

    input[type=color] {
        height: 35px;
        position: relative;
        top: 5px;
        margin-top: -5px;
    }

</style>