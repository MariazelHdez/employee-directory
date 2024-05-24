import Vue from 'vue'
import VueI18n from 'vue-i18n'
import store from './store'
import { en } from "./locales/en-us";
import { fr } from "./locales/fr-ca";

Vue.use(VueI18n)

const messages = {
  en,
  fr,
};

export default new VueI18n({
  locale: "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages
})
