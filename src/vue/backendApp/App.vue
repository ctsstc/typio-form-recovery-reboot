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

            <div class="top-bar">
                <div class="left">
                    Typio Form Recovery
                </div>
                <div class="right">
                    <a target="_blank" href="https://chrome.google.com/webstore/detail/typio-form-recovery/djkbihbnjhkjahbhjaadbepppbpoedaa/reviews">Review Typio</a>
                </div>
            </div>

            <router-view class="page-container"></router-view>

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
        mounted() {
            this.$store.dispatch('options/loadOptionsFromStorage');

            setTimeout(updateGlobals, 50);
            window.tmpGlobOpts = {};
            const store = this.$store;
            function updateGlobals() {
                window.tmpGlobOpts.savePasswords = store.state.options.options.savePasswords;
                window.tmpGlobOpts.saveCreditCards = store.state.options.options.saveCreditCards;
                window.tmpGlobOpts.storageTimeDays = store.state.options.options.storageTimeDays;
                window.tmpGlobOpts.saveIndicator = store.state.options.options.saveIndicator;
                window.tmpGlobOpts.saveIndicatorColor = store.state.options.options.saveIndicatorColor;
                window.tmpGlobOpts.hideSmallEntries = store.state.options.options.hideSmallEntries;
                window.tmpGlobOpts.keybindEnabled = store.state.options.options.keybindEnabled;
                window.tmpGlobOpts.quickAccessButtonEnabled = store.state.options.options.quickAccessButtonEnabled;
                window.tmpGlobOpts.quickAccessButtonTrigger = store.state.options.options.quickAccessButtonTrigger;
                window.tmpGlobOpts.cloneOnRestore = store.state.options.options.cloneOnRestore;
                window.tmpGlobOpts.resetEditablesBetweenRestorations = store.state.options.options.resetEditablesBetweenRestorations;
                window.tmpGlobOpts.qaGroupSessions = store.state.options.options.qaGroupSessions;
                window.tmpGlobOpts.qaEnableSessionSubmenu = store.state.options.options.qaEnableSessionSubmenu;
                window.tmpGlobOpts.keybindToggleRecDiag = store.state.options.options.keybindToggleRecDiag;
                window.tmpGlobOpts.keybindRestorePreviousSession = store.state.options.options.keybindRestorePreviousSession;
                window.tmpGlobOpts.keybindOpenQuickAccess = store.state.options.options.keybindOpenQuickAccess;
            }

            this.$store.subscribeAction((action, state) => {
                if(action.type === 'options/save') {
                    updateGlobals();
                }
            });
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
        color: #333;
    }

    *, *::before, *::after {
        box-sizing: border-box;
    }

    .app {
        /*max-width: 1200px;*/
        display: flex;
        /*box-shadow: 0 1px 4px #c6d6e6, 0 1px 10px #eceded;*/

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
            position: relative;
            flex: 1 1 auto;
            background: #f5f5f5;
            padding: 80px 60px;

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
                position: relative;
                z-index: 1;
            }
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

    h1 {
        font-weight: 300;
        font-size: 32px;
        margin: 0;
    }
    h2 {
        font-weight: 400;
        font-size: 22px;
        margin: -30px 0 0;
        padding: 30px 0 0;
        color: #333;
        position: relative;

        &::after {
            content: '';
            height: 6px;
            background: #f1f1f1;
            border-radius: 10px;
            margin-top: 10px;
        }
    }

    .options-box {
        padding: 30px;
        margin: -10px;
        margin-bottom: 80px;
        background: white;
        position: relative;

        &:hover::before {
            transform: scaleX(1.01) rotate(2deg);
            /*transition-duration: .1s;*/
        }

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
        }
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

    .keyboard-shortcut-picker {
        position: fixed;
        z-index: 10;
        top: 0; left: 0; right: 0; bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.8);
        color: #FFF;
    }

</style>