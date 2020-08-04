<template>
    <div class="app">

        <div class="sidebar">
            <div class="navigation">
                <p class="title">Typio Form Recovery</p>

                <p><router-link :to="{ name: 'options' }">Options</router-link></p>
                <p><router-link :to="{ name: 'feedback' }">Feedback</router-link></p>
                <p><router-link :to="{ name: 'faq' }">Frequently Asked Questions</router-link></p>
                <p><router-link :to="{ name: 'permissions' }">Permission Information</router-link></p>
                <p><router-link :to="{ name: 'privacyPolicy' }">Privacy Policy</router-link></p>
            </div>
        </div>

        <div class="main">

            <router-view></router-view>

        </div>

    </div>
</template>

<script>
    import Navigation from './Navigation.vue';

    export default {
        name: "App",
        components: {
            Navigation
        },
    }
</script>

<style lang="scss">

    body {
        font-family: 'Helvetica', sans-serif;
        font-size: 16px;
        margin: 0;
        overflow-y: scroll;
        background: #f9f9f9;
    }

    *, *::before, *::after {
        box-sizing: border-box;
    }

    .app {
        margin: 0 auto;
        max-width: 1200px;
        display: flex;
        box-shadow: 0 1px 4px #c6d6e6, 0 1px 10px #eceded;

        .sidebar {
            flex: 0 1 auto;
            background: #486da7;
            color: #FFF;
            min-height: 100vh;

            .navigation {
                position: sticky;
                top: 0;
                padding: 80px 80px 80px 30px;
            }

            .title {
                color: #b6c9e4;
                margin-bottom: 30px;
                font-size: 20px;
            }

            a {
                color: #FFF;
                text-decoration: none;
                white-space: nowrap;
            }
        }

        .main {
            flex: 1 1 auto;
            background: #FFF;
            padding: 80px 60px;
        }
    }


    .fancy-chk {
        $size: 18px;
        height: $size;
        width: $size;
        position: relative;
        display: inline-block;
        margin-right: 8px;
        top: 3px;

        &:hover .chk {
            box-shadow: inset 0 0 0 1px #8C8C8C;
        }

        .chk, input {
            position: absolute;
            top: 0; left: 0;
            height: $size; width: $size;
        }
        input {
            opacity: 0;
        }

        .chk {
            pointer-events: none;
            box-shadow: inset 0 0 0 1px #A8A8A8;
            transition-duration: .2s;
            border-radius: 2px;
            background: #FFF no-repeat url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMiIgaWQ9ImNoZWNrIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHdpZHRoPSIzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMSAxNCBMNSAxMCBMMTMgMTggTDI3IDQgTDMxIDggTDEzIDI2IHoiLz48L3N2Zz4=);
            background-size: 12px;
            background-position-y: -12px;
            background-position-x: center;
        }
        input:checked ~ .chk {
            box-shadow: inset 0 0 0 0 #A8A8A8;
            background-position-y: center;
            background-color: #33A851;
        }
    }


    .tooltip-wrapper {
        display: inline;
        position: relative;

        .text {
            display: inline;
            color: #d5ae39;
            cursor: help;
        }

        .tooltip {
            position: absolute;
            pointer-events: none;
            z-index: 100;
            background: white;
            padding: 10px;
            display: block;
            top: 316px;
            left: 464px;
            font-size: 13px;
            max-width: 250px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
            color: #555;
            width: 250px;
            animation: tooltipIn .1s;

            @keyframes tooltipIn {
                from {
                    opacity: 0;
                    transform: scale(.9);
                }
            }
        }
    }

    h2 {
        font-weight: 300;
        font-size: 25px;
        margin: 0;
    }

    .options-box {
        padding: 30px;
        margin: -10px;
        margin-bottom: 50px;
        border: 1px solid #e2e2e2;
        border-radius: 5px;
    }


    .keyboard-shortcut-list {
        .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            padding: 5px 0;
            cursor: pointer;

            &:hover {
                background: #e2e2e2;
            }

            input {
                width: 160px;
                text-align: center;
                border: 1px solid #bfbfbf;
            }
        }
    }

</style>