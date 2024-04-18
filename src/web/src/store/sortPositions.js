import axios from "axios";
import { SORT_POSITIONS, EMPLOYEE_TITLES } from "../urls";
import { StaffDirectoryUrl } from "../config";

const state = {
    sortPositions: [],
    newSortPositions: [],
    page: 1,
    busy: false,
    stopFetch: false,
    employeeTitles: [],
};
const getters = {
    sortPositions: state => state.sortPositions,
    newSortPositions: state => state.newSortPositions,
    page: state => state.page,
    busy: state => state.busy,
    stopFetch: state => state.stopFetch,
    employeeTitles: state => state.employeeTitles,
};
const actions = {
    async getSortPositions({ commit, getters }) {
        try {
            if (!getters.stopFetch) {
                commit("SET_BUSY", true);
                const resp = await axios.get(SORT_POSITIONS + "?index=" + getters.page);
                const data = resp.data;

                if (data?.success) {
                    const newData = resp.data.data;
                    if (newData?.length > 0) {
                        commit("SET_SORT_POSITIONS", [ ...getters.sortPositions, ...newData ]);
                        commit("SET_PAGE", getters.page+1);
                        commit("SET_BUSY", false);
                    } else {
                        commit("SET_STOP_FETCH", true);
                        commit("SET_BUSY", false);
                    }
                }
            }
        } catch (error) {
            console.log(error);
            commit("SET_BUSY", false);
            dispatch("showSnackBar", { message: "Error to get terms", status: "error" });
        }
    },
    async insertSortPosition({ dispatch }, { sortPosition }) {
        try {
            const resp = await axios.post(SORT_POSITIONS, sortPosition);
            const data = resp.data;

            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "error to insert", status: "error" });
        } finally {
            dispatch("getSortPositions");
        }
    },
    async deleteSortPosition({ dispatch }, sortPositionId) {
        try {
            const resp = await axios.delete(`${SORT_POSITIONS}/${sortPositionId}`,);
            const data = resp.data;

            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "error to delete", status: "error" });
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
            console.log(models);
            const resp = await axios.post(StaffDirectoryUrl+"/ReorderPositions", { Models: models });
            //const resp = await axios.post(SORT_POSITIONS, { Models: models });
            const data = resp?.data;
            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "Error to update order", status: "error" });
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
    reloadFetch({ commit }) {
        try {
            commit("SET_STOP_FETCH", false);
        } catch (error) {
            console.log(error);
        }
    },
    async getEmployeeTitles({ commit, getters }, searchTerm) {
        try {
            const resp = await axios.get(`${EMPLOYEE_TITLES}/${searchTerm}`);//await axios.get(EMPLOYEE_TITLES);
            const data = resp.data;

            if (data?.titles) {
                const jobTitles = resp.data.titles
                                    .map(employee => employee.JobTitle)
                                    .filter(title => title.length > 1);

                console.log(jobTitles);
                commit("SET_EMPLOYEE_TITLES", jobTitles);
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "Error to get employee titles", status: "error" });
        }
    }
};
const mutations = {
    SET_SORT_POSITIONS(state, sortPositions) {
        state.sortPositions = sortPositions;
    },
    SET_NEW_SORT_POSITIONS(state, sortPositions) {
        state.newSortPositions = sortPositions;
    },
    SET_PAGE(state, page) {
        state.page = page;
    },
    SET_BUSY(state, busy) {
        state.busy = busy;
    },
    SET_STOP_FETCH(state, stopFetch) {
        state.stopFetch = stopFetch;
    },
    SET_EMPLOYEE_TITLES(state, employeeTitles) {
        state.employeeTitles = employeeTitles;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};