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

    axios.get(String(EMPLOYEEJSON), { params: params_var })
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
                    'id': employee_key,
                };
                employee_key++;
                employeesByDept.push(employee);
            });
            
            let employeesByDivision = employeesByDept

            if (notBranch) {
                employeesByDivision = employeesByDivision.filter(item => { return item.branch === '-' || _.isUndefined(item.branch) || _.isEmpty(item.branch) })
            } else if (paramBranch !== '' && !onlyDept) {
                employeesByDivision = employeesByDivision.filter(item => { return item.branch.indexOf(paramBranch) >= 0 })
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
            managersNameByDivision = _.uniq(_.map(employeesByDivision, 'manager'));

            employeesByDivision = _.orderBy(employeesByDivision, ['id'], ['asc']);


            //Get all the employees' name
            namesByDivision = _.map(employeesByDivision, 'full_name');
            //Check if all managers exist in the consulted department/branch.
            namesMissing = _.difference(managersNameByDivision, namesByDivision);

            //Change the manager's name if the manager is not in the same department, remove from the hierarchy
            employeesByDivision = employeesByDivision.map(function (item: any) {
                if (_.indexOf(namesMissing, item.manager) >= 0) {
                    item.manager = item.full_name;
                }
                return item;
            });
             let count_manager = 0
            //Obtain all objects from managers
            let managersByDivision = employeesByDivision.filter(item => {
                if (_.isEmpty(item.manager) || item.manager === '-' || item.manager === item.full_name) {
                    item.level = 0;
                    item.id_manager = item.id;
                    count_manager++;
                    return true;
                }
            });

            //Obtain all employee objects not in Manager's array.
            let employeesByManager = employeesByDivision.filter(function (e) {
                return !_.find(managersByDivision, { full_name: e.full_name })
            })


            const getEmployeesByManager = (employeesArray: any, currentManager: any, level: any, count_manager_current: any) => {
                const currentEmployees = employeesArray.filter(
                    (employee: any) => employee.manager === currentManager.full_name
                );
                if (!currentEmployees.length) {
                    return [currentManager];
                }
                let employeesList: any = [];
                const currentLevel = level + 1;
                employeesList = currentEmployees.map(function (item: any) {
                    item.level = currentLevel;
                    item.value += currentManager.value
                    item.id_manager = currentManager.id;
                    return item;
                });
                count_manager_current= count_manager_current + 1;

                for (const employee__ of employeesList) {
                    const employees = getEmployeesByManager(employeesArray, employee__, currentLevel,count_manager_current);
                    employeesList = [...employeesList, employees];
                }
                return [currentManager, ...employeesList.flat()];
            }

            let result: any = [];
            let levelOfDepth: any = 0;
            let count_manager_current: any = 0;
            for (const manager of managersByDivision) {
                levelOfDepth = _.isUndefined(manager.level) ? 0 : manager.level;
                count_manager_current = _.isUndefined(manager.count_manager) ? 0 : manager.count_manager;
                result = [...result, ...getEmployeesByManager(employeesByManager, manager, levelOfDepth, count_manager_current)];
            }



            //order 
            // Agrupar los elementos por su nivel (level)
const groupedByLevel = _.groupBy(result, 'level');

// Función recursiva para obtener la estructura de jerarquía
function getHierarchy(level:any, idManager:any) {
  
  
    const subordinates = groupedByLevel[level + 1]
    ?.filter((item:any) => item.id_manager === idManager)
        ?.map((item: any) => ({
        full_name: item.full_name.replace(".", " "),
        formatted_name: item.formatted_name,
        title: item.title !== '' ? item.title : '-',
        division: item.division !== null ? item.division : '-',
        branch: item.branch !== null ? item.branch : '',
        weight: item.weight,
        email: item.email.toLowerCase(),
        phone_office: item.phone_office !== '' ? item.phone_office : '-',
        department: item.department,
        manager: item.manager !== '' ? item.manager?.replace(".", " ") : '-',
        division_url: item.division_url,
        full_name_url: item.full_name,
        value: 0,
        address: item.address,
        community: item.community,
        id: item.id,
        level: item.level,
        subordinates: getHierarchy(item.level, item.id)
    }));



    return subordinates || [];
    


}
// Crear la estructura jerárquica a partir del nivel 0
const hierarchy = groupedByLevel[0].map((item:any) => ({
    full_name: item.full_name.replace(".", " "),
    formatted_name: item.formatted_name,
    title: item.title !== '' ? item.title : '-',
    division: item.division !== null ? item.division : '-',
    branch: item.branch !== null ? item.branch : '',
    weight: item.weight,
    email: item.email.toLowerCase(),
    phone_office: item.phone_office !== '' ? item.phone_office : '-',
    department: item.department,
    manager: item.manager !== '' ? item.manager?.replace(".", " ") : '-',
    division_url: item.division_url,
    full_name_url: item.full_name,
    value: 0,
    address: item.address,
    community: item.community,
    id: item.id,
    level: item.level,
  subordinates: getHierarchy(item.level, item.id)
}));
            
// Función para imprimir la estructura en orden jerárquico
function printHierarchy(hierarchy:any, level = 1) {
    hierarchy.forEach((item: any) => {
        let employee = item;
        // delete employee.subordinates;
        if (!_.some(result_2, ['full_name', item.full_name])) {
            result_2.push({    full_name: employee.full_name.replace(".", " "),
                formatted_name: employee.formatted_name,
                title: employee.title !== '' ? item.title : '-',
                division: employee.division !== null ? item.division : '-',
                branch: employee.branch !== null ? item.branch : '',
                weight: employee.weight,
                email: employee.email.toLowerCase(),
                phone_office: employee.phone_office !== '' ? item.phone_office : '-',
                department: employee.department,
                manager: employee.manager !== '' ? item.manager?.replace(".", " ") : '-',
                division_url: employee.division_url,
                full_name_url: employee.full_name_url,
                value: 0,
                address: employee.address,
                community: employee.community,
                id: employee.id,
                level: employee.level
            });
        }
           // console.log(`${'  '.repeat(level - 1)}${level}. ${item.full_name}`);

        printHierarchy(item.subordinates, level + 1);
  });
}
let result_2:any = [];
            printHierarchy(hierarchy);

            //let resultRev = result_2.slice();
            let resultFilttered = result_2.filter((elem:any, index:any) => result_2.indexOf(elem) === index);

            // let resultFilttered = result_2.filter(function (elem: any, index: any, self: any) {
            //     return index == self.indexOf(elem);
            // });

            let finalResult = resultFilttered.slice();
            finalResult = finalResult.filter(function (elem: any, index: any, self: any) {
                return index == self.indexOf(elem);
            });

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

            res.send({ data: endResult, meta: { branchCount: finalResult.length, divisionCount: divLength } });
        })
        .catch((error: any) => {
            console.log(error);
        });
});


