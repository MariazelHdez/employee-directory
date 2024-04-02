import * as config from "./config";

export const EMPLOYEES_URL = `${config.apiBaseUrl}/api/employees/`;
export const FIND_EMPLOYEE_URL = `${config.apiBaseUrl}/api/employees/find-employee/`;

// AUTH URLS
export const AUTH_CHECK_URL = `${config.apiBaseUrl}/api/auth/is-authenticated`;
export const LOGIN_URL = `${config.apiBaseUrl}/api/auth/login`;
export const LOGOUT_URL = `${config.apiBaseUrl}/api/auth/close-session`;

// STAFF DIRECTORY
export const SORT_POSITIONS = `${config.StaffDirectoryUrl}/SortPositions`;