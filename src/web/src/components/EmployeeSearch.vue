<template>
    <div class="employees-search">
        <SearchBarHeader />
        <DepartmentHeader v-if="department !== 'Any department'" :title="this.department"
            :image="this.department.toLowerCase().replace(/\//g, '')" />
        <v-container class="px-0">
            <v-breadcrumbs class="mt-6 mb-8 breadcrumbs px-0" :items="breadcrumbsList">
                <template v-slot:item="{ item }">
                    <v-breadcrumbs-item :href="item.link">
                        {{ $t(item.name) }}
                    </v-breadcrumbs-item>
                </template>
            </v-breadcrumbs>
            <h2 v-if="results && department !== 'Any department'" class="px-0" style="font-size: 34px !important;">{{ $t("components.employee_search.no_results_by_department.body.part1") }} {{ this.searchTitle.replace(/-/g, " ") }} {{ $t("components.employee_search.no_results_by_department.body.part2") }} {{$t('components.departments_api')[this.department] ? $t('components.departments_api')[this.department] : this.department }} {{ $t("components.employee_search.no_results_by_department.body.part3") }}</h2>
            <h2 v-else-if="results" class="px-0" style="font-size: 34px !important;">{{ $t("components.employee_search.no_results.body.part1") }} {{ this.searchTitle.replace(/-/g, " ") }}  {{ $t("components.employee_search.no_results.body.part2") }}</h2>
            <h2 v-else-if="!results && department !== 'Any department'" class="px-0" style="font-size: 34px !important;">{{ $t("components.employee_search.results_by_department.body.part1") }} {{ this.searchTitle.replace(/-/g, " ") }} {{ $t("components.employee_search.results_by_department.body.part2") }} {{$t('components.departments_api')[this.department] ? $t('components.departments_api')[this.department] : this.department }} {{ $t("components.employee_search.results_by_department.body.part3") }} {{ this.itemsLength }} {{ $t("components.employee_search.results_by_department.body.part4") }}</h2>
            <h2 v-else class="mt-8">{{ $t("components.employee_search.results.body.part1") }} {{ this.searchTitle ? this.searchTitle.replace('any-employee', $t("components.employee_search.results.body.any_employee")).replace(/-/g, " ") : '' }} {{ $t("components.employee_search.results.body.part2") }} {{ this.itemsLength }} {{ $t("components.employee_search.results.body.part3") }}
            </h2>
            <v-row v-if="!results">
                <v-col cols="12" md="2" class="d-flex align-center justify-start">
                    <h4 class="">{{ $t("components.employee_search.labels.group_by") }}: </h4>
                </v-col>
                <v-col cols="12" md="8">
                    <v-chip-group v-model="selection" center-active mandatory>
                        <v-row>
                            <v-col
                                class="d-flex flex-column align-sm-center justify-sm-space-around flex-sm-row justify-md-start">
                                <v-chip label outlined color="#00616D">{{ $t("components.employee_search.labels.see_all") }}</v-chip>
                                <v-chip label outlined color="#00616D">{{ $t("components.employee_search.labels.department") }}</v-chip>
                                <v-chip label outlined color="#00616D">{{ $t("components.employee_search.labels.location") }}</v-chip>
                                <v-chip label outlined color="#00616D">{{ $t("components.employee_search.labels.position") }}</v-chip>
                            </v-col>
                        </v-row>
                    </v-chip-group>
                </v-col>
            </v-row>

            <div class="text-center loading" v-show="loading">
                <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
            </div>
            <div v-if="!results">
                <div v-if="itemsValue === 0">
                <EmployeesGrid :check="mobileCheck" :items="items" :department="department" />
            </div>
            <div v-if="itemsValue === 1" v-for='(value, parent_array, key) in items' class="mb-6 mt-2">
                <h2 class="mt-8 department-text">{{ cleanParam(parent_array) }}</h2>

                <div v-for="(item, index, id) in value" :key="id">
                    <div class="mt-8 d-flex align-center">
                        <h3 class="division-text">{{ cleanParam(index) }}</h3>
                        <h3 class="py-1 px-3 division-length">{{ item.length }}</h3>
                    </div>
                    <EmployeesGrid :check="mobileCheck" :items="item" :department="department" />
                </div>

            </div>

            <div v-if="itemsValue === 2" v-for='(value, parent_array, key) in items' class="mb-6 mt-2">
                <v-row>
                    <div class="mt-8 d-flex align-center">
                        <h3 class="division-text pl-3">{{ cleanLocation(parent_array) }}</h3>
                    </div>
                </v-row>
                <div class="mt-4 d-flex align-center">
                    <EmployeesGrid :check="mobileCheck" :items="value" :department="department" />
                </div>

            </div>

            <div v-if="itemsValue === 3" v-for='(value, parent_array, key) in items' class="mb-6 mt-2">
                <v-row>
                    <div class="mt-8 pl-3 d-flex align-center">
                        <h3 class="division-text ">{{ cleanParam(parent_array) }}</h3>
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
import SearchBarHeader from './UI/SearchBarHeader.vue'
import DepartmentHeader from './UI/DepartmentHeader.vue';
import IconLoader from "./icons/IconLoader.vue";
import EmployeesGrid from './UI/EmployeesGrid.vue';

import * as urls from "../urls";

export default {
    components: {
        EmployeesGrid,
        SearchBarHeader,
        IconLoader,
        DepartmentHeader
    },
    watch: {
        options: {
            handler() {
                this.getDataFromApi()
            },
            deep: true,
        },
        '$route'() {
            this.breadcrumbsList = this.$route.meta.breadcrumb
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
    emits: ['changeBg'],
    mounted() {

        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize);
        })
        if (this.windowWidth > 900) {
            this.mobileCheck = false
        } else this.mobileCheck = true

        this.getDataFromApi();
        this.updateBreadCrumbs();
        this.$emit('changeBg');
    },
    data() {
        return {
            results: false,
            itemsPerPage: null,
            selection: 0,
            itemsValue: null,
            breadcrumbsList: [],
            chipsData: true,
            department: '',
            pastSearch: '',
            items: [],
            itemsLength: null,
            headers: [
                { text: "Name", value: "formatted_name" },
                { text: "Position", value: "title" },
                { text: "Email address", value: "email" },
                { text: "Phone number", value: "phone_office" },
            ],
            loading: false,
            searchTitle: '',
            windowWidth: window.innerWidth,
            mobileCheck: false,
        }
    },

    methods: {
        onResize() {
            this.windowWidth = window.innerWidth
        },
        urlEmployee(department, name) {
            var find = ' ';
            var reg = new RegExp(find, 'g');
            return '/find-employee/employee-detail/' + department.replace(reg, '-').toLowerCase() + '/' + name.toLowerCase()
        },
        cleanParam(param) {

            if (param === '-') {
                param = 'N/A'
            }

            return param;
        },
        cleanLocation(location) {
            if(location != null){
                if (location[0] === ',') {
                    let link = location.slice(1);
                    return link.replace(/['"]+/g, '')
                } else {
                    return location.replace(/['"]+/g, '')
                }
            }
        },
        updateBreadCrumbs() {

            var find = ' ';
            var reg = new RegExp(find, 'g');
            let arr = this.$route.meta.breadcrumb;

            const dynamicBreadcrumb = arr.filter(({ dynamic }) => !!dynamic);

            dynamicBreadcrumb.forEach((element => {
                if (element.name == 'Department') {
                    element.name = this.department;
                    if (element.name !== 'Any department') {
                        element.link = '/find-employee/' + this.department.replace(reg, '-').toLowerCase()
                    } else {
                        element.link = undefined
                    }

                } else if (element.name == 'Search') {

                    element.name = 'Employee Search';

                }
            }))

            arr = arr.filter(item => item.name !== 'Any department')

            this.breadcrumbsList = arr
        },
        validateEmail(email) {
            return String(email)
                .toLowerCase()
                .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
            },
        getDataFromApi() {
            var find = '-';

            var reg = new RegExp(find, 'g');
            let { full_name, department } = this.$route.params;
            if (this.validateEmail(full_name)) {
                this.searchTitle = full_name
            } else {
                this.searchTitle = full_name.replace(/\./g, ' ')
            }

            let departmentFormatted = department.replace(reg, ' ')

            departmentFormatted = departmentFormatted.charAt(0).toUpperCase() + departmentFormatted.slice(1);
            this.department = departmentFormatted

            this.loading = true;

            axios
                .request({
                    method: 'POST',
                    data: {
                        groupBy: this.selection,
                        itemsperPage: this.itemsPerPage,
                    },
                    url: `${urls.FIND_EMPLOYEE_URL}search/keyword=${this.searchTitle}&department=${department}`
                }
                )
                .then((resp) => {

                    this.items = resp.data.data;
                    if(this.items.length === 0) {
                        this.results = true
                    }
                    this.itemsLength = resp.data.meta.count
                    this.itemsPerPage = resp.data.meta.count

                    this.itemsValue = this.selection
                    this.loading = false;
                })
                .catch((err) => console.error(err))
                .finally(() => {
                    this.loading = false;
                });
        },
    },

}

</script>

<style scoped>
.department-text {
    font-size: 34px !important;
}

.division-text {
    font-size: 30px !important;
}

.division-length {
    background-color: #DC4405;
    font-size: 16px;
    border-radius: 5px;
    color: white !important;
}

.chips--active {
    opacity: 1 !important;
    background-color: red !important;
}
</style>
