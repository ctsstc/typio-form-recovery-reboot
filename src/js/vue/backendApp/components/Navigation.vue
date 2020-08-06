<template>
    <div class="navigation">
        <p class="title">Typio Form Recovery</p>

        <ul class="root-level">
            <li>
                <router-link :to="{ name: 'options' }"><i class="icon-cog"></i> Options</router-link>
                <ul class="sub-level">
                    <li><router-link :to="{ name: 'options', hash: '#save-options' }">Save-options</router-link></li>
                    <li><router-link :to="{ name: 'options', hash: '#restore-icon' }">Restore Icon</router-link></li>
                    <li><router-link :to="{ name: 'options', hash: '#save-indicator' }">Save Indicator</router-link></li>
                    <li><router-link :to="{ name: 'options', hash: '#blacklist' }">Blacklist</router-link></li>
                    <li><router-link :to="{ name: 'options', hash: '#keyboard-shortcuts' }">Keyboard Shortcuts</router-link></li>
                    <li><router-link :to="{ name: 'options', hash: '#context-menu' }">Context Menu</router-link></li>
                </ul>
            </li>
            <li><router-link :to="{ name: 'feedback' }"><i class="icon-megaphone"></i> Feedback</router-link></li>
            <li><router-link :to="{ name: 'faq' }"><i class="icon-help-circled"></i> Frequently Asked Questions</router-link></li>
            <li><router-link :to="{ name: 'privacy' }"><i class="icon-lock"></i> Privacy Information</router-link></li>
        </ul>

    </div>
</template>

<script>
    export default {
        name: "Navigation"
    }
</script>

<style lang="scss" scoped>

    .navigation {
        padding: 80px 0 0;

        .root-level > li > .router-link-active {
            /*background: rgba(0,0,0,.1);*/
            border-color :#FFF;
        }
    }

    .title {
        color: #101925;
        margin-bottom: 30px;
        font-size: 20px;
        background: #FFF;
        display: inline-block;
        margin-left: 30px;
        padding: 6px 11px;
        font-weight: 300;
    }

    ul, li {
        margin: 0;
        padding: 0;
        display: block;
    }

    .sub-level {
        margin-left: 20px;
    }

    li a {
        display: block;
        padding: 8px 25px 8px 20px;

        i {
            position: relative;
            top: 4px;
            display: inline-block;
            font-size: 20px;
            margin-right: 5px;
            line-height: 1;
        }
    }

    .root-level > li > a {
        border-left: 5px solid transparent;
    }

    .sub-level {
        margin-left: 35px;
    }
</style>