<template>
    <v-row class="px-3">
        <v-col>
            <v-card elevation="1" width="100%" class="py-10">
                <v-row>
                    <v-col cols="12" md="6" v-for="(item, parent_item, id) in items" :key="id" class="px-8 py-1">

                        <v-card outlined color="transparent">
                            <li>
                                <a :class="{ 'branch-pressed': checkHover == parent_item }"
                                    @click="activateBranches(parent_item)" :key="id" class="division">
                                    {{ ($t('components.divisions_api')[parent_item]) ? $t('components.divisions_api')[parent_item] : parent_item }} 
                                </a>
                            </li>
                            <v-expand-transition>
                                <ul v-if="checkHover === parent_item || check === parent_item">
                                    <li class="py-1" v-for="(value, index, id) in item" :key="id">
                                        <a :class="{ 'branch-pressed': checkClass === index }"
                                            :href="generateUrl('branch', index, parent_item)"
                                            class="branch my-2 px-0 py-3">
                                            {{ ($t('components.branch_api')[index]) ? $t('components.branch_api')[index] : index }} 
                                        </a>
                                    </li>
                                </ul>
                            </v-expand-transition>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card>
            <v-card tile class="mx-auto mt-n3" height="11px" width="281px" color="#244C5A"></v-card>
        </v-col>
    </v-row>
</template>


<script>
const axios = require("axios");
import * as urls from "../../urls";

export default {

    props: ['department', 'division', 'branch', 'checkHover', 'checkClass'],
    data() {
        return {
            check: null,
            items: [],
        }
    },
    watch: {
        department: function () {
            this.getDataFromApi();
        }
    },
    methods: {
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
            switch (type) {
                case 'division':
                    if (indexFormatted === 'not-division') {
                        return url + '/find-employee/' + department + '/not-division/all-branches'
                    }
                    return url + '/find-employee/' + department + '/' + indexFormatted + '/all-branches'
                    break;
                case 'branch':
                    if (paramFormatted === 'Employees-who-are-not-assigned-a-branch') {
                        paramFormatted = 'not-branch'
                    }
                    return url + '/find-employee/' + department + '/' + indexFormatted + '/' + paramFormatted
                    break;
                default:
                return url + '/find-employee/' + department + '/' + indexFormatted + '/all-branches'
                    break;
            }
        },
        getDataFromApi() {
            this.loading = true;

            axios.request({
                method: 'POST',
                data: {
                    department: this.$props.department
                },
                url: `${urls.EMPLOYEES_URL}DivisionsCard`
            }

            )

                .then((resp) => {
                    this.items = resp.data.data;
                    this.totalLength = resp.data.meta.count;
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
li {
    list-style: none;
}

a {
    font-size: 19px;
    text-decoration: underline;
    color: #0097A9 !important;
}

.branch-pressed {
    color: #512A44 !important;
}
</style>