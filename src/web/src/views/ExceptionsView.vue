<template>
    <v-container>
      <v-card>
        <v-card-title>
          <h3>Exceptions</h3>
        </v-card-title>
        <v-card-title>
          <div class="text-center loading" v-show="loading">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
          </div>
          <v-row no-gutters justify="space-between" align="center">
            <v-col cols="12" md="6">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="2" align-self="center">
              <v-btn color="primary" width="100%" @click="openNewItem">
                <v-icon>mdi-plus</v-icon>
                Add Exception
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
  
        <v-data-table
          :headers="headers"
          :items="exceptionsList"
          :search="search"
          :loading="loadingTable"
        >
          <template v-slot:item.FieldNameArray="{ item, index }">
              <v-chip
                dark
                class="mx-1"
                v-for="value, fdIndex in item.FieldNameArray"
                :key="'field'+fdIndex"
                @click:close="deleteChip(index, value)"
              >
                {{ value }}
              </v-chip>
          </template>
  
          <template v-slot:item.id="{ item, index }">
            <v-btn color="primary" x-small>
              <v-icon small @click="editField(index, item.IdArray)">mdi-pencil</v-icon>
            </v-btn>
            &nbsp;&nbsp;
            <v-btn color="error" x-small>
              <v-icon small @click="deleteField(item.IdArray)">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
  
      </v-card>
  
      <AddTermDialog 
        :title="'New Exception'"
        :dialog="showCreate"
        :close="closeCreate"
        :save="saveException"
      >
        <template v-slot:inputs>
          <v-col cols="12">
            <v-text-field
              label="Employee mail(*)"
              v-model="newItem.EmailAddress"
              :rules="rules"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              label="Description(*)"
              v-model="newItem.description"
              :rules="requiredRules"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12">
            <v-select
              :items="employeeFields"
              multiple
              v-model="newItem.fields"
              chips
              hint="Select the corresponding fields"
              persistent-hint
              :rules="requiredRules"
            >
            </v-select>
          </v-col>
          <v-col cols="12" v-if="showMessageCreate">
            <p class="font-weight-bold red--text" ><v-icon class="red--text">mdi-alert</v-icon>Fill the required fields</p>
          </v-col>
        </template>
      </AddTermDialog>

      <AddTermDialog
        :title="'Edit Exception'"
        :dialog="showEdit"
        :close="closeEdit"
        :save="saveEdit"
      >
        <template v-slot:inputs>
          <v-col cols="12">
            <v-text-field
              label="Employee mail(*)"
              v-model="newItem.EmailAddress"
              :rules="rules"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              label="Description(*)"
              v-model="newItem.description"
              :rules="requiredRules"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12">
            <v-select
              :items="employeeFields"
              multiple
              v-model="newItem.fields"
              chips
              hint="Select the corresponding fields"
              persistent-hint
              :rules="requiredRules"
            >
            </v-select>
          </v-col>
        </template>
      </AddTermDialog>

      <ConfirmDialog
        :show="showRemove"
        :params="paramsRemove"
        :cancel="cancelDelete"
        :accept="acceptDelete"
      >
      </ConfirmDialog>

    </v-container>
  </template>

  <script>
  const axios = require("axios");
  import AddTermDialog from '../components/AddDialog.vue';
  import { mapActions, mapGetters } from "vuex";
  import store from "../store";
  import ConfirmDialog from "../components/ConfirmDialog.vue";
  import { EXCEPTIONS_UPDATE } from "../urls";

  export default {
    components: {
      AddTermDialog,
      ConfirmDialog,
    },
    data() {
      return {
        currentItemIndex: -1,
        loading: false,
        showEdit: false,
        showCreate: false,
        newItem: {
          EmailAddress: "",
          fields: [],
          description: "",
        },
        selectedFields: [],
        search: '',
        headers: [
          {
            text: 'Email Address',
            align: 'start',
            filterable: true,
            value: 'EmailAddress',
          },
          {
            text: 'Description',
            align: 'start',
            filterable: true,
            value: 'Description',
          },
          { text: 'Hidden field(s)', value: 'FieldNameArray', sortable: false },
          { text: "Actions", align: 'center', value: "id", filterable: false, sortable: false },
        ],
        rules: [
          value => !!value || 'Required.',
          value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
          },
        ],
        requiredRules: [
          value => !!value || 'Required.'
        ],
        loadingTable: false,
        exceptionsList: [],
        exceptionsOriginalList: [],
        employeeFields: [],
        showMessageCreate: false,
        showRemove: false,
        paramsRemove: {
          title: "Delete Exception",
          message: "Do you really want to delete this exception permanently?"
        },
        idExceptions: [],
      }
    },
    methods: {
      ...mapActions({
        getExceptions: "getExceptions",
        getEmployeeFields: "getEmployeeFields",
        insertException: "insertException",
        deleteExceptionBatch: "deleteExceptionBatch",
        updateExceptionsBatch: "updateExceptionsBatch",
      }),
      deleteChip(ChipIndex, value) {
        this.terms[ChipIndex].hidden_fields = this.terms[ChipIndex].hidden_fields.filter((item) => item !== value);
      },
      validateCreateException() {
        let emailRule = this.rules.every(rule => rule(this.newItem.EmailAddress) === true);
        let descriptionRule = this.requiredRules.every(rule => rule(this.newItem.description) === true);
        let hasFields = this.newItem.fields.length > 0;

        return emailRule && descriptionRule && hasFields;
      },
      saveException() {
        let validateCreate = this.validateCreateException();

        if(validateCreate){
          this.loading = true;
          this.loadingTable = true;
          this.showMessageCreate = false;

          const ExceptionData = this.newItem.fields.map(fieldId => ({
              EmailAddress: this.newItem.EmailAddress,
              description: this.newItem.description,
              FieldId: fieldId
          }));

          this.insertException(ExceptionData);
          this.closeCreate();

          this.loading = false;
          this.loadingTable = false;
        }else{
          this.showMessageCreate = true;
        }
      },
      openNewItem() {
        this.showCreate = true;
        this.newItem = {
          EmailAddress: "",
          fields: [],
          description: "",
        };
      },
      closeCreate() {
        this.showCreate = false;
        this.newItem = {
          EmailAddress: "",
          fields: [],
          description: "",
        };
      },
      editField(index, ids) {
        this.currentItemIndex = index;
        this.showEdit = true;

        this.newItem.EmailAddress = this.exceptionsList[index].EmailAddress;
        this.newItem.fields = this.exceptionsList[index].FieldIdArray;
        this.newItem.description = this.exceptionsList[index].Description;
        this.newItem.idExceptions = this.exceptionsList[index].Fields;

        this.idExceptions = [...ids];
      },
      closeEdit() {
        this.showEdit = false;
        this.selectedFields = [];
        this.idExceptions = [];
        this.newItem = {
          EmailAddress: "",
          fields: [],
          description: "",
        };
      },
      saveEdit() {

        const addedFields = this.newItem.fields.filter(fieldId => 
            !this.newItem.idExceptions.some(exception => exception.FieldId === fieldId)
        ).map(fieldId => ({
            fieldId: fieldId,
            Description: this.newItem.description,
            EmailAddress: this.newItem.EmailAddress
        }));

        const deletedFields = this.newItem.idExceptions.filter(exception => 
            !this.newItem.fields.includes(exception.FieldId)
        ).map(exception => exception.ID);

        const updatedExceptions = this.newItem.idExceptions
        .filter(exception => this.newItem.fields.includes(exception.FieldId))
        .map(exception => ({
            ID: exception.ID,
            EmailAddress: this.newItem.EmailAddress,
            Description: this.newItem.description,
            FieldId: exception.FieldId
        }));

        if (updatedExceptions.length > 0) {
          updatedExceptions.forEach(function(exception, index) {
            axios
            .patch(`${EXCEPTIONS_UPDATE}/${exception.ID}`, exception)
            .then((resp) => {
            })
            .catch((err) => console.error(err));
          });
        }

        if(addedFields.length > 0){
          this.insertException(addedFields);
        }

        if(deletedFields.length > 0){
          this.deleteExceptionBatch(deletedFields);
        }

        this.$store.dispatch('getExceptions');
        this.closeEdit();
      },
      deleteField(ids){
        this.idExceptions = [...ids];
        this.showRemove = true;
      },
      cancelDelete() {
        this.showRemove = false;
        this.idExceptions = [];
      },
      acceptDelete() {
        if (this.idExceptions.length > 0) {
          this.deleteExceptionBatch(this.idExceptions);
          this.showRemove = false;
        }
      },
    },
    computed: {
      ...mapGetters([
        "employeeFieldsList",
        "exceptions",
        "originalExceptions",
      ]),
    },
    watch: {
      exceptions: function () {
        this.exceptionsList = [ ...this.exceptions ];
      },
      employeeFieldsList: function () {
        this.employeeFields = [ ...this.employeeFieldsList ];
      },
      originalExceptions: function () {
        this.exceptionsOriginalList = [ ...this.originalExceptions ];
      },
    },
  async created() {
    this.loadingTable = true;

    await this.getExceptions();
    await this.getEmployeeFields();

    this.exceptionsList = [ ...this.exceptions ];
    this.employeeFields = [ ...this.employeeFieldsList ];
    this.exceptionsOriginalList = [ ...this.originalExceptions ];

    this.loadingTable = false;
  },
  
  }
  </script>