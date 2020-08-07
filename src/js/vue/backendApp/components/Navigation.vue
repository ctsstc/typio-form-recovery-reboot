<template>
    <div class="navigation">
        <p class="title">Typio Form Recovery</p>

        <div ref="rootLevel" class="root-level">
            <navigation-item v-for="item of menuItems" :key="item.label" :item="item"></navigation-item>
        </div>
        <!--
        <ul ref="rootLevel" class="root-level">
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
            <li>
                <router-link :to="{ name: 'faq' }"><i class="icon-help-circled"></i> Frequently Asked Questions</router-link>
                <ul class="sub-level">
                    <li><router-link :to="{ name: 'faq', hash: '#save-frequency' }">How frequently does Typio save my input?</router-link></li>
                    <li><router-link :to="{ name: 'faq', hash: '#input-not-saved' }">Why wasn't input wasn't saved?</router-link></li>
                    <li><router-link :to="{ name: 'faq', hash: '#error-input-not-found' }">Error: Cannot find a focused input field</router-link></li>
                    <li><router-link :to="{ name: 'faq', hash: '#error-cannot-auto-restore' }">Error: Entry cannot be restored automatically</router-link></li>
                </ul>
            </li>
            <li><router-link :to="{ name: 'privacy' }"><i class="icon-lock"></i> Privacy Information</router-link></li>
        </ul>
        -->
    </div>
</template>

<script>
    import NavigationItem from './NavigationItem.vue';

    export default {
        name: "Navigation",
        components: {
            NavigationItem,
        },
        data() {
            return {
                menuItems: [
                    { label: 'Options', routeName: 'options', icon: 'icon-cog', children: [
                        { label: 'Save-options', routeName: 'options', routeHash: '#save-options' },
                        { label: 'Restore Icon', routeName: 'options', routeHash: '#restore-icon' },
                        { label: 'Save Indicator', routeName: 'options', routeHash: '#save-indicator' },
                        { label: 'Blacklist', routeName: 'options', routeHash: '#blacklist' },
                        { label: 'Keyboard Shortcuts', routeName: 'options', routeHash: '#keyboard-shortcuts' },
                        { label: 'Context Menu', routeName: 'options', routeHash: '#context-menu' },
                    ] },
                    { label: 'Feedback', routeName: 'feedback', routeHash: '', icon: 'icon-megaphone' },
                    { label: 'Frequently Asked Questions', routeName: 'faq', routeHash: '', icon: 'icon-help-circled', children: [
                        { label: 'How frequently does Typio save my input?', routeName: 'faq', routeHash: '#save-frequency' },
                        { label: 'Why wasn\'t input wasn\'t saved?', routeName: 'faq', routeHash: '#input-not-saved' },
                        { label: 'Error: Cannot find a focused input field', routeName: 'faq', routeHash: '#error-input-not-found' },
                        { label: 'Error: Entry cannot be restored automatically', routeName: 'faq', routeHash: '#error-cannot-auto-restore' },
                    ] },
                    { label: 'Privacy Information', routeName: 'privacy', routeHash: '', icon: 'icon-lock' },
                ]
            }
        },
        mounted() {
            const rootLis = document.querySelectorAll('.root-level > li');

            for(const li of rootLis) {
                li.addEventListener('mouseenter', this.onRootLiMouseEnter);
                li.addEventListener('mouseleave', this.onRootLiMouseLeave);
            }
        },
        methods: {
            onRootLiMouseEnter(e) {
                e.target.classList.add('hover');
            },
            onRootLiMouseLeave(e) {
                e.target.classList.remove('hover');
            },
        },
    }
</script>

<style lang="scss" scoped>

    .navigation {
        padding: 80px 0 0;
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

</style>