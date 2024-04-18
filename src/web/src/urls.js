import * as config from "./config";

export const EMPLOYEES_URL = `${config.apiBaseUrl}/api/employees/`;
export const FIND_EMPLOYEE_URL = `${config.apiBaseUrl}/api/employees/find-employee/`;

// AUTH URLS
export const AUTH_CHECK_URL = `${config.apiBaseUrl}/api/auth/is-authenticated`;
export const LOGIN_URL = `${config.apiBaseUrl}/api/auth/login`;
export const LOGOUT_URL = `${config.apiBaseUrl}/api/auth/close-session`;

// STAFF DIRECTORY
export const SORT_POSITIONS = `${config.StaffDirectoryUrl}/SortPositions`;

// SYNONYMS
export const SYNONYMS = `${config.StaffDirectoryUrl}/Synonyms`;
export const SYNONYMS_CREATE = `${config.StaffDirectoryUrl}/CreateSynonyms`;
export const SYNONYMS_UPDATE = `${config.StaffDirectoryUrl}/UpdateSynonym`;
export const SYNONYMS_DELETE = `${config.StaffDirectoryUrl}/DeleteSynonym`;
export const SYNONYMS_DELETE_TERM = `${config.StaffDirectoryUrl}/DeleteSynonymsByTerm`;
export const SYNONYMS_DELETE_VALUES = `${config.StaffDirectoryUrl}/DeleteSynonymsByValues`;

// TERMS
export const TERMS = `${config.StaffDirectoryUrl}/Terms`;
export const TERMS_CREATE = `${config.StaffDirectoryUrl}/CreateTerm`;
export const TERMS_UPDATE = `${config.StaffDirectoryUrl}/UpdateTerm`;
export const TERMS_DELETE = `${config.StaffDirectoryUrl}/DeleteTerm`;

// SYNONYMS FIELDS
export const SYNONYMS_FIELDS = `${config.StaffDirectoryUrl}/SynonymsFields`;
export const SYNONYMS_FIELDS_CREATE = `${config.StaffDirectoryUrl}/CreateSynonymsFields`;
export const SYNONYMS_FIELDS_DELETE_TERM = `${config.StaffDirectoryUrl}/DeleteSynonymsFieldsByTerm`;
export const SYNONYMS_FIELDS_DELETE_VALUES = `${config.StaffDirectoryUrl}/DeleteSynonymsFieldsByValues`;

//EMPLOYEES
export const EMPLOYEE_TITLES = `${config.StaffDirectoryUrl}/EmployeeTitles`;