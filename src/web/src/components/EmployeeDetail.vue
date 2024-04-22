<template>
  <div class="employee-details">
    <SearchBarHeader />

    <DepartmentHeader :title="this.department" :image="this.department.toLowerCase()" />

    <v-breadcrumbs class="mt-6 breadcrumbs px-0" :items="breadcrumbsList">
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item :href="item.link">
          {{ item.name }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <div class="text-center loading" v-show="loading">
      <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
    </div>
    <v-container class="px-0">
      <v-row class="mt-16"></v-row>
      <v-row>
        <v-col v-for="item in employee" :key="item.full_name">
          <h2 class="mb-1" style="color: #dc4405 !important; font-size: 34px !important">
            {{ item.formatted_name }}
          </h2>
          <h3 v-if="checkStatus(item.title)" class="mb-8" style="color: #512a44 !important; font-size: 24px !important">
            {{ item.title }}
          </h3>

          <v-card class="my-5 py-1 pb-3 px-5 employee-detail" elevation="1">
            <h2 class="mt-4 mb-2">Organization</h2>
            <v-row>
              <v-col class="mb-0 pt-2 pb-0" cols="12" md="6" v-if="checkStatus(item.department)">
                <h3 class="mb-0">
                  Department:
                  <a :href="generateUrl('department', 'n/a', 'n/a')">{{
                    item.department
                    }}</a>
                </h3>
              </v-col>
              <v-col class="mb-0 pt-2 pb-0" cols="12" md="6" v-if="checkStatus(item.division)">
                <h3 class="mb-0">
                  Division: {{ item.division }}
                </h3>
              </v-col>
              <v-col class="mb-0 pt-2 pb-0" cols="12" md="6" v-if="checkStatus(item.branch)">
                <h3 class="mb-0">
                  Branch:
                  <a :href="generateUrl('branch', item.branch, item.division)">{{
                    item.branch
                    }}</a>
                </h3>
              </v-col>
              <v-col class="mb-0 pt-2 pb-0" cols="12" md="6" v-if="checkStatus(item.unit)">
                <h3 class="mb-0">
                  Unit: <span>{{ item.unit }}</span>
                </h3>
              </v-col>
            </v-row>
          </v-card>
          <v-card class="my-5 py-1 pb-3 px-5 employee-detail" elevation="1"
            v-if="checkStatus(item.phone_office) || checkStatus(item.email) || checkStatus(item.fax_office) ">
            <h2 class="mt-4 mb-2">Contact:</h2>
            <v-row>
              <v-col class="mb-0 pt-2 pb-0" cols="12" md="6" v-if="checkStatus(item.phone_office)">
                <h3 class="mb-0">
                  Phone office:
                  <a :href="getPhone(item.phone_office)">{{
                    item.phone_office
                    }}</a>
                </h3>
              </v-col>
              <v-col class="mb-0 pt-2 pb-0" cols="12" md="6" v-if="checkStatus(item.email)">
                <h3 class="mb-0">
                  Email address:
                  <a :href="getMail(item.email)">{{ item.email }}</a>
                </h3>
              </v-col>
              <v-col class="mb-0 pt-2 pb-0" cols="12" md="6" v-if="checkStatus(item.fax_office)">
                <h3 class="mb-0">
                  Fax office: <span>{{ item.fax_office }}</span>
                </h3>
              </v-col>
            </v-row>
          </v-card>
          <v-card v-if="checkStatus(item.manager)" class="my-5 py-1 pb-3 px-5 employee-detail" elevation="1">
            <h2 class="mt-4 mb-2">Position information</h2>
            <v-row>
              <v-col class="mb-0 pt-2 pb-0">
                <h3 class="mb-0">
                  Manager:
                  <a :href="generateUrl('manager', item.manager, 'n/a')">{{
                    item.manager
                    }}</a>
                </h3>
              </v-col>
            </v-row>
          </v-card>
          <v-card class="my-5 py-1 pb-3 px-5 employee-detail" elevation="1"
            v-if="checkStatus(item.address) || checkStatus(item.community) || checkStatus(item.postal_code) || checkStatus(item.mailcode)">
            <h2 class="mt-4 mb-2">Location</h2>
            <v-row>
              <v-col class="mb-1" cols="12" md="6">
                <h3 v-if="checkStatus(item.address)" class="mb-0">
                  Address: <span>{{ item.address }}</span>
                </h3>
                <h3 v-if="checkStatus(item.community)" class="mb-0">
                  Community: <span>{{ item.community }}</span>
                </h3>
                <h3 v-if="checkStatus(item.postal_code)" class="mb-0">
                  Postal code: <span>{{ item.postal_code }}</span>
                </h3>
                <h3 v-if="checkStatus(item.mailcode)" class="mb-0">
                  Mail code: <span>{{ item.mailcode }}</span>
                </h3>
              </v-col>
              <v-col v-if="center !== null" cols="12" md="6">

                <l-map style="height: 300px" :zoom="zoom" :center="center" :options="{attributionControl: false}">

                  <l-tile-layer :url="mapUrl"></l-tile-layer>
                  <l-marker :lat-lng="center"></l-marker>

                </l-map>

              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import DepartmentHeader from "./UI/DepartmentHeader.vue";
import SearchBarHeader from "./UI/SearchBarHeader.vue";
import * as urls from "../urls";


import L from 'leaflet';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';

import { Icon } from 'leaflet';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const axios = require("axios");
export default {
  components: {
    DepartmentHeader,
    SearchBarHeader,
    LMap,
    LTileLayer,
    LMarker,

  },
  name: "EmployeeDetail",
  data: () => ({
    zoom: 17,
    noBgImg: true,
    department: "",
    managerAvailability: true,
    managerDepartment: [],
    center: {
      "lat": 0,
      "lng": 0
    },
    markers: [],
    breadcrumbsList: [],
    employee: [],
    show: 90,
    loading: false,
    items: [],
    search: "",
    title: "",
    options: {},
    office: "",
    address: "",
    community: "",
    error: false,
    name: '',
    url: '',
    mapUrl: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
  }),
  watch: {
    $route() {
      this.breadcrumbsList = this.$route.meta.breadcrumb;
    },
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    search: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
  },
  emits: ['changeBg'],
  computed: {},
  mounted() {
    this.$emit('changeBg');
    this.getDataFromApi();
  },
  created() {
    this.getUrl();
  },
  methods: {


    getUrl() {
      const urlLocation = String(window.location.href);
      let url = urlLocation.split(window.location.pathname);

      url = url.filter((element) => {
        return element !== "";
      });

      this.url = url[0]
    },
    checkError() {
      if (this.error === true) {
        window.location.href = this.url + '/page-not-found/';
      }
    },
    setCenter(marker) {
      this.center = marker;
      this.markers[0] = { position: marker }
    },
    getMail(mail) {
      const link = "mailto:" + mail;
      return String(link);
    },
    getPhone(number) {
      const find = "-";
      const reg = new RegExp(find, "g");
      const numberFormatted = number.replace(reg, "");
      const link = "tel:" + numberFormatted;
      return String(link);
    },
    checkStatus(param) {
      if (param == null || param == "" || param == "-") {
        return false;
      } else if (param.length > 0) {
        return true;
      }
    },

    generateUrl(type, param, index) {
      let url = this.url

      let find = " ";

      let reg = new RegExp(find, "g");
      let department = this.department.replace(reg, "-");
      let indexFormatted = index.replace(reg, "-");
      let paramFormatted = param.replace(reg, "-");

      if (type === 'manager') {
        if (this.managerAvailability !== true) {
          return url + '/employee-not-found/' + param.replace(reg, ".")
        } else {
          return url +
            "/find-employee/employee-detail/" +
            this.managerDepartment +
            "/" +
            param.replace(reg, ".")
        }
      }

      if (indexFormatted === "N/A") {
        indexFormatted = "not-division";
      }
      if (type === "department") {
        return url + "/find-employee/" + department;
      }
      if (type === "division") {
        if (indexFormatted === "N/A") {
          return (
            url + "/find-employee/" + department + "/not-division/all-branches"
          );
        }
        return (
          url +
          "/find-employee/" +
          department +
          "/" +
          indexFormatted +
          "/all-branches"
        );
      } else if (type === "branch") {
        if (param === "N/A") {
          return (
            url +
            "/find-employee/" +
            department +
            "/" +
            indexFormatted +
            "/not-branch"
          );
        }
        return (
          url +
          "/find-employee/" +
          department +
          "/" +
          indexFormatted +
          "/" +
          paramFormatted
        );
      }
    },
    toggleBranches(param) {
      if (this.show === param) {
        this.show = null;
      } else this.show = param;
    },
    getDataFromApi() {
      var find = "-";
      var reg = new RegExp(find, "g");
      const { department, full_name } = this.$route.params;
      this.name = full_name;
      this.department = department.replace(reg, " ");
      this.loading = true;
      axios
        .post(
          `${urls.FIND_EMPLOYEE_URL}employee-detail/${department}/${full_name}`
        )
        .then((resp) => {

          this.error = resp.data.data;

          this.checkError();
          this.employee = resp.data.data;
          this.division = resp.data.data[0].division;
          this.branch = resp.data.data[0].branch;
          this.title = resp.data.data[0].formatted_name;
          if (resp.data.meta.manager.length === 0) {
            this.managerAvailability = false
          } else {
            this.managerDepartment = resp.data.meta.manager && resp.data.meta.manager[0] ? resp.data.meta.manager[0].department.toLowerCase().replace(/\s+/g, '-') : '';
            this.managerAvailability = true
          }

          this.department = resp.data.data[0].department;
          this.loading = false;


          this.address = resp.data.data[0].address;
          this.community = resp.data.data[0].community;

          this.center = resp.data.data[0].center;

          this.updateBreadCrumbs();
        })

        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateBreadCrumbs() {
      var find = " ";
      var reg = new RegExp(find, "g");
      let arr = this.$route.meta.breadcrumb;

      const dynamicBreadcrumb = arr.filter(({ dynamic }) => !!dynamic);

      dynamicBreadcrumb.forEach((element) => {
        if (element.name == "Department") {
          element.name = this.department;
          element.link =
            "/find-employee/" + this.department.replace(reg, "-");
        } else if (element.name == "Division") {
          element.name = this.division;
          element.link =
            ("/find-employee/" + this.department + "/" + this.division)
              .replace(reg, "-") + "/all-branches";
        } else if (element.name == "Branch") {
          if (this.branch === null) {
            element.name = null;
            element.link = null;
          }
          element.name = this.branch;
          element.link = (
            "/find-employee/" +
            this.department +
            "/" +
            this.division +
            "/" +
            this.branch
          )
            .replace(reg, "-")
        } else if (element.name == "Username") {
          element.name = this.title;
        }
      });

      arr = arr.filter((item) => item.name !== null);

      this.breadcrumbsList = arr;
    },
  },
};
</script>

<style>
.employee-detail a {
  font-size: 22px;
  font-weight: 400;
  text-decoration: underline;
}

.employee-detail h2,
.employee-detail h3 {
  font-weight: bold;
}

.employee-detail h2 {
  font-size: 30px;
}

.employee-detail h3 {
  font-size: 22px;
}
</style>
