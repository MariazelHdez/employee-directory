import axios from "axios";
import { AUTH_CHECK_URL, LOGOUT_URL } from "../urls";
import router from "../router";

const state = {
    user: null,
};
const getters = {
    isAuthenticated: state => !!state.user,
    user: state => state.user,
};
const actions = {
    async checkAuthentication({ commit }) {
        try {
            const resp = await axios.get(AUTH_CHECK_URL, { headers: { withCredentials: true } });
            const status = resp?.status;
            const isAuth = resp?.data.isAuth;

            if (status === 200 && isAuth) {
                commit("SET_USER", resp.data.data);
            } else {
                commit("CLEAR_USER");
            }
        } catch (error) {
            console.log(error);
            commit("CLEAR_USER");
        }
    },
    async signOut({ commit }) {
        try {
            const resp = await axios.get(LOGOUT_URL);
            const data = resp.data?.data;
            
            if (data?.logout) {
                commit("CLEAR_USER");
                router.push({ name: "Login" });
            }
        } catch (error) {
            console.log(error);
        }
    }
};
const mutations = {
    SET_USER(state, user) {
        state.user = user;
    },
    CLEAR_USER(state) {
        state.user = null;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};