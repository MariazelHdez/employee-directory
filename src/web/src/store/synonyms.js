import axios from "axios";
import { SYNONYMS, TERMS, SYNONYMS_DELETE, SYNONYMS_FIELDS, SYNONYMS_FIELDS_DELETE_TERM } from "../urls";
import { StaffDirectoryUrl } from "../config";

const state = {
    synonyms: [],
    terms: [],
    fields: [],
};
const getters = {
    synonyms: state => state.synonyms,
    terms: state => state.terms,
    fields: state => state.fields,
};
const actions = {
    async getSynonyms({ dispatch, commit }) {
        try {
            const resp = await axios.get(SYNONYMS);
            const data = resp.data;

            if (data?.synonyms) {

                const grouped = {};

                resp.data.synonyms.forEach(item => {
                    const key = item.id;
                    if (grouped[key]) {

                        if (!grouped[key].field_id.includes(item.field_id)) {
                            grouped[key].field_id += `, ${item.field_id}`;
                        }

                    } else {
                        grouped[key] = { ...item };
                    }
                });

                const groupedSynonyms = Object.values(grouped);

                //commit("SET_SYNONYMS", [...resp.data.synonyms]);
                commit("SET_SYNONYMS", groupedSynonyms);
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "Error to get synonyms", status: "error" });
        }
    },
    async getTerms({ dispatch, commit }) {
        try {
            const resp = await axios.get(TERMS);
            const data = resp.data;

            if (data?.terms) {
                const clean = resp.data.terms.map(({ Synonyms, SynonymsFields, ...rest }) => rest);

                const termsArray = clean.map(({ id, term, ...rest }) => ({
                    ...rest,
                    value: id,
                    text: term
                }));

                //commit("SET_TERMS", [...resp.data.terms]);
                commit("SET_TERMS", termsArray);
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "Error to get terms", status: "error" });
        }
    },
    async deleteSynonym({ dispatch }, synonymId) {
        try {
            const resp = await axios.delete(`${SYNONYMS_DELETE}/${synonymId}`,);
            const data = resp.data;

            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "error to delete synonym", status: "error" });
        } finally {
            dispatch("getSynonyms");
        }
    },
    async getSynonymFields({ dispatch, commit }) {
        try {
            const resp = await axios.get(SYNONYMS_FIELDS);
            const data = resp.data;

            if (data?.synonymsFields) {

                commit("SET_FIELDS", [...resp.data.synonymsFields]);

            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "Error to get fields", status: "error" });
        }
    },
    async deleteSynonymFieldByTerm({ dispatch }, dataFields) {
        try {
            const resp = await axios.post(SYNONYMS_FIELDS_DELETE_TERM, dataFields);
            const data = resp.data;

            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "error to delete synonym", status: "error" });
        } finally {
            dispatch("getSynonyms");
        }
    },
};
const mutations = {
    SET_SYNONYMS(state, synonyms) {
        state.synonyms = synonyms;
    },
    SET_TERMS(state, terms) {
        state.terms = terms;
    },
    SET_FIELDS(state, fields) {
        state.fields = fields;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};