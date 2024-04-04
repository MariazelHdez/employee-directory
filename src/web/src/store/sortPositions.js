import axios from "axios";
import { SORT_POSITIONS } from "../urls";
import { StaffDirectoryUrl } from "../config";

const state = {
    sortPositions: [],
    newSortPositions: []
};
const getters = {
    sortPositions: state => state.sortPositions,
    newSortPositions: state => state.newSortPositions,
};
const actions = {
    async getSortPositions({ commit }) {
        try {
            const resp = await axios.get(SORT_POSITIONS);
            const data = resp.data;
            console.log(resp.data);

            if (data?.success) {
                commit("SET_SORT_POSITIONS", resp.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    },
    async insertSortPosition({ dispatch }, { sortPosition }) {
        try {
            const resp = await axios.post(SORT_POSITIONS, sortPosition);
            const data = resp.data;

            console.log(resp.data);

            if (data?.success) {
                console.log(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch("getSortPositions");
        }
    },
    async deleteSortPosition({ dispatch }, sortPositionId) {
        try {
            const resp = await axios.delete(`${SORT_POSITIONS}/${sortPositionId}`,);
            const data = resp.data;

            console.log(resp.data);

            if (data?.success) {
                console.log(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch("getSortPositions");
        }
    },
    addToNewSortPositions({ commit, getters }, { position }) {
        try {
            const positionList = [...getters.newSortPositions];
            const positionExists = positionList.findIndex(p => p.Id === position.Id);
            
            if (positionExists !== -1) {
                positionList[positionExists] = position;
                commit("SET_NEW_SORT_POSITIONS", positionList);
            } else {
                positionList.push(position);
                commit("SET_NEW_SORT_POSITIONS", positionList);
            }
            
        } catch (error) {
            console.log(error);
        }
    },
    async postNewSortPositions({ commit, getters, dispatch }) {
        try {
            const models = [ ...getters.newSortPositions ]

            const resp = await axios.post(StaffDirectoryUrl+"/ReorderPositions", { Models: models });
            //const resp = await axios.post(SORT_POSITIONS, { Models: models });
            const data = resp?.data;
            if (data?.success) {
                console.log(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch("getSortPositions");
        }
    },
    cleanNewSortPositions({ commit }) {
        try {
            commit("SET_NEW_SORT_POSITIONS", []);
        } catch (error) {
            console.log(error);
        }
    },
};
const mutations = {
    SET_SORT_POSITIONS(state, sortPositions) {
        state.sortPositions = sortPositions;
    },
    SET_NEW_SORT_POSITIONS(state, sortPositions) {
        state.newSortPositions = sortPositions;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};