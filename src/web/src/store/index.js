import Vue from "vue";
import Vuex from "vuex";
import i18n from "../i18n";

import auth from "./auth";
import sortPositions from "./sortPositions";
import snackbar from "./snackbar";
import synonyms from "./synonyms";
import exceptions from "./exceptions";

Vue.use(Vuex);

export default new Vuex.Store({

  state: {
    locale: "en"
  },
  getters: {
    locale: state => state.locale,
  },
  mutations: {
    SET_LOCALE: (state, value) => {
      state.locale = value;
    },
  },
  actions: {
    setLocale: ({ commit, getters }, locale) => {
      commit("SET_LOCALE", locale);
    },
  },
  modules: {
    auth,
    sortPositions,
    snackbar,
    synonyms,
    exceptions
  }
});
