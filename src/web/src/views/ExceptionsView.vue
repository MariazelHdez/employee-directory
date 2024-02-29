<template>
    <v-container>
      <v-card>
        <v-card-title>
          <h3>Exceptions</h3>
        </v-card-title>
        <v-card-title>
          <v-row no-gutters justify="space-between" align="center">
            <v-col cols="12" md="6">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="2" align-self="center">
              <v-btn color="primary" width="100%" @click="openNewItem">
                <v-icon>mdi-plus</v-icon>
                Add
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
  
        <v-data-table checkbox-color="red" :headers="headers" :items="terms" :search="search">
  
          <template v-slot:item.hidden_fields="{ item, index }">
            <v-row>
              <v-col cols="10" align-self="center">
                <v-chip class="mx-1" small dark v-for="value, fdIndex in item.hidden_fields" :key="'field'+fdIndex">
                  {{ hiddenFieldsList.find((field) => field.id === Number(value)).text }}
                </v-chip>
              <v-chip class="mx-1" small @click="openNewHiddenField(index)">
                <v-icon>
                  mdi-plus
                </v-icon>
              </v-chip>
              </v-col>
              <!-- <v-col cols="2">
                <v-btn rounded small color="primary" @click="openNewItem(index)">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col> -->
            </v-row>
          </template>
        </v-data-table>
  
      </v-card>
  
      <AddTermDialog 
        :title="'New Employee or Position'"
        :dialog="showNewItem"
        :close="closeNewItem"
        :save="saveNewItem"
      >
        <template v-slot:inputs>
          <v-col cols="12">
            <v-text-field
              label="Employee or Position*"
              v-model="newItem.position"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12">
            <v-select
              :items="hiddenFieldsList"
              multiple
              v-model="newItem.hidden_fields"
              item-value="id"
            >
            </v-select>
          </v-col>
        </template>
      </AddTermDialog>

      <AddTermDialog 
        :title="'New Hidden Field(s)'"
        :dialog="showNewHiddenField"
        :close="closeNewHiddenField"
        :save="saveNewHiddenField"
      >
        <template v-slot:inputs>
          <v-col cols="12">
            <v-select
              :items="hiddenFieldsList"
              multiple
              v-model="newHiddenFields"
              item-value="id"
            >
            </v-select>
          </v-col>
        </template>
      </AddTermDialog>
    </v-container>
  </template>
  
  <script>
  import AddTermDialog from '../components/AddDialog.vue'
  export default {
    components: {
      AddTermDialog,
    },
    data() {
      return {

        currentItemIndex: -1,
        showNewHiddenField: false,
        showNewItem: false,
        newItem: {
          position: "",
          fields: [],
        },
        newHiddenFields: [],
        search: '',
        headers: [
          {
            text: 'Employee / Position',
            align: 'start',
            filterable: true,
            value: 'position',
          },
          { text: 'Hidden field(s)', value: 'hidden_fields', sortable: false },
        ],
        terms: [
          {
            position: "Assistant Deputy Minister",
            hidden_fields: [4],
          },
          {
            position: "Human Resources",
            hidden_fields: [12],
          },
          {
            position: "Deputy Minister",
            hidden_fields: [10, 16, 12],
          },
          {
            position: "Terri McLeod",
            hidden_fields: [10],
          },
          {
            position: "Sean McLeish",
            hidden_fields: [16],
          },
        ],
        hiddenFieldsList: [
          { id: 1,  value: "full_name",    text: "full name" },
          { id: 2,  value: "first_name",   text: "first name" },
          { id: 3,  value: "last_name",    text: "last name" },
          { id: 4,  value: "organization", text: "organization" },
          { id: 5,  value: "department",   text: "department" },
          { id: 6,  value: "division",     text: "division" },
          { id: 7,  value: "branch",       text: "branch" },
          { id: 8,  value: "unit",         text: "unit" },
          { id: 9,  value: "title",        text: "title" },
          { id: 10, value: "email",        text: "email" },
          { id: 11, value: "suite",        text: "suite" },
          { id: 12, value: "phone_office", text: "phone office" },
          { id: 13, value: "fax_office",   text: "fax office" },
          { id: 14, value: "mobile",       text: "mobile" },
          { id: 15, value: "office",       text: "office" },
          { id: 16, value: "address",      text: "address" },
          { id: 17, value: "po_box",       text: "po box" },
          { id: 18, value: "community",    text: "community" },
          { id: 19, value: "postal_code",  text: "postal code" },
          { id: 20, value: "mailcode",     text: "mailcode" }
        ]
      }
    },
    methods: {
      getColor(calories) {
        if (calories > 400) return 'red'
        else if (calories > 200) return 'orange'
        else return 'green'
      },
      saveNewItem() {
        this.terms.push({ ...this.newItem });
        this.closeNewItem();
      },
      openNewItem() {
        this.showNewItem = true;
        this.newItem = {
          position: "",
          hidden_fields: [],
        };
      },
      closeNewItem() {
        this.showNewItem = false;
        this.newItem = {
          position: "",
          hidden_fields: [],
        };
      },
      openNewHiddenField(index) {
        this.currentItemIndex = index;
        this.showNewHiddenField = true;
        this.newHiddenFields = [...this.terms[index].hidden_fields];
      },
      closeNewHiddenField() {
        this.showNewHiddenField = false;
        this.newHiddenFields = [];
      },
      saveNewHiddenField() {
        this.terms[this.currentItemIndex].hidden_fields = [...this.newHiddenFields];
        this.newHiddenFields = [];
        this.closeNewHiddenField();
      },
    },
  
  }
  </script>