import { createI18n } from 'vue-i18n';
import tg from './locales/tg.json';
import fa from './locales/fa.json';

const messages = {
  tg,
  fa
};

const savedLocale = localStorage.getItem('vozhajuLocale') || 'tg';

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'tg',
  messages,
});

export default i18n;
