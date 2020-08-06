<template>
    <div class="app">

        <div class="sidebar">
            <div class="navigation">
                <p class="title">Typio Form Recovery</p>

                <p><router-link :to="{ name: 'options' }">Options</router-link></p>
                <p><router-link :to="{ name: 'options', hash: '#save-options' }">- Save-options</router-link></p>
                <p><router-link :to="{ name: 'options', hash: '#restore-icon' }">- Restore Icon</router-link></p>
                <p><router-link :to="{ name: 'options', hash: '#save-indicator' }">- Save Indicator</router-link></p>
                <p><router-link :to="{ name: 'options', hash: '#blacklist' }">- Blacklist</router-link></p>
                <p><router-link :to="{ name: 'options', hash: '#keyboard-shortcuts' }">- Keyboard Shortcuts</router-link></p>
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
    import Navigation from './components/Navigation.vue';

    export default {
        name: "App",
        components: {
            Navigation
        },
        mounted() {
            this.$store.dispatch('options/loadOptionsFromStorage');

            // Todo: Remove this
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



    h1 {
        font-weight: 300;
        font-size: 32px;
        margin: 0 0 40px;
    }
    h2 {
        font-weight: 400;
        font-size: 22px;
        margin: 0;
        padding: 0;
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

    h3 {
        font-weight: 400;
        font-size: 19px;
        margin: 0;
    }


    .card {
        padding: 30px;
        margin-bottom: 80px;
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


        &.navigated-to {
            animation: animation 1000ms linear both;
            animation-delay: .1s;
        }




        .animation-target {
            -webkit-animation: animation 1000ms linear both;
            animation: animation 1000ms linear both;
        }

        /* Generated with Bounce.js. Edit at http://bouncejs.com#%7Bs%3A%5B%7BT%3A%22c%22%2Ce%3A%22b%22%2Cd%3A1000%2CD%3A0%2Cf%3A%7Bx%3A0.95%2Cy%3A1%7D%2Ct%3A%7Bx%3A1%2Cy%3A1%7D%2Cs%3A1%2Cb%3A4%7D%2C%7BT%3A%22c%22%2Ce%3A%22b%22%2Cd%3A1000%2CD%3A0%2Cf%3A%7Bx%3A1%2Cy%3A0.95%7D%2Ct%3A%7Bx%3A1%2Cy%3A1%7D%2Cs%3A1%2Cb%3A6%7D%5D%7D */

        @-webkit-keyframes animation {
            0% { -webkit-transform: matrix3d(0.95, 0, 0, 0, 0, 0.95, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.95, 0, 0, 0, 0, 0.95, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            3.4% { -webkit-transform: matrix3d(0.966, 0, 0, 0, 0, 0.97, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.966, 0, 0, 0, 0, 0.97, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            4.7% { -webkit-transform: matrix3d(0.972, 0, 0, 0, 0, 0.98, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.972, 0, 0, 0, 0, 0.98, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            6.81% { -webkit-transform: matrix3d(0.983, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.983, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            9.41% { -webkit-transform: matrix3d(0.994, 0, 0, 0, 0, 1.008, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.994, 0, 0, 0, 0, 1.008, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            10.21% { -webkit-transform: matrix3d(0.997, 0, 0, 0, 0, 1.011, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.997, 0, 0, 0, 0, 1.011, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            13.61% { -webkit-transform: matrix3d(1.006, 0, 0, 0, 0, 1.017, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.006, 0, 0, 0, 0, 1.017, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            14.11% { -webkit-transform: matrix3d(1.007, 0, 0, 0, 0, 1.017, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.007, 0, 0, 0, 0, 1.017, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            17.52% { -webkit-transform: matrix3d(1.01, 0, 0, 0, 0, 1.012, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.01, 0, 0, 0, 0, 1.012, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            18.72% { -webkit-transform: matrix3d(1.011, 0, 0, 0, 0, 1.009, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.011, 0, 0, 0, 0, 1.009, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            21.32% { -webkit-transform: matrix3d(1.01, 0, 0, 0, 0, 1.003, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.01, 0, 0, 0, 0, 1.003, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            24.32% { -webkit-transform: matrix3d(1.008, 0, 0, 0, 0, 0.998, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.008, 0, 0, 0, 0, 0.998, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            25.23% { -webkit-transform: matrix3d(1.007, 0, 0, 0, 0, 0.997, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.007, 0, 0, 0, 0, 0.997, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            29.03% { -webkit-transform: matrix3d(1.003, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.003, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            29.93% { -webkit-transform: matrix3d(1.002, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.002, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            35.54% { -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 0.998, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.999, 0, 0, 0, 0, 0.998, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            36.74% { -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            41.04% { -webkit-transform: matrix3d(0.998, 0, 0, 0, 0, 1.001, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.998, 0, 0, 0, 0, 1.001, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            44.44% { -webkit-transform: matrix3d(0.998, 0, 0, 0, 0, 1.002, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.998, 0, 0, 0, 0, 1.002, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            52.15% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            59.86% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            63.26% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            75.28% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            85.49% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            90.69% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            100% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
        }

        @keyframes animation {
            0% { -webkit-transform: matrix3d(0.95, 0, 0, 0, 0, 0.95, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.95, 0, 0, 0, 0, 0.95, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            3.4% { -webkit-transform: matrix3d(0.966, 0, 0, 0, 0, 0.97, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.966, 0, 0, 0, 0, 0.97, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            4.7% { -webkit-transform: matrix3d(0.972, 0, 0, 0, 0, 0.98, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.972, 0, 0, 0, 0, 0.98, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            6.81% { -webkit-transform: matrix3d(0.983, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.983, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            9.41% { -webkit-transform: matrix3d(0.994, 0, 0, 0, 0, 1.008, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.994, 0, 0, 0, 0, 1.008, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            10.21% { -webkit-transform: matrix3d(0.997, 0, 0, 0, 0, 1.011, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.997, 0, 0, 0, 0, 1.011, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            13.61% { -webkit-transform: matrix3d(1.006, 0, 0, 0, 0, 1.017, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.006, 0, 0, 0, 0, 1.017, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            14.11% { -webkit-transform: matrix3d(1.007, 0, 0, 0, 0, 1.017, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.007, 0, 0, 0, 0, 1.017, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            17.52% { -webkit-transform: matrix3d(1.01, 0, 0, 0, 0, 1.012, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.01, 0, 0, 0, 0, 1.012, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            18.72% { -webkit-transform: matrix3d(1.011, 0, 0, 0, 0, 1.009, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.011, 0, 0, 0, 0, 1.009, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            21.32% { -webkit-transform: matrix3d(1.01, 0, 0, 0, 0, 1.003, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.01, 0, 0, 0, 0, 1.003, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            24.32% { -webkit-transform: matrix3d(1.008, 0, 0, 0, 0, 0.998, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.008, 0, 0, 0, 0, 0.998, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            25.23% { -webkit-transform: matrix3d(1.007, 0, 0, 0, 0, 0.997, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.007, 0, 0, 0, 0, 0.997, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            29.03% { -webkit-transform: matrix3d(1.003, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.003, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            29.93% { -webkit-transform: matrix3d(1.002, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.002, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            35.54% { -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 0.998, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.999, 0, 0, 0, 0, 0.998, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            36.74% { -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            41.04% { -webkit-transform: matrix3d(0.998, 0, 0, 0, 0, 1.001, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.998, 0, 0, 0, 0, 1.001, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            44.44% { -webkit-transform: matrix3d(0.998, 0, 0, 0, 0, 1.002, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.998, 0, 0, 0, 0, 1.002, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            52.15% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            59.86% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            63.26% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            75.28% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            85.49% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            90.69% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
            100% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
        }


    }

</style>