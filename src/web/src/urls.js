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
export const SYNONYMS_UPDATE = `${config.StaffDirectoryUrl}/UpdateSynonym/`;
export const SYNONYMS_DELETE = `${config.StaffDirectoryUrl}/DeleteSynonym/`;

// TERMS
export const TERMS = `${config.StaffDirectoryUrl}/Terms`;
export const TERMS_CREATE = `${config.StaffDirectoryUrl}/CreateTerm`;

// SYNONYMS FIELDS
export const SYNONYMS_FIELDS = `${config.StaffDirectoryUrl}/SynonymsFields`;
export const SYNONYMS_FIELDS_CREATE = `${config.StaffDirectoryUrl}/CreateSynonymsFields`;