import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';
import i18n from './i18n';
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(Vue3Toastify, {
  autoClose: 3000,
});
app.mount('#app');
