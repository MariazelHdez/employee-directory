<template>
  <div class="books">
    <div class="text-center loading" v-show="loading">
      <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
    </div>
    <SearchBarHeader />

    <DepartmentHeader :title="title" :image="department" />

    <v-container class="px-0">
      <v-breadcrumbs class="mt-6 breadcrumbs px-0" :items="breadcrumbsList">
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item :href="item.link">
            {{$t('components.departments_api')[item.name] ? $t('components.departments_api')[item.name] : $t(item.name) }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>
      <v-row class="mt-16"></v-row>
      <v-row>
        <v-col col="6">
          <v-card v-if="!error" elevation="2" class="mx-auto flex-column flex-md-row d-flex justify-center align-center department-card"
            max-width="1180" min-height="542" outlined>
            <v-card-actions class=" d-flex flex-column justify-center align-center" height="450"
              max-width="590">
              <!--div class="py-4 d-flex align-center justify-center" style="width: 200px">
                <IconLoader :image="'icon'" :stroke="'purple-stroke'" >
              </div-->
              <div class="d-flex align-center justify-center" style="width:100%">
                <h2 class="py-4" style="color:#522A44!important; font-size: 32px; text-align: center;"> {{$t('components.departments_api')[title] ? $t('components.departments_api')[title] : title }}</h2>
              </div>
            </v-card-actions>

            <v-card outlined color="transparent" class="flex-column pa-10">
              <h2 v-if="!employeesNotFound" style="color:#522A44!important; font-size: 30px;">{{ $t("components.department.labels.browse_employees_by_divisions") }}</h2>
                <div width="100%" v-else>
                <h2 style="color:#522A44!important; font-size: 30px; text-align: center!important; width: 100%;">{{ $t("components.department.labels.no_results") }}</h2>
              </div>
              <v-card outlined color="transparent" v-for="(item, parent_item, id) in items" :key="item.full_name"
                class="px-8">
                <v-card outlined color="transparent">
                  <li>
                    <a @click="activateBranches(parent_item)" :key="id" class="division">
                      {{ ($t('components.divisions_api')[parent_item]) ? $t('components.divisions_api')[parent_item] : parent_item }} 
                    </a>
                  </li>
                  <v-expand-transition>
                    <ul v-if="check === parent_item">
                      <li v-for="(item, index, id) in item" :key="id" class="py-2">
                        <a :href="generateUrl('branch', index, parent_item)" class="my-2 px-0 py-3 branch">
                          {{ ($t('components.branch_api')[index]) ? $t('components.branch_api')[index] : index }}
                        </a>
                      </li>
                    </ul>
                  </v-expand-transition>
                </v-card>
              </v-card>
              <div style="height:20px;"></div>
              <a v-if="!employeesNotFound" @click="toggleApiSearch" class="mb-2"
                style="font-size: 22px; font-weight: 700;" :class="{ colorOnClick: checkGrid }">{{ $t("components.department.labels.view_list") }} {{ $t('components.departments_api')[title] ? $t('components.departments_api')[title] : title }}</a>
            </v-card>
          </v-card>
          <v-card v-if="error" elevation="2" class="mx-auto flex-column flex-md-row d-flex justify-center align-center department-card"
            max-width="1180" min-height="542" outlined>
            <v-card-actions class=" d-flex flex-column justify-center align-center" height="450"
              max-width="590">
              <!--div class="py-4 d-flex align-center justify-center" style="width: 200px">
                <IconLoader :image="'icon'" :stroke="'purple-stroke'" >
              </div-->
              <div class="d-flex align-center justify-center" style="width:100%">
                <h2 class="py-4" style="color:#522A44!important; font-size: 32px; text-align: center;"> {{$t('components.departments_api')[title] ? $t('components.departments_api')[title] : title }}</h2>
              </div>
            </v-card-actions>

            <v-card outlined color="transparent" class="flex-column pa-10">
              <h2 style="color:#522A44!important; font-size: 30px;">{{ $t("components.department.labels.not_found") }}</h2>
            </v-card>
          </v-card>
          <v-card tile class="mx-auto mt-n3" height="12px" width="281px" color="#244C5A"></v-card>
        </v-col>
      </v-row>
      <div class="mt-7" v-if="checkGrid">
        <v-row v-if="!results">
          <v-col cols="12" md="2" class="d-flex align-center justify-start">
            <h4 class="">{{ $t("components.department.labels.group_by") }}</h4>
          </v-col>
          <v-col cols="12" md="8">
            <v-chip-group v-model="selection" center-active mandatory>
              <v-row>
                <v-col class="d-flex flex-column align-sm-center justify-sm-space-around flex-sm-row justify-md-start">
                  <v-chip label outlined color="#00616D">{{ $t("components.department.labels.see_all_employees") }}</v-chip>
                  <v-chip label outlined color="#00616D">{{ $t("components.department.labels.location") }}</v-chip>
                  <v-chip label outlined color="#00616D">{{ $t("components.department.labels.position") }}</v-chip>
                </v-col>
              </v-row>
            </v-chip-group>
          </v-col>
        </v-row>

        <h2 v-if="results" class="px-0" style="font-size: 34px !important;">{{ $t("components.department.labels.no_results") }}</h2>

        <h2 v-else class="mt-3" style="font-size: 30px;"> {{ divisionLength }} {{ $t("components.department.labels.results") }} </h2>

        <div class="text-center loading" v-show="loading">
          <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
        </div>

        <div v-if="!results">
          <div v-if="itemsValue === 0" class="mb-6 mt-2">
            <EmployeesGrid :divisions="false" :check="mobileCheck" :items="employees" :department="department" />
          </div>

          <div v-if="itemsValue === 1" v-for='(value, parent_array, key) in employees' class="mb-6 mt-2">
            <v-row class="px-3">
              <div class="mt-8 d-flex align-center">
                <h3 class="division-text ">{{ cleanLocation(parent_array) }}</h3>
              </div>
            </v-row>
            <div class="mt-4 d-flex align-center">
              <EmployeesGrid :divisions="false" :check="mobileCheck" :items="value" :department="department" />
            </div>
          </div>

          <div v-if="itemsValue === 2" v-for='(value, parent_array, key) in employees' class="mb-6 mt-2">
            <v-row>
              <div class="mt-8 d-flex align-center">
                <h3 class="division-text px-3">{{ cleanParam(parent_array) }}</h3>
              </div>
            </v-row>
            <div class="mt-8 d-flex align-center">
              <EmployeesGrid :divisions="false" :check="mobileCheck" :items="value" :department="department" />
            </div>
          </div>
        </div>

      </div>
    </v-container>
  </div>
</template>

<script>

import DepartmentHeader from "./UI/DepartmentHeader.vue";
import IconLoader from "./icons/IconLoader.vue";
import SearchBarHeader from "./UI/SearchBarHeader.vue";
import * as urls from "../urls";
import EmployeesGrid from "./UI/EmployeesGrid.vue";

const axios = require("axios");
export default {
  components: {
    IconLoader,
    DepartmentHeader,
    SearchBarHeader,
    EmployeesGrid
  },
  name: "Department",
  data: () => ({
    results: false,
    itemsValue: null,
    employees: [],
    error: false,
    check: '',
    department: '',
    breadcrumbsList: [],
    imgTitle: '',
    show: 90,
    loading: false,
    items: [],
    search: "",
    title: '',
    options: {},
    url: '',
    loading: true,
    checkGrid: false,
    selection: '',
    mobileCheck: false,
    windowWidth: window.innerWidth,
    checkAPIStatus: false,
    employeesNotFound: false,

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
        this.getEmployeeData();
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
    this.toggleLocale();
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
    toggleLocale: function () {
        const savedLocale = this.$cookies.get("locale");
        const routeLocale = this.$route.params.locale;

        if (savedLocale != routeLocale) {
            this.$cookies.set("locale", routeLocale);
            this.loadLocale(routeLocale);
            this.$i18n.locale = routeLocale;
        }
    },
    toggleApiSearch() {
      if (this.checkAPIStatus !== false) {
        this.checkGrid = !this.checkGrid
        return
      } else this.getEmployeeData()
    },

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
    checkError() {
      if (this.error === true) {
        const savedLocale = this.$cookies.get("locale");
        this.$cookies.set("latestFullPath", this.$route.fullPath);

        const currentPath = `/${savedLocale}/page-not-found`
        this.$router.push({ path: currentPath });
      }
    },
    activateBranches(item) {
      let find = ' ';
      let reg = new RegExp(find, 'g');
      let department = this.department.replace(reg, '-')

      let division = item

      if (this.check === item) {
        if (this.check === 'Employees who are not assigned a division') {
          window.location.href = '/find-employee/' + department + '/not-division/all-branches'
        } else window.location.href = '/find-employee/' + department + '/' + item.replace(reg, '-') + '/all-branches'
      }
      this.check = division
    },
    capitalizeString(param) {
      const string = param
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    generateUrl(type, param, index) {

      const urlLocation = String(window.location.href)
      let url = urlLocation.split(window.location.pathname)

      url = url.filter(element => {
        return element !== ''
      })
      url = url[0]

      this.url = url[0]
      let find = ' ';

      let reg = new RegExp(find, 'g');
      let department = this.department.replace(reg, '-')
      let indexFormatted = index.replace(reg, '-')
      let paramFormatted = param.replace(reg, '-')

      if (indexFormatted === 'Employees-who-are-not-assigned-a-division') {
        indexFormatted = 'not-division'
      }

      if (type === 'division') {


        if (indexFormatted === 'not-division') {
          return url + '/find-employee/' + department + '/not-division/all-branches'
        }
        return url + '/find-employee/' + department + '/' + indexFormatted + '/all-branches'

      } else if (type === 'branch') {

        if (paramFormatted !== 'Employees-who-are-not-assigned-a-branch' && indexFormatted !== 'not-division') {

          return url + '/find-employee/' + department + '/' + indexFormatted + '/' + paramFormatted

        } else {

          return url + '/find-employee/' + department + '/' + indexFormatted + '/all-branches'

        }
      }
    },
    updateBreadCrumbs() {

      let arr = this.$route.meta.breadcrumb;

      const dynamicBreadcrumb = arr.find(({ dynamic }) => !!dynamic);

      if (dynamicBreadcrumb) {
        dynamicBreadcrumb.name = this.title;
      }
      this.breadcrumbsList = arr
    },
    toggleBranches(param) {
      if (this.show === param) {
        this.show = null
      } else
        this.show = param;
    },
    getDataFromApi() {
      var find = '-';
      var reg = new RegExp(find, 'g');
      const { department, division } = this.$route.params;
      this.loading = true;
      let formattedQueryParam = ''
      formattedQueryParam = `${encodeURIComponent(`${department}`)}`
      this.department = department.replace(reg, ' ')
      this.title = this.capitalizeString(department.replace(reg, ' '))

      axios
        .post(
          `${urls.FIND_EMPLOYEE_URL}${department}`,
          this.options
        )
        .then((resp) => {
          this.employeesNotFound = resp.data.meta.notFound
          this.error = resp.data.meta.error;
          this.checkError();
          this.items = resp.data.data;
          this.totalLength = resp.data.meta.count;
          this.loading = false;
        })
        .catch((err) => {
          console.error(err)
          this.error = true;
          this.checkError();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getEmployeeData() {
      var find = '-';
      var reg = new RegExp(find, 'g');
      const { department, division, branch } = this.$route.params;
      this.loading = true;
      let formattedQueryParam = ''

      formattedQueryParam = `${encodeURIComponent(`${department}`)}`

      axios
        .request({
          method: 'POST',
          data: {
            groupBy: this.selection,
          },
          url: `${urls.FIND_EMPLOYEE_URL}${department}/only-department/only-department?search=`
        })
        .then((resp) => {
          this.employees = resp.data.data;
          if (this.employees.length === 0) {
            this.results = true
          }
          this.checkAPIStatus = true;
          this.checkGrid = true;
          this.totalLength = resp.data.meta.branchCount;
          this.divisionLength = resp.data.meta.divisionCount;
          this.itemsPerPage = resp.data.meta.divisionCount;
          this.itemsValue = this.selection
          this.loading = false;
        })
        .catch((err) => {
          console.error(err)
          this.error = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  }
};
</script>

<style>
.department-card li {
  list-style: none;
}

.department-card a {
  text-decoration: underline;
  color: #0097A9;
}

.division {
  font-size: 19px;
  font-weight: 700;
}

.noPad {
  width: 70%;
  margin: 0 0 0 2rem;
  padding: 0 !important;
}

.colorOnClick {
  color: #643f5d !important;
}

.branch {
  padding: 2rem !important;
  font-size: 17px;
}

.directions-board {
  margin-bottom: 0 !important;
}</style>
