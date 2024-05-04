import axios from "axios";
import { EMPLOYEE_FIELDS,
		EXCEPTIONS,
		EXCEPTIONS_DELETE_BATCH,
		EXCEPTIONS_UPDATE,
		} from "../urls";
import { StaffDirectoryUrl } from "../config";

const state = {
    employeeFieldsData: [],
	exceptions: [],
	originalExceptions: [],
};
const getters = {
    employeeFieldsData: state => state.employeeFieldsData,
	exceptions: state => state.exceptions,
	originalExceptions: state => state.originalExceptions,
};
const actions = {
    async getExceptions({ dispatch, commit }) {
        try {
            const resp = await axios.get(EXCEPTIONS);
            const data = resp.data;

            if (data?.success) {
				const groupedByEmail = {};

				data.data.forEach(item => {
					const email = item.EmailAddress;

					if (!groupedByEmail[email]) {
						groupedByEmail[email] = {
							EmailAddress: email,
							Description: item.Description,
							IdArray: [],
							FieldIdArray: [],
							FieldNameArray: [],
							Fields: []
						};
					}

					groupedByEmail[email].IdArray.push(item.ID);
					groupedByEmail[email].FieldIdArray.push(item.FieldId);
					groupedByEmail[email].FieldNameArray.push(item.FieldName);
					groupedByEmail[email].Fields.push({
						FieldId: item.FieldId,
						FieldName: item.FieldName,
						ID: item.ID
					});
				});

				const exceptionsArrays = Object.values(groupedByEmail).map(emailGroup => ({
					EmailAddress: emailGroup.EmailAddress,
					Description: emailGroup.Description,
					IdArray: emailGroup.IdArray,
					FieldIdArray: emailGroup.FieldIdArray,
					FieldNameArray: [...new Set(emailGroup.FieldNameArray)],
					Fields: emailGroup.Fields
				}));

				const exceptionsByEmail = {};

				Object.keys(groupedByEmail).forEach(email => {
					exceptionsByEmail[email] = groupedByEmail[email].Records;
				});

                commit("SET_EXCEPTIONS", exceptionsArrays);
				commit("SET_ORIGINAL_EXCEPTIONS", data.data);
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "Error to get exceptions", status: "error" });
        }
    },
	async insertException({ dispatch }, ExceptionData) {
        try {

				const resp = await axios.post(EXCEPTIONS, ExceptionData);
				const data = resp.data;

            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "error to delete synonym", status: "error" });
        } finally {
            dispatch("getExceptions");

        }
    },
	async updateExceptionsBatch({ dispatch }, exceptionId, exceptionFields) {
        try {
            const resp = await axios.patch(`${EXCEPTIONS_UPDATE}/${exceptionId}`, exceptionFields);
            const data = resp.data;

            if (data?.success) {
                dispatch("showSnackBar", { message: data.message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "Error to update Exception", status: "error" });
        } finally {
            dispatch("getExceptions");

        }
    },
    async deleteExceptionBatch({ dispatch }, exceptionIds) {
        try {
            const resp = await axios.post(EXCEPTIONS_DELETE_BATCH, exceptionIds);
            const data = resp.data;

            if (data?.Success) {
                dispatch("showSnackBar", { message: data.Message, status: "success" });
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "Error to delete Exceptions", status: "error" });
        } finally {
            dispatch("getExceptions");

        }
    },
    async getEmployeeFields({ dispatch, commit }) {
        try {
            const resp = await axios.get(EMPLOYEE_FIELDS);
            const data = resp.data;

            if (data?.employeeFields) {
                const clean = resp.data.employeeFields.map(({ concealable, description, weight, ...rest }) => rest);

                const fieldsArray = clean.map(({ id, fieldName, ...rest }) => ({
                    ...rest,
                    value: id,
                    text: fieldName
                }));

                commit("SET_EMPLOYEE_FIELDS", fieldsArray);
            }
        } catch (error) {
            console.log(error);
            dispatch("showSnackBar", { message: "Error to get employee fields", status: "error" });
        }
    },
};
const mutations = {
    SET_EMPLOYEE_FIELDS(state, employeeFieldsData) {
        state.employeeFieldsData = employeeFieldsData;
    },
	SET_EXCEPTIONS(state, exceptions){
		state.exceptions = exceptions;
	},
	SET_ORIGINAL_EXCEPTIONS(state, originalExceptions){
		state.originalExceptions = originalExceptions;
	},
};

export default {
    state,
    getters,
    actions,
    mutations
};