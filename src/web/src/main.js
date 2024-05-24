import Vue from "vue";
import App from "./App.vue";

import router from "./router";
import store from "./store";
import axios from "axios";
import 'leaflet/dist/leaflet.css';
import vuetify from "./plugins/vuetify";
import infiniteScroll from 'vue-infinite-scroll';
import i18n from './i18n';
import VueCookies from 'vue-cookies';

Vue.config.productionTip = false;

axios.defaults.withCredentials = true;


Vue.use(infiniteScroll);

// default options config: { expires: '1d', path: '/', domain: '', secure: '', sameSite: 'Lax' }
Vue.use(VueCookies, { expires: '7d' });

new Vue({
  router,
  store,
  vuetify,
  i18n,
  directives: {infiniteScroll},
  render: h => h(App)
}).$mount("#app");

