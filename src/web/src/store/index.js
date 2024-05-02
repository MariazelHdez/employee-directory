import Vue from "vue";
import Vuex from "vuex";

import auth from "./auth";
import sortPositions from "./sortPositions";
import snackbar from "./snackbar";
import synonyms from "./synonyms";
import exceptions from "./exceptions";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    auth,
    sortPositions,
    snackbar,
    synonyms,
    exceptions
  }
});
