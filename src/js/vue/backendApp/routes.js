import Vue from 'vue';
import VueRouter from 'vue-router';

import FeedbackPage from './pages/FeedbackPage.vue';
import OptionsPage from './pages/OptionsPage.vue';
import FAQPage from './pages/FAQPage.vue';
import PrivacyPage from './pages/PrivacyPage.vue';

Vue.use(VueRouter);

const routes = [
    { path: '/', name: 'home', component: OptionsPage },
    { path: '/options', name: 'options', component: OptionsPage },
    { path: '/feedback', name: 'feedback', component: FeedbackPage },
    { path: '/faq', name: 'faq', component: FAQPage },
    { path: '/privacy', name: 'privacy', component: PrivacyPage },
];

export default new VueRouter({
    routes,
    scrollBehavior (to, from, savedPosition) {
        console.log(to);
        if (to.hash) {
            return { selector: to.hash }
        } else if (savedPosition) {
            return savedPosition;
        } else {
            return { x: 0, y: 0 }
        }
    }
});