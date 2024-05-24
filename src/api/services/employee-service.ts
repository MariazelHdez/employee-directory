import axios from "axios";
import _ from 'lodash';
import { EmployeeTable } from '../routes/interface';
import * as dotenv from "dotenv";
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
export const EMPLOYEEJSON = process.env.EMPLOYEEJSON;

export class EmployeeService {

    async getEmployee(paramDepartment: string, paramFullName: string)  {
    var employeeArr: any[] = Array();
    await axios.get(String(EMPLOYEEJSON), { params: { department: paramDepartment, keyword: paramFullName } })
        .then(async (response: any) => {
          var resultEmployees = response.data.employees;
          let employee_key = 0;
            resultEmployees.forEach(function (element: any) {
                var division_url = element.division !== null ? element.division.replace(/\s/g, "-") : '';
                interface EmployeeDetail extends EmployeeTable {
                    unit: String
                    fax_office: String
                    postal_code: String
                    mailcode: string
                    full_name_url: string
                    center: any
                    latitude: Number
                    longitude: Number
                }

                var employee: EmployeeDetail = {
                    'full_name': element.full_name.replace(".", " "),
                    'formatted_name': element.first_name + ' ' + element.last_name,
                    'department': element.department,
                    'division': element.division,
                    'branch': element.branch,
                    'unit': element.unit,
                    'title': element.title,
                    'weight': element.weight,
                    'email': element.email.toLowerCase(),
                    'phone_office': element.phone_office,
                    'fax_office': element.fax_office,
                    'address': element.address,
                    'community': element.community,
                    'postal_code': element.postal_code,
                    'mailcode': element.mailcode,
                    'manager': element.manager !== '' ? element.manager?.replace(".", " ") : '-',
                    'division_url': division_url,
                    'full_name_url': element.full_name,
                    'latitude': element.latitude,
                    'longitude': element.longitude,
                    'value': 0,
                    'center': { "lat": 0, "lng": 0 },
                    'id':employee_key,
                };
                employee_key++;
                employeeArr.push(employee);
            });
            return employeeArr;

        })
        .catch((error: any) => {
            console.log(error);
            
        });
        return employeeArr; 
  }

}
