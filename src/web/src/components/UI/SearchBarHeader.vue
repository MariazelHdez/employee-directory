<template>
    <div class="full-width yellow-border white-bg pl-0 pt-5 find-employee">
        <v-container class="container-content">
            <h1 v-if="title !== null">Find a government employee</h1>
            <v-banner v-if="info" class="info_find-employee">
                <!--p>
                    <strong>I know who I am looking for</strong>
                    <ol>
                        <li>
                            Enter the employee's name, position title, email address or phone number in the search box. You can also select their department from the drop down, but this is optional.
                        </li>
                        <li>
                        Select the Search button to display the results.
                        </li>
                    </ol>
                </p>
                <p>
                    <strong>I am not sure who I need to contact - I want to browse</strong>
                    <br>
                    Scroll down the page and select the department you want to browse.
                </p-->
                <p>
                    Enter a person's name, position title, email or phone number in the search bar.
                </p>
            </v-banner>

            <v-form @submit.prevent="updateSearch">
                <v-row>
                        <v-row no-gutters class="center-search-bar">
                            <v-col cols="9" md="5" sm="8" xs="9">
                                <v-text-field class="input-with-button" :items="item" v-model="nameSearch" dense=""
                                    background-color="#F1F1F1" outlined="outlined" flat="" label="Keywords" solo>
                                </v-text-field>
                            </v-col>
                            <v-col cols="1"  md="1" sm="2">
                                <v-btn width="100%" class="mt-0 py-2" height="40px" type="submit" color="#ffcd57">
                                    <IconLoader height="20px" :image="'magnifying-glass'" :color="'black'" />
                                </v-btn>
                            </v-col>
                        </v-row>

                    <!--v-col class="mb-n6" sm="6" cols="12">
                        <v-text-field label="Keywords" v-model="nameSearch" dense="" background-color="#F1F1F1"
                            outlined="outlined" flat="" color="" solo>
                        </v-text-field>
                    </v-col>
                    <v-col class="mb-2" sm="6" cols="12">
                        <v-row no-gutters>
                            <v-col cols="9">
                                <v-select class="input-with-button" :items="item" v-model="departmentSearch" dense=""
                                    background-color="#F1F1F1" outlined="outlined" flat="" label="Department" solo>
                                </v-select>
                            </v-col>
                            <v-col cols="3">
                                <v-btn width="100%" class="mt-0 py-2" height="40px" type="submit" color="#ffcd57">
                                    <IconLoader height="20px" :image="'magnifying-glass'" :color="'black'" />
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col-->
                </v-row>
            </v-form>

        </v-container>
    </div>
</template>


<script>

const axios = require("axios");
import * as urls from "../../urls";
import IconLoader from "../icons/IconLoader.vue";

export default {
    components: {
        IconLoader
    },
    watch: {
        nameSearch() {
            if (this.nameSearch !== '') {
                this.nameError = false
            }
        },
        departmentSearch() {
            if (this.departmentSearch !== '') {
                this.dptError = false
            }
        }
    },
    created() {
        this.getEmployeesData()
    },
    data() {
        return {
            options: [],
            item: [],
            nameSearch: '',
            departmentSearch: '',
            nameError: false,
            dptError: false,
        }
    },
    props: ['info', 'title'],

    methods: {



        updateSearch() {
            const find = ' ';
            const reg = new RegExp(find, 'g');

            let name = this.nameSearch.replace(/\s+/g, '%20').trim()
            let department = this.departmentSearch.replace(reg, '-').replace(/\//g, '').toLowerCase()


            if (name === '' && department === '') {
                window.location.href = '/find-employee/search/keyword=any-employee&department=any-department'
            } else {
                if (department === '') {
                    window.location.href = '/find-employee/search/keyword=' + name + '&department=any-department'
                } else if (name === '') {
                    window.location.href = '/find-employee/' + department
                } else {
                    window.location.href = '/find-employee/search/keyword=' + name + '&department=' + department
                }
            }
        },
        getEmployeesData() {
            this.loading = true;

            axios
                .post(
                    `${urls.EMPLOYEES_URL}searchBar`,
                    this.options
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
    }



}

</script>

<style scoped>
.info_find-employee>>>.v-banner__wrapper {
    padding-left: 0 !important;
    padding-right: 0 !important;

}

@media (max-width:600px) {
    .find-employee {
        margin-top: -65px !important;
    }
}


.v-text-field>>>fieldset {
    border: 1.5px solid #ffcd57;

}

.input-with-button>>>fieldset {
    border-top-left-radius: 5px !important;
    border-bottom-left-radius: 5px !important;
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}

 button {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
    border-top-right-radius: 5px !important;
    border-bottom-right-radius: 5px !important;
    margin: 26px 0 !important;
} 
.center-search-bar{
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>