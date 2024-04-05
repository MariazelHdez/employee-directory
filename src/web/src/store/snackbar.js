const state = {
    snackbar: false,
    snackbarMessage: "",
    snackbarColor: ""
};
const getters = {
    snackbar: state => state.snackbar,
    snackbarMessage: state => state.snackbarMessage,
    snackbarColor: state => state.snackbarColor,
};
const actions = {
    showSnackBar({ commit }, { message, show, color }) {
        try {
            commit("SET_SNACKBAR", show);
            commit("SET_SNACKBAR_MESSAGE", message);
            commit("SET_SNACKBAR_COLOR", color);
            
        } catch (error) {
            console.log(error);
        }
    },
    clearSnackBar({ commit }) {
        try {
            commit("SET_SNACKBAR", false);
            commit("SET_SNACKBAR_MESSAGE", "");
            commit("SET_SNACKBAR_COLOR", "");
            
        } catch (error) {
            console.log(error);
        }
    },
    
};
const mutations = {
    SET_SNACKBAR(state, snackbar) {
        state.snackbar = snackbar;
    },
    SET_SNACKBAR_MESSAGE(state, snackbarMessage) {
        state.snackbarMessage = snackbarMessage;
    },
    SET_SNACKBAR_COLOR(state, snackbarColor) {
        state.snackbarColor = snackbarColor;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};