import VueRouter from 'vue-router';

import FeedbackPage from '../../vue/backendApp/pages/FeedbackPage.vue';
import OptionsPage from '../../vue/backendApp/pages/OptionsPage.vue';
import FAQPage from '../../vue/backendApp/pages/FAQPage.vue';
import PermissionsInfoPage from '../../vue/backendApp/pages/PermissionsInfoPage.vue';
import PrivacyPolicyPage from '../../vue/backendApp/pages/PrivacyPolicyPage.vue';

const routes = [
    { path: '/', name: 'home', component: OptionsPage },
    { path: '/options', name: 'options', component: OptionsPage },
    { path: '/feedback', name: 'feedback', component: FeedbackPage },
    { path: '/faq', name: 'faq', component: FAQPage },
    { path: '/permissions', name: 'permissions', component: PermissionsInfoPage },
    { path: '/privacy-policy', name: 'privacyPolicy', component: PrivacyPolicyPage },
];

export default new VueRouter({ routes });