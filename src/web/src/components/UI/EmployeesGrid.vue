<template>
    <v-data-table dense class="py-5 px-0 d-table" hide-default-footer :items="items" :headers="headers"
        :options.sync="options" :items-per-page="itemsPerPage" hide-default-header mobile-breakpoint="0">
        <template v-slot:header="{ props }">
            <th class="data-header py-3 pl-3 " v-for="head in props.headers">{{ head.text }}
            </th>
        </template>
        <template v-slot:body="{ items }">
            <tbody class="table-body">
                <tr :class="{ 'table-body-managers': item.level === 0, 'table-body-second-managers': item.level === 1 }"
                    class="table-border" v-for='(item, index, id ) in items' :key="id">
                    <td>
                        <a class="d-flex flex-wrap align-center" :style="getMargin(8, item.level)"
                            style="word-wrap: normal;" :href="urlEmployee(item.department, item.full_name_url)">
                            <IconLoader style="width:10px !important;" v-if="item.level === 1" :color2="'blue'"
                                :image="'circle'" class="angle-right">
                            </IconLoader>
                            <IconLoader style="width:10px !important;" v-if="item.level > 1" :size="item.level"
                                :color2="'white'" :color="'blue'" :image="'circle'" class="angle-right-multiple">
                            </IconLoader>
                            <label class="full-name">{{ item.formatted_name }}</label>
                        </a>
                    </td>
                    <td v-if="divisions === false" class="default-cursor"> {{ item.division }} </td>
                    <td class="default-cursor"> {{ item.title }} </td>
                    <td class="default-cursor"> {{ item.email }}</td>
                    <td class="default-cursor"> <a :href="getPhone(item.phone_office)"
                            :class="{ telephone: check === true, 'telephone-desktop': check === false }"> {{
                                item.phone_office
                            }} </a>
                    </td>
                </tr>
            </tbody>
        </template>

    </v-data-table>
</template>


<script>
import IconLoader from '../icons/IconLoader.vue'

export default {
    components: {
        IconLoader
    },

    props: ['items', 'department', 'check', 'divisions'],
    mounted() {
        
        if (this.divisions === false) {
            this.headers.splice(1,0,{ text: "Division", value: "division" },)
        }
    },
    data() {
        return {
            headers: [
                { text: "Name", value: "formatted_name" },
                { text: "Position", value: "title" },
                { text: "Email address", value: "email" },
                { text: "Phone number", value: "phone_office" },
                
            ],
            page: 1,
            pageCount: 0,
            itemsPerPage: 9999,
            itemsValue: null,
            selection: '',
            dataTableParam: 0,
            branch: '',
            breadcrumbsList: [],
            title: '',
            div: '',
            loading: false,
            search: "",
            options: {},
            totalLength: 0,
            divisionLength: 0,
        }
    },
    methods: {

        getMargin(baseMarginValue, level) {

            const total = baseMarginValue * level
            const object = {
                marginLeft: total + 'px'
            }
            return object
        },

        getPhone(number) {
            const find = "-";
            const reg = new RegExp(find, "g");
            const numberFormatted = number.replace(reg, "");
            const link = "tel:" + numberFormatted;

            if (this.mobileCheck === false) {
                return
            } else { return String(link); }
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
                return link.replace(/['"']+/g, '')
            } else {
                return location.replace(/['"']+/g, '')
            }
        },
        urlEmployee(department, name) {
            var find = ' ';
            var reg = new RegExp(find, 'g');
            return '/find-employee/employee-detail/' + department.replace(reg, '-') + '/' + name
        },
        capitalizeString(param) {
            const string = param
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
    }
}

</script>


<style scoped>
.full-name {
    cursor: pointer;
    margin-left: 3px;
}

.table-header {
    height: 300px !important;
}

.overf {
    z-index: 1;
    overflow: hidden;
}

.angle-right {
    width: 6px;
}

.angle-right-multiple {
    width: 5px;
}
</style>