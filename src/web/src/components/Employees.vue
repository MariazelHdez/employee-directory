<template>
  <div class="Homepage-departments">
    <v-alert
			v-if="loginFailed"
			dense
			text
			type="error"
      class="mt-10"
		>
			Authentication failed. <strong>Unauthorized user</strong>, please contact the site administrator.
		</v-alert>
    <v-alert
			v-if="serverError"
			dense
			text
			type="error"
      class="mt-10"
		>
			Server failed. Please contact the site administrator.
		</v-alert>
    <SearchBarHeader class="z-indx" :info="this.findEmployeeHeaderInfo" />
    
    <Aurora/>

    <v-container class="px-0">
      <v-breadcrumbs class="mt-sm-6 mb-sm-0 breadcrumbs mt-2 mb-n8 px-0" :items="breadcrumbsList">

        <template v-slot:item="{ item }">

          <v-breadcrumbs-item :href="item.link">
            {{ $t(item.name) }}
          </v-breadcrumbs-item>

        </template>
      </v-breadcrumbs>
      <div class="full-width pt-6 bg-img">
        <v-container class="container-content">
          <v-row>
            <v-col cols="12" sm="12" class="align-center justify d-flex">
              <h2 class="mb-n1 text-responsive" style="color: #522a44 !important; font-size: 32px !important">
                {{ $t("components.employees.browse_directory_by_department") }}
              </h2>
            </v-col>
          </v-row>
        </v-container>
      </div>
      <v-row class="mb-6 mt-8">
        <v-col cols="12" md="4" sm="6" xs="12" v-for='(items, index, id) in item' :key="id">
          <v-hover v-slot="{ hover }">
            <v-card :href="indexUrl(index, items)" class="mx-auto employee-division-card" max-width="344" outlined>
              <v-card class="d-flex">
                <v-list-item three-line class="icon-list">
                  <v-list-item-content>
                    <v-list-item-title class="text-h6  ma-2 center-items">
                      <a class="index-text department-link">             
                        {{$t('components.departments_api')[index] ? $t('components.departments_api')[index] : index }}   
                      </a>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import IconLoader from './icons/IconLoader.vue'
import SearchBarHeader from './UI/SearchBarHeader.vue'
import * as urls from "../urls";
import Aurora from './UI/Aurora.vue';

const axios = require("axios");
export default {
  components: {
    IconLoader,
    SearchBarHeader,
    Aurora
},
  name: "Employees",
  data: () => ({
    noBgImg: true,
    breadcrumbsList: [],
    show: false,
    loading: false,
    item: [],
    options: {},
    findEmployeeHeaderInfo: true,
    loginFailed: false,
    serverError: false,
    
  }),
  watch: {
    options: {
      handler() {
        this.getEmployeesData();
      },
      '$route'() {
        this.breadcrumbsList = this.$route.meta.breadcrumb
      },
      deep: true,
    },
  },
  mounted() {
    this.getEmployeesData();
    this.updateBreadCrumbs();

  },
  methods: {
    updateBreadCrumbs() {
      this.breadcrumbsList = this.$route.meta.breadcrumb
    },

    indexUrl(field) {

      let department = "/find-employee/" + field.replace(/\//g, '')
      let noSpaces = department.replaceAll(/\s/g, '-');

      return String(noSpaces)

    },
    getEmployeesData() {
      this.loading = true;

      axios
        .post(
          urls.EMPLOYEES_URL,
          // this.options
        )
        .then((resp) => {
          this.item = resp.data.data;
          this.loading = false;
        })
        .catch((err) => console.error(err))
        .finally(() => {
          this.loading = false;
        });

    },
  },
  created() {
    const params = new URLSearchParams(window.location.search);

    const loginFailed = params.get('loginFailed') === 'true';
    const serverError = params.get('serverError') === 'true';

    this.loginFailed = loginFailed;
    this.serverError = serverError;
  },
};
</script>
<style>
.center-items{
  display: flex;
  justify-content: center;
  text-align: center;
}
a.department-link{
  color:#005a65;
  white-space: normal; 
}
a.department-link:visited{
  color:#643f5d;
}
a.department-link:hover{
  color:#008392;
}
</style>