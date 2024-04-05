import Vue from "vue";
import Vuex from "vuex";

import auth from "./auth";
import sortPositions from "./sortPositions";
import snackbar from "./snackbar";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    auth,
    sortPositions,
    snackbar,
  }
});
