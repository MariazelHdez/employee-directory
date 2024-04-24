import express, { Request, Response } from "express";
import axios from "axios";
import { body, param } from "express-validator";
import _ from 'lodash';
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import { EmployeeTable } from './interface';
import { EmployeeService } from "../services";

const sanitizeHtml = require('sanitize-html');
const employeeService = new EmployeeService();

let path;
switch (process.env.NODE_ENV) {
    case "test":
      path = `.env.test`;
      break;
    case "production":
      path = `.env`;
      break;
    default:
      path = `.env.development`;
  }
dotenv.config({ path: path });

export const ESRI_KEY = process.env.ESRI_KEY;
export const employeesRouter = express.Router();
export const DIVISIONSJSON = process.env.DIVISIONSJSON;
export const EMPLOYEEJSON = process.env.EMPLOYEEJSON;
export const REMOVE_DEPARTMENTS = process.env.REMOVE_DEPARTMENTS;
const remove_dept = _.split(REMOVE_DEPARTMENTS, ',').map((item) => _.trim(item));

employeesRouter.post("/", async (req: Request, res: Response) => {
    
    var employeesByDept = Object();
    axios.get(String(DIVISIONSJSON))
        .then((response: any) => {


            var resultEmployees = response.data.divisions;
            var departments = Array();
            resultEmployees.forEach(function (element: any) {
                if (!remove_dept.includes(element.department)) {
                    departments.push(element.department);
                }
            });

            var departmentsUq = departments.filter(function (elem, index, self) {
                return index === self.indexOf(elem);
            });

            resultEmployees.forEach(function (element: any) {
                departments.push(element.department);
            });

            departmentsUq.forEach((elementDept: any) => {
                var keyDept = elementDept;
                var arrayElements = Array();
                var arrayElementssUq = Array();
                var keyModified = keyDept.replace(/\s/g, "-");

                resultEmployees.forEach(function (elementEm: any) {
                    if (keyDept == elementEm.department && elementEm.division !== null) {
                        if (!arrayElementssUq.includes(elementEm.division)) {
                            elementEm.departmentUrl = keyModified;
                            elementEm.divisionUrl = elementEm.division.replace(/\s/g, "-");
                            arrayElements.push(elementEm);
                            arrayElementssUq.push(elementEm.division);
                        }
                    }
                });

                employeesByDept[elementDept] = arrayElements;
            });
            res.send({ data: employeesByDept, meta: { count: 0 } });

        })
        .catch((error: any) => {
            console.log(error);
        });
});

employeesRouter.post("/find-employee/search/keyword=:full_name?&department=:department?", [param("full_name", "department").notEmpty()], async (req: Request, res: Response) => {

    var employeesByDept: any[] = Array();
    let groupBy = (req.body.groupBy) || 0;
    const itemsPerPage = (req.body.itemsPerPage);
    var find = '-';
    var reg = new RegExp(find, 'g');
    let paramDepartment = (req.params.department).replace(/\--/g, '-/-')
    
    let paramFullName = (req.params.full_name);//.replace(".", " ")
    console.log("🚀 ~ employeesRouter.post ~ paramFullName:", paramFullName)

    if (paramFullName === 'any-employee') {
        paramFullName = ''
    } else {
        paramFullName = paramFullName
    }

    if (paramDepartment === 'any-department') {
        paramDepartment = ''
    } else {
        paramDepartment = (req.params.department.replace(reg, ' '))
    }
    axios.get(String(EMPLOYEEJSON), { params: { department: paramDepartment, keyword: paramFullName } })
        .then((response: any) => {
            var resultEmployees = response.data.employees;
            let employee_key = 0;
            resultEmployees.forEach(function (element: any) {
                
                
                var division_url = element.division !== null ? element.division.replace(/\s/g, '-') : '';
                var employee: EmployeeTable = {
                    'full_name': element.full_name.replace(".", " "),
                    'formatted_name': element.first_name + ' ' + element.last_name,
                    'title': element.title !== '' ? element.title : '-',
                    'division': element.division !== null ? element.division : '-',
                    'branch': element.branch !== null ? element.branch : '',
                    'weight': element.weight,
                    'email': element.email.toLowerCase(),
                    'phone_office': element.phone_office !== '' ? element.phone_office : '-',
                    'department': element.department,
                    'manager': element.manager !== '' ? element.manager?.replace(".", " ") : '-',
                    'division_url': division_url,
                    'full_name_url': element.full_name,
                    'value': 0,
                    'address': element.address,
                    'community': element.community,
                    'id': employee_key
                };

                employee_key++;
                employeesByDept.push(employee);

            });

            employeesByDept = _.orderBy(employeesByDept, [employee => employee.full_name], ['asc'])

            let departments = _.groupBy(employeesByDept, item => `${item.department}`);

            for (const [key, value] of Object.entries(departments)) {
                const groupByDivision: any = _.groupBy(departments[key], (department) => department.division);

                departments[key] = groupByDivision;

            }

            let finalResult: any
            switch (groupBy) {
                case 0:
                    finalResult = employeesByDept
                    break;
                case 1:
                    finalResult = departments
                    break;
                case 2:
                    finalResult = _.groupBy(employeesByDept, item => `${item.address}, ${item.community}`);
                    break;
                case 3:
                    finalResult = _.groupBy(employeesByDept, item => `${item.title}`);
                    break;
            }

           // console.log("🚀 ~ .then ~ finalResult:", finalResult)
            res.send({ data: finalResult, meta: { count: employeesByDept.length } });

        })
        .catch((error: any) => {
            console.log(error);
        });
});

employeesRouter.post("/find-employee/employee-detail/:department/:full_name", [param("full_name", "department").notEmpty()], async (req: Request, res: Response) => {

    var employeeArr: any[] = Array();
    var find = '-';
    var reg = new RegExp(find, 'g');

    let paramDepartment = (req.params.department).replace(/\--/g, '-/-').replace(reg, ' ')
    let paramFullName = (req.params.full_name)
    var resultEmployees = await employeeService.getEmployee(paramDepartment, paramFullName);
    if(resultEmployees){
            if (resultEmployees.length === 0) {
                return res.send({ data: true })
            }

            if (resultEmployees[0] && resultEmployees[0].community && resultEmployees[0].address !== '' || null) {
                if (resultEmployees[0].latitude !== null) {
                    resultEmployees[0].center.lat = resultEmployees[0].latitude
                    resultEmployees[0].center.lng = resultEmployees[0].longitude
                } else {

                    await axios.get(`https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?address={${resultEmployees[0].community},${resultEmployees[0].address}}&outFields={}&f=json&token=${ESRI_KEY}`)
                        .then((response: any) => {
                            
                            if(response.data.candidates){
                                const center = response.data.candidates[0].location
                                resultEmployees[0].center.lat = center.y;
                                resultEmployees[0].center.lng = center.x;
                            }
                            else{
                                console.log('Error in ESRI:' + JSON.stringify(response.data));
                                resultEmployees[0].center = null;
                            }
                        }).catch((error: any) => {
                            console.log(error)
                        })
                }
            } else resultEmployees[0].center = null

            let managerName: any
            var managerFilter = [];
            if (resultEmployees[0] && resultEmployees[0].manager){
                managerName = resultEmployees[0].manager;
                if(managerName){
                    managerFilter = await employeeService.getEmployee(paramDepartment, managerName);
                }
            }
            res.send({ data: resultEmployees, meta: { manager: managerFilter } });
      
    }else{
        return res.send({ data: true });
    }
});

employeesRouter.post("/find-employee/:department/:division/:branch?", [param("department", "division"), param('branch').notEmpty()], async (req: Request, res: Response) => {
    let groupBy = (req.body.groupBy) || 0;
    var employeesByDept: any[] = Array();
    var managersMissing: any[] = Array();
    var _ = require("lodash");
   
    var find = '-';
    var reg = new RegExp(find, 'g');

    let paramDepartment = (req.params.department.replace(/\--/g, '-/-').replace(reg, ' '))
    let paramDivision = (req.params.division)
    let paramBranch = (req.params.branch)

    var notDivision = paramDivision === 'not-division';
    var onlyDept = paramDivision === 'only-department' && paramBranch === 'only-department'

    if (paramDivision === 'not-division') {
        paramDivision = ''
    } else {
        paramDivision = (req.params.division.replace(reg, ' '))
    }

    var notBranch = paramBranch === 'not-branch';
    if (paramBranch === 'all-branches' || paramBranch === 'all branches') {
        paramBranch = ''
    } else {
        paramBranch = req.params.branch.replace(reg, ' ')
    }

    var params_var = {
        department: paramDepartment,
        ...(paramDivision != '' &&  !onlyDept && { division: paramDivision }),
    };
    interface Employee {
        full_name: string;
        formatted_name: string;
        title: string;
        division: string;
        branch: string;
        weight: number;
        email: string;
        phone_office: string;
        department: string;
        manager: string;
        division_url: string;
        full_name_url: string;
        value: number;
        address: string;
        community: string;
        id: number;
        level: number;
        subordinates?: Employee[];
    }
    axios.get(String(EMPLOYEEJSON), { params: params_var })
        .then((response: any) => {

            var resultEmployees = response.data.employees;
            // let employee_key = 0;
            // resultEmployees.forEach(function (element: any) {
            //     var division_url = element.division !== null ? element.division.replace(/\s/g, '-') : '';
            //     var employee: EmployeeTable = {
            //         'full_name': element.full_name.replace(".", " "),
            //         'formatted_name': element.first_name + ' ' + element.last_name,
            //         'title': element.title !== '' ? element.title : '-',
            //         'division': element.division !== null ? element.division : '-',
            //         'branch': element.branch !== null ? element.branch : '',
            //         'weight': element.weight,
            //         'email': element.email.toLowerCase(),
            //         'phone_office': element.phone_office !== '' ? element.phone_office : '-',
            //         'department': element.department,
            //         'manager': element.manager !== '' ? element.manager?.replace(".", " ") : '-',
            //         'division_url': division_url,
            //         'full_name_url': element.full_name,
            //         'value': 0,
            //         'address': element.address,
            //         'community': element.community,
            //         'id': employee_key,
            //     };
            //     employee_key++;
            //     employeesByDept.push(employee);
            // });
            const employeesByDept = resultEmployees.map((element: any, index: number) => {
                const division_url = element.division ? element.division.replace(/\s/g, '-') : '';
                return {
                    full_name: element.full_name.replace('.', ' '),
                    formatted_name: `${element.first_name} ${element.last_name}`,
                    title: element.title || '-',
                    division: element.division || '-',
                    branch: element.branch || '',
                    weight: element.weight,
                    email: (element.email || '').toLowerCase(),
                    phone_office: element.phone_office || '-',
                    department: element.department,
                    manager: element.manager ? element.manager.replace('.', ' ') : '-',
                    division_url,
                    full_name_url: element.full_name,
                    value: 0,
                    address: element.address,
                    community: element.community,
                    id: index,
                };
            });
            
            let employeesByDivision = employeesByDept

            if (notBranch) {
                employeesByDivision = employeesByDivision.filter((item:any) => { return item.branch === '-' || _.isUndefined(item.branch) || _.isEmpty(item.branch) })
            } else if (paramBranch !== '' && !onlyDept) {
                employeesByDivision = employeesByDivision.filter((item:any) => { return item.branch.indexOf(paramBranch) >= 0 })
            }
            //Get the number of employees displayed in the grid.
            let divLength = employeesByDivision.length

            //Get all the Managers' name
            var managersNameByDivision = _.uniq(_.map(employeesByDivision, 'manager'));      

            //Get all the employees' name
            var namesByDivision = _.map(employeesByDivision, 'full_name');
            
            //Check if all managers exist in the consulted department/branch.
            var namesMissing = _.difference(managersNameByDivision, namesByDivision);

            if (!_.isEmpty(namesMissing)) {
                managersMissing = namesMissing.map(function (name: string) {
                    let managerMissing = _.find(employeesByDivision, { full_name: name });
                    if (!_.isUndefined(managerMissing)) {
                        managerMissing.manager = managerMissing.full_name;
                        return managerMissing;
                    }
                });
            }

            managersMissing = _.compact(managersMissing);

            //Add the managers missing in the array
            if (!_.isEmpty(employeesByDivision) && !_.isEmpty(managersMissing)) {
                employeesByDivision = _.union(employeesByDivision, managersMissing);
            }

            //Get all the Managers' name
            //managersNameByDivision = _.uniq(_.map(employeesByDivision, 'manager'));

            employeesByDivision = _.orderBy(employeesByDivision, ['id'], ['asc']);


            //Get all the employees' name
            //namesByDivision = _.map(employeesByDivision, 'full_name');
            //Check if all managers exist in the consulted department/branch.
            //namesMissing = _.difference(managersNameByDivision, namesByDivision);

            //Change the manager's name if the manager is not in the same department, remove from the hierarchy
            employeesByDivision = employeesByDivision.map(function (item: any) {
                if (_.indexOf(namesMissing, item.manager) >= 0) {
                    item.manager = item.full_name;
                }
                return item;
            });
            //Obtain all objects from managers
            let managersByDivision = employeesByDivision.filter((item:any) => {
                if (_.isEmpty(item.manager) || item.manager === '-' || item.manager === item.full_name) {
                    item.level = 0;
                    item.id_manager = item.id;
                    return true;
                }
            });

            //Obtain all employee objects not in Manager's array.
            let employeesByManager = employeesByDivision.filter(function (e:any) {
                return !_.find(managersByDivision, { full_name: e.full_name })
            })


        //     const getEmployeesByManager = (employeesArray: any, currentManager: any, level: any) => {
        //         const currentEmployees = employeesArray.filter(
        //             (employee: any) => employee.manager === currentManager.full_name
        //         );
        //         if (!currentEmployees.length) {
        //             return [currentManager];
        //         }
        //         let employeesList: any = [];
        //         const currentLevel = level + 1;
        //         employeesList = currentEmployees.map(function (item: any) {
        //             item.level = currentLevel;
        //             item.value += currentManager.value
        //             item.id_manager = currentManager.id;
        //             return item;
        //         });
        //         for (const employee__ of employeesList) {
        //             const employees = getEmployeesByManager(employeesArray, employee__, currentLevel);
        //             employeesList = [...employeesList, employees];
        //         }
        //         return [currentManager, ...employeesList.flat()];
        //     }

        //     let result: any = [];
        //     let levelOfDepth: any = 0;
        //     let count_manager_current: any = 0;
        //     for (const manager of managersByDivision) {
        //         levelOfDepth = _.isUndefined(manager.level) ? 0 : manager.level;
        //         count_manager_current = _.isUndefined(manager.count_manager) ? 0 : manager.count_manager;
        //         result = [...result, ...getEmployeesByManager(employeesByManager, manager, levelOfDepth)];
        //     }

        //     const groupedByLevel = _.groupBy(result, 'level');

        //     function getHierarchy(level:any, idManager:any) {
        //         const subordinates = groupedByLevel[level + 1]
        //         ?.filter((item:any) => item.id_manager === idManager)
        //             ?.map((item: any) => ({
        //             full_name: item.full_name.replace(".", " "),
        //             formatted_name: item.formatted_name,
        //             title: item.title !== '' ? item.title : '-',
        //             division: item.division !== null ? item.division : '-',
        //             branch: item.branch !== null ? item.branch : '',
        //             weight: item.weight,
        //             email: item.email.toLowerCase(),
        //             phone_office: item.phone_office !== '' ? item.phone_office : '-',
        //             department: item.department,
        //             manager: item.manager !== '' ? item.manager?.replace(".", " ") : '-',
        //             division_url: item.division_url,
        //             full_name_url: item.full_name,
        //             value: 0,
        //             address: item.address,
        //             community: item.community,
        //             id: item.id,
        //             level: item.level,
        //             subordinates: getHierarchy(item.level, item.id)
        //         }));
        //         return subordinates || [];
        //     }
        //     const hierarchy = groupedByLevel[0].map((item:any) => ({
        //         full_name: item.full_name.replace(".", " "),
        //         formatted_name: item.formatted_name,
        //         title: item.title !== '' ? item.title : '-',
        //         division: item.division !== null ? item.division : '-',
        //         branch: item.branch !== null ? item.branch : '',
        //         weight: item.weight,
        //         email: item.email.toLowerCase(),
        //         phone_office: item.phone_office !== '' ? item.phone_office : '-',
        //         department: item.department,
        //         manager: item.manager !== '' ? item.manager?.replace(".", " ") : '-',
        //         division_url: item.division_url,
        //         full_name_url: item.full_name,
        //         value: 0,
        //         address: item.address,
        //         community: item.community,
        //         id: item.id,
        //         level: item.level,
        //     subordinates: getHierarchy(item.level, item.id)
        //     }));
            
        // function printHierarchy(hierarchy:any, level = 1) {
        //     hierarchy.forEach((item: any) => {
        //         let employee = item;
        //         // delete employee.subordinates;
        //         if (!_.some(result_2, ['full_name', item.full_name])) {
        //             result_2.push({    full_name: employee.full_name.replace(".", " "),
        //                 formatted_name: employee.formatted_name,
        //                 title: employee.title !== '' ? item.title : '-',
        //                 division: employee.division !== null ? item.division : '-',
        //                 branch: employee.branch !== null ? item.branch : '',
        //                 weight: employee.weight,
        //                 email: employee.email.toLowerCase(),
        //                 phone_office: employee.phone_office !== '' ? item.phone_office : '-',
        //                 department: employee.department,
        //                 manager: employee.manager !== '' ? item.manager?.replace(".", " ") : '-',
        //                 division_url: employee.division_url,
        //                 full_name_url: employee.full_name_url,
        //                 value: 0,
        //                 address: employee.address,
        //                 community: employee.community,
        //                 id: employee.id,
        //                 level: employee.level
        //             });
        //         }
        //         // console.log(`${'  '.repeat(level - 1)}${level}. ${item.full_name}`);

        //         printHierarchy(item.subordinates, level + 1);
        //     });
        // }
        // let result_2:any = [];
        // printHierarchy(hierarchy);
        const result_2: Employee[] = [];

        function getEmployeesByManager(employees: Employee[], manager: Employee, level: number): Employee[] {
            const currentEmployees = employees.filter((employee) => employee.manager === manager.full_name);
            if (currentEmployees.length === 0) {
                return [manager];
            }
            const employeesList = currentEmployees.map((employee) => ({
                ...employee,
                level: level + 1,
                value: employee.value + manager.value,
                id_manager: manager.id,
                subordinates: getEmployeesByManager(employees, employee, level + 1),
            }));
            return [manager, ...employeesList.flat()];
        }
        
        function buildHierarchy(item: Employee): Employee {
            return {
                ...item,
                full_name: item.full_name.replace(".", " "),
                title: item.title || '-',
                division: item.division || '-',
                branch: item.branch || '',
                phone_office: item.phone_office || '-',
                manager: item.manager || '-',
                division_url: item.division_url,
                full_name_url: item.full_name_url,
                value: 0,
                address: item.address,
                community: item.community,
                subordinates: item.subordinates?.map(buildHierarchy) || [],
            };
        }
        
        function printHierarchy(hierarchy: Employee[], level = 1): void {
            hierarchy.forEach((item) => {
                const employee = buildHierarchy(item);
                if (!result_2.some((e) => e.full_name === item.full_name)) {
                    result_2.push(employee);
                }
                // console.log(`${'  '.repeat(level - 1)}${level}. ${item.full_name}`);
                printHierarchy(item.subordinates || [], level + 1);
            });
        }
        
        managersByDivision = employeesByDivision.filter((item:any) => !item.manager || item.manager === '-' || item.manager === item.full_name);
        const hierarchy = managersByDivision.map((manager:any) => ({
            ...manager,
            subordinates: getEmployeesByManager(employeesByManager, manager, manager.level || 0),
        }));
            printHierarchy(hierarchy);
            const finalResult = Array.from(new Set(result_2.map((item) => JSON.stringify(item)))).map((item) => JSON.parse(item));

            //let resultRev = result_2.slice();
            //let finalResult = result_2.filter((elem:any, index:any) => result_2.indexOf(elem) === index);

            // let resultFilttered = result_2.filter(function (elem: any, index: any, self: any) {
            //     return index == self.indexOf(elem);
            // });

            //let finalResult = resultFilttered.slice();
            //finalResult = finalResult.filter(function (elem: any, index: any, self: any) {
                //return index == self.indexOf(elem);
            //});

            let endResult: any
            //Return the grouped array 
            switch (groupBy) {
                case 0:
                    endResult = finalResult
                    break;
                case 1:
                    endResult = _.groupBy(finalResult, function (item: any) { return `${item.address}, ${item.community}` });
                    break;
                case 2:
                    endResult = _.groupBy(finalResult, function (item: any) { return `${item.title}` });
                    break;
            }

            res.send({ data: endResult, meta: { branchCount: finalResult.length, divisionCount:  finalResult.length } });
        })
        .catch((error: any) => {
            console.log(error);
        });
});

employeesRouter.post("/find-employee/:department/", [param("department").notEmpty()], async (req: Request, res: Response) => {

    var find = '-';
    var reg = new RegExp(find, 'g');
    var _ = require("lodash");
    let paramDepartment = (req.params.department.replace(/\--/g, '-/-').replace(reg, ' '))
    let error = false
    
    axios.get(String(DIVISIONSJSON), { params: { department: paramDepartment } })
        .then(async (response: any) => {
            
            if (response.data.divisions.length === 0) {
                    return res.send({ meta: { error: true } })
            } else {
                axios.get(String(EMPLOYEEJSON), { params: { department: paramDepartment } })
                    .then((response: any) => {

                        var resultEmployees = response.data.employees;
                        if (resultEmployees.length == 0) {
                            return res.send({ meta: { count: 0, notFound: true } });
                        }

                        let employeesByDeptSorted = _.sortBy(resultEmployees, ['null', 'division', 'branch'], ['desc', 'asc'])

                        resultEmployees.forEach((element: any) => {
                            if (element.division === null) {
                                element.division = 'Employees who are not assigned a division'
                            }
                            if (element.branch === null) {
                                element.branch = 'Employees who are not assigned a branch'
                            }
                        })

                        let division: any = _.groupBy(employeesByDeptSorted, (item: { division: any; }) => `${item.division}`);

                        for (const [key, value] of Object.entries(division)) {
                            const groupByDivision: any = _.groupBy(division[key], (division: any) => division.branch);

                            division[key] = groupByDivision;

                        }

                        return res.send({ data: division, meta: { count: 0 } });

                    })
                    .catch((error: any) => {
                        console.log(error);
                    });

            }

        }).catch((error: any) => {
            console.log(error);
        });

    axios.get(String(EMPLOYEEJSON), { params: { department: paramDepartment } })
        .then((response: any) => {

            var resultEmployees = response.data.employees;

            if (resultEmployees.length == 0) {
                res.send({ meta: { count: 0, notFound: true } });
                return
            }

            let employeesByDeptSorted = _.sortBy(resultEmployees, ['null', 'division', 'branch'], ['desc', 'asc'])

            resultEmployees.forEach((element: any) => {
                if (element.division === null) {
                    element.division = 'Employees who are not assigned a division'
                }
                if (element.branch === null) {
                    element.branch = 'Employees who are not assigned a branch'
                }
            })

            let division: any = _.groupBy(employeesByDeptSorted, (item: { division: any; }) => `${item.division}`);

            for (const [key, value] of Object.entries(division)) {
                const groupByDivision: any = _.groupBy(division[key], (division: any) => division.branch);

                division[key] = groupByDivision;

            }

            res.send({ data: division, meta: { count: 0, error } });

        })
        .catch((error: any) => {
            console.log(error);
        });
});

employeesRouter.post("/DivisionsCard", async (req: Request, res: Response) => {

    var find = '-';
    var reg = new RegExp(find, 'g');
    const paramDepartment = req.body.department.replace(/\--/g, '-/-')
    axios.get(String(EMPLOYEEJSON), { params: { department: paramDepartment } })
        .then((response: any) => {

            var resultEmployees = response.data.employees;
            let employeesByDeptSorted = _.sortBy(resultEmployees, ['null', 'division', 'branch'], ['desc', 'asc'])

            resultEmployees.forEach((element: any) => {
                if (element.division === null) {
                    element.division = 'Employees who are not assigned a division'
                }
                if (element.branch === null) {
                    element.branch = 'Employees who are not assigned a branch'
                }
            })

            let division: any = _.groupBy(employeesByDeptSorted, (item: { division: any; }) => `${item.division}`);


            for (const [key, value] of Object.entries(division)) {
                const groupByDivision: any = _.groupBy(division[key], (division: any) => division.branch);

                division[key] = groupByDivision;

            }

            res.send({ data: division, meta: { count: 0 } });

        })
        .catch((error: any) => {
            console.log(error);
        });
});

employeesRouter.post("/SearchBar", async (req: Request, res: Response) => {

    axios.get(String(DIVISIONSJSON))
        .then((response: any) => {

            var resultEmployees = response.data.divisions;
            var departments = Array();
            resultEmployees.forEach(function (element: any) {
                departments.push(element.department);
            });

            var departmentsUq = departments.filter(function (elem, index, self) {
                return index === self.indexOf(elem);
            });
            res.send({ data: departmentsUq, meta: { count: 0 } });

        })
        .catch((error: any) => {
            console.log(error);
        });
});

employeesRouter.post("/feedbackForm", async (req: Request, res: Response) => {
    try {
        //Content from client
        let feedbackContentSubject = sanitizeHtml(req.body.emailSubject);
        let feedbackFormContent = sanitizeHtml(req.body.emailBody);
        let emailDate = new Date();;
        let pageUrl = sanitizeHtml(req.body.pageUrl)

        const bodyContentFormatted =
            `<p><strong>Submited on:</strong> ${emailDate.toLocaleString()}</p>
        <p><strong>${feedbackContentSubject} :</strong> ${feedbackFormContent}</p> 
        <p<strong>URL:</strong> <a href="${pageUrl}">${pageUrl}</a></p>`;

        const sanitizedBody = sanitizeHtml(bodyContentFormatted)
        const emailHost = process.env.SMTP_SERVER;
        const emailPort: string = process.env.SMTP_PORT!;
        const emailFrom = process.env.EMAIL_FROM;
        const nameFrom = process.env.NAME_FROM;
        const subject = process.env.EMAIL_SUBJECT;
        const selfSignedConfig = {
            host: emailHost,
            port: parseInt(emailPort)
        };
        var transporter = nodemailer.createTransport(selfSignedConfig);
        const info = await transporter.sendMail({
            from: nameFrom + ' ' + emailFrom,
            to: process.env.EMAIL_TO,
            subject: subject,
            html: sanitizedBody,
        });
        res.send({ data: 'Sent' });
    } catch (error) {
        console.log(error);
    }
});
