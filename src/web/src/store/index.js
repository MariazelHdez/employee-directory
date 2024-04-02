import Vue from "vue";
import Vuex from "vuex";

import auth from "./auth";
import sortPositions from "./sortPositions";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    auth,
    sortPositions,
  }
});
