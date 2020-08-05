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
        margin: 0;
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

</style>