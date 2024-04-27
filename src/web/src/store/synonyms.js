import axios from "axios";
import { SYNONYMS,
        TERMS,
        TERMS_DELETE,
        SYNONYMS_DELETE,
        SYNONYMS_FIELDS,
        SYNONYMS_FIELDS_DELETE_TERM,
        SYNONYMS_DELETE_TERM,
        SYNONYMS_FIELDS_DELETE_VALUES,
        SYNONYMS_DELETE_VALUES,
        SYNONYMS_FIELDS_DELETE_BATCH } from "../urls";
import { StaffDirectoryUrl } from "../config";

const state = {
    synonyms: [],
    terms: [],
    fields: [],
    listSynonyms: [],
};
const getters = {
    synonyms: state => state.synonyms,
    terms: state => state.terms,
    fields: state => state.fields,
    listSynonyms: state => state.listSynonyms,
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
                        if (!grouped[key].field_id_array.includes(item.field_id)) {
                            grouped[key].field_id_array.push(item.field_id);
                        }
                        if (!grouped[key].synonyms_fields_id_array.includes(item.synonyms_fields_id)) {
                            grouped[key].synonyms_fields_id_array.push(item.synonyms_fields_id);
                        }
                    } else {
                        grouped[key] = { ...item, field_id_array: [item.field_id], synonyms_fields_id_array: [item.synonyms_fields_id] };
                    }
                });

                const groupedSynonyms = Object.values(grouped);

                const mergedFields = Object.values(groupedSynonyms.reduce((acc, { field_id_array, synonyms_fields_id_array, id, synonym, term, term_id }) => {
                    if (!acc[term_id]) {
                        acc[term_id] = { field_id_array, synonyms_fields_id_array, id: [], synonym: "", term, term_id };
                    }
                    acc[term_id].id.push(id);
                    acc[term_id].synonym += (acc[term_id].synonym ? ", " : "") + synonym;
                    return acc;
                }, {}));

                const synonymsArray = mergedFields.map(item => ({
                    ...item,
                    synonym_array: item.synonym.split(', '),
                    field_id_array: item.field_id_array.join(', ').split(', '),
                    synonyms_fields_id_array: item.synonyms_fields_id_array
                }));

                commit("SET_SYNONYMS", synonymsArray);
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "Error to get synonyms", status: "error" });
        }
    },
    async getSynonymsList({ dispatch, commit }) {
        try {
            const resp = await axios.get(SYNONYMS);
            const data = resp.data;

            if (data?.synonyms) {
                commit("SET_SYNONYMS_LIST", [...resp.data.synonyms]);
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
    async deleteSynonymFieldByTerm({ dispatch }, termId) {
        try {
            const resp = await axios.delete(`${SYNONYMS_FIELDS_DELETE_TERM}/${termId}`);
            const data = resp.data;

            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "error to delete synonym", status: "error" });
        }
    },
    async deleteSynonymFieldByValues({ dispatch }, dataFields) {
        try {
            const resp = await axios.post(SYNONYMS_FIELDS_DELETE_VALUES, dataFields);
            const data = resp.data;

            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "error to delete synonym field", status: "error" });
        } finally {
            dispatch("getSynonyms");

        }
    },
    async deleteSynonymByTerm({ dispatch }, termId) {
        try {
            const resp = await axios.delete(`${SYNONYMS_DELETE_TERM}/${termId}`);
            const data = resp.data;

            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "error to delete synonym", status: "error" });
        }
    },
    async deleteSynonymByValues({ dispatch }, dataFields) {
        try {
            const resp = await axios.post(SYNONYMS_DELETE_VALUES, dataFields);
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
    async deleteFieldsBatch({ dispatch }, fieldIds) {
        try {
            const resp = await axios.post(SYNONYMS_FIELDS_DELETE_BATCH, fieldIds);
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
    async deleteTerm({ dispatch }, termId) {
        try {
            const resp = await axios.delete(`${TERMS_DELETE}/${termId}`,);
            const data = resp.data;

            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "error to delete term", status: "error" });
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
    SET_SYNONYMS_LIST(state, listSynonyms) {
        state.listSynonyms = listSynonyms;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};