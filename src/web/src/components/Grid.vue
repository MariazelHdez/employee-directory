<template>
  <div class="employees-grid">

    <SearchBarHeader />

    <DepartmentHeader :title="title" :image="title.toLowerCase()" />
    <v-container class="px-0">
      <v-breadcrumbs class="mt-6 mb-8 breadcrumbs px-0" :items="breadcrumbsList">
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item :href="item.link">
            {{ item.name }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>

      <v-row>
        <v-col cols="12" md="2" class="d-flex align-center justify-start">
          <h4 class="">Group by: </h4>
        </v-col>
        <v-col cols="12" md="8">
          <v-chip-group v-model="selection" center-active mandatory>
            <v-row>
              <v-col class="d-flex flex-column align-sm-center justify-sm-space-around flex-sm-row justify-md-start">
                <v-chip label outlined color="#00616D">See all government employees</v-chip>
                <v-chip label outlined color="#00616D">Location</v-chip>
                <v-chip label outlined color="#00616D">Position</v-chip>
              </v-col>
            </v-row>
          </v-chip-group>
        </v-col>
      </v-row>

      <v-row>
        <DivisionsCard :division="this.div" :checkClass="this.branch" :checkHover="this.div" :department="this.department"
          class="mt-6" />
      </v-row>

      <div class="pt-6 pb-n12 mt-10 d-flex flex-column align-start justify-center">
        <div v-if="results">
          <h2 class="px-0" style="font-size: 34px !important;">There are no results</h2>
        </div>
        <div v-else class="d-flex align-center justify-start">
          <h2 class="px-0" style="font-size: 34px !important;">{{ div }}</h2>
          <h3 class="ml-4">( {{ divisionLength }} Results )</h3>
        </div>

        <div v-if="branch !== 'All branches'" class=" d-flex align-center justify-start">
          <h2 style="font-size: 25px !important;">{{ branch }}</h2>
          <h3 style="font-size: 16px !important;" class="ml-4">( {{ totalLength }} Results )</h3>
        </div>
      </div>
      <div class="text-center loading" v-show="loading">
        <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
      </div>

      <div v-if="!results">
        <div v-if="itemsValue === 0" class="mb-6 mt-2">
        <EmployeesGrid :check="mobileCheck" :items="items" :department="department" />
      </div>

      <div v-if="itemsValue === 1" v-for='(value, parent_array, key) in items' class="mb-6 mt-2">
        <v-row class="px-3">
          <div class="mt-8 d-flex align-center">
            <h3 class="division-text ">{{ cleanLocation(parent_array) }}</h3>
          </div>
        </v-row>
        <div class="mt-4 d-flex align-center">
          <EmployeesGrid :check="mobileCheck" :items="value" :department="department" />
        </div>
      </div>

      <div v-if="itemsValue === 2" v-for='(value, parent_array, key) in items' class="mb-6 mt-2">
        <v-row>
          <div class="mt-8 d-flex align-center">
            <h3 class="division-text px-3">{{ cleanParam(parent_array) }}</h3>
          </div>
        </v-row>
        <div class="mt-8 d-flex align-center">
          <EmployeesGrid :check="mobileCheck" :items="value" :department="department" />
        </div>
      </div>
      </div>
    </v-container>
  </div>
</template>

<script>
const axios = require("axios");
import DepartmentHeader from "./UI/DepartmentHeader.vue";
import DivisionsCard from "./UI/DivisionsCard.vue";
import IconLoader from "./icons/IconLoader.vue";
import SearchBarHeader from "./UI/SearchBarHeader.vue";
import * as urls from "../urls";
import EmployeesGrid from "./UI/EmployeesGrid.vue";

export default {
  name: "Grid",
  components: {
    DepartmentHeader,
    DivisionsCard,
    IconLoader,
    SearchBarHeader,
    EmployeesGrid
  },
  data: () => ({
    results: false,
    itemsValue: null,
    selection: '',
    dataTableParam: 0,
    branch: '',
    breadcrumbsList: [],
    department: '',
    title: '',
    div: '',
    loading: false,
    items: [],
    search: "",
    options: {},
    totalLength: 0,
    divisionLength: 0,
    headers: [
      { text: "Name", value: "formatted_name" },
      { text: "Position", value: "title" },
      { text: "Email address", value: "email" },
      { text: "Phone number", value: "phone_office" },
    ],
    page: 1,
    pageCount: 0,
    itemsPerPage: 9999,
    windowWidth: window.innerWidth,
    mobileCheck: false,
  }),
  watch: {
    '$route'() {
      this.breadcrumbsList = this.$route.meta.breadcrumb
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
    selection: {
      handler() {
        this.loading = true
        this.getDataFromApi();
      },
    },

    windowWidth: {
      handler() {
        if (this.windowWidth > 900) {

          this.mobileCheck = false
        } else this.mobileCheck = true
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    })
    if (this.windowWidth > 900) {
      this.mobileCheck = false
    } else this.mobileCheck = true
    this.getDataFromApi();
    this.updateBreadCrumbs();
  },
  methods: {
    cleanParam(param) {

      if (param === '-') {
        param = 'N/A'
      }

      return param;
    },
    cleanLocation(location) {

      if (location[0] === ',') {
        let link = location.slice(1);
        return link.replace(/['"]+/g, '')
      } else {
        return location.replace(/['"]+/g, '')
      }
    },
    onResize() {
      this.windowWidth = window.innerWidth
    },
    cleanParam(param) {
      if (param === '-') {
        param = 'N/A'
      }
      return param;
    },

    capitalizeString(param) {
      const string = param
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    updateBreadCrumbs() {
      var find = ' ';
      var reg = new RegExp(find, 'g');
      let arr = this.$route.meta.breadcrumb;
      const dynamicBreadcrumb = arr.filter(({ dynamic }) => !!dynamic);
      dynamicBreadcrumb.forEach((element => {
        if (element.name == 'Department') {
          element.name = this.department;
          element.link = '/find-employee/' + this.department.replace(reg, '-')
        } else if (element.name == 'Division') {
          if (this.div === 'Not division') {
            element.name = 'Employees who are not assigned a division'
            element.link = null
          } else element.name = this.div;

          if (this.branch !== 'All branches') {

            element.link = ('/find-employee/' + this.department + '/' + this.div).replace(reg, '-') + '/all-branches'
          } else {

            element.link = null
          }
        } else if (element.name == 'Branch') {
          if (this.branch === 'All branches') {
            element.name = 'Employees who are not assigned a branch'
          } else {
            element.name = this.branch;
          }
        }
      }))
      arr = arr.filter(item => item.name !== null)
      this.breadcrumbsList = arr
    },
    getDataFromApi() {
      var find = '-';
      var reg = new RegExp(find, 'g');
      const { department, division, branch } = this.$route.params;
      this.loading = true;
      let formattedQueryParam = ''
      if (division == null) {
        formattedQueryParam = `${encodeURIComponent(`${department}`)}`
      } else if (division !== null && branch == null || branch == undefined) {
        formattedQueryParam = `${encodeURIComponent(`${department}-%252F-${division}`)}`
      } else if (division !== null && branch !== null) {
        formattedQueryParam = `${encodeURIComponent(`${department}-%252F-${division}-%252F-${branch}`)}`
      }
      this.title = this.capitalizeString(department.replace(reg, ' '))

      this.department = this.capitalizeString(department.replace(reg, ' '))
      this.div = this.capitalizeString(division.replace(reg, ' '))
      this.branch = this.capitalizeString(branch.replace(reg, ' '))
      const search = `${encodeURIComponent(`${this.search}`)}`;
      axios
        .request({
          method: 'POST',
          data: {
            groupBy: this.selection,
          },
          url: `${urls.FIND_EMPLOYEE_URL}${department}/${division}/${branch}?search=`
        })
        .then((resp) => {
          this.items = resp.data.data;

          if (this.items.length === 0) {
            this.results = true
          }
          this.totalLength = resp.data.meta.branchCount;
          this.divisionLength = resp.data.meta.divisionCount;
          this.itemsPerPage = resp.data.meta.divisionCount;
          this.itemsValue = this.selection
          this.updateBreadCrumbs();
          this.loading = false;
        })
        .catch((err) => console.error(err))
        .finally(() => {
          this.loading = false;
        });
    },
  }
};
</script>

<style scoped></style>