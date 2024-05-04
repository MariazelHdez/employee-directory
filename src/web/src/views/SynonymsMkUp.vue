<template>
  <v-container>
    <v-row no-gutters justify="space-between" class="mb-5">
      <v-breadcrumbs class="breadcrumbs px-0" color="dark" :items="breadcrumbsList">
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item :href="item.link">
            {{ item.name }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>
    </v-row>
    <v-card>
      <v-card-title>
        <h3>Synonym terms</h3>
      </v-card-title>
      <v-card-title>
        <v-row no-gutters justify="space-between" align="center">
          <v-col cols="12" md="6">
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2" align-self="center">
            <v-btn color="primary" width="100%" @click="openNewTerm">
              <v-icon>mdi-plus</v-icon>
              Create
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="termsSynonym"
        :search="search"
        :loading="loadingTable"
        item-key="term_id"
      >

        <template v-slot:[`item.synonyms_fields_name_array`]="{ item }">
          <v-chip
            v-for="(field, index) in (item.synonyms_fields_name_array)"
            :key="index"
            class="ma-1"
            color="primary"
            text-color="white">
            {{ field }}
          </v-chip>
        </template>

        <template v-slot:[`item.synonym_array`]="{ item }">
          <v-chip
            v-for="(field, index) in (item.synonym_array)"
            :key="index"
            class="ma-1"
            color="primary"
            text-color="white">
            {{ field }}
          </v-chip>
        </template>

        <template v-slot:[`item.term_id`]="{ item }">
          <v-btn color="primary" x-small>
            <v-icon small @click="editSynonym(item.term_id)">mdi-pencil</v-icon>
          </v-btn>
          &nbsp;&nbsp;
          <v-btn color="error" x-small>
            <v-icon small @click="DeleteSynonym(item.term_id)">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <AddTermDialog
      :title="dialogTitle"
      :dialog="showNewTerm"
      :close="closeNewTerm"
      :save="createSynonym"
      width="unset"
    >
      <template v-slot:inputs>
        <v-row justify="start" align="center">
          <v-col cols="12">
            <v-text-field
							label="Term"
							v-model="newTermInput"
						>
						</v-text-field>
          </v-col>

          <v-col cols="12" v-if="showMessageSave">
            <p class="font-weight-bold red--text" ><v-icon class="red--text">mdi-alert</v-icon>Term is required</p>
          </v-col>

          <v-col cols="12" v-if="showTermDuplicated">
            <p class="font-weight-bold red--text" ><v-icon class="red--text">mdi-alert</v-icon>Term already exists</p>
          </v-col>

          <v-col cols="9">
            <v-text-field
              label="Synonym(s)*"
              v-model="newSynonym"
              hint="Click the button to Add a new Synonym"
              persistent-hint
            >
            </v-text-field>
          </v-col>

          <v-col cols="3">
            <v-btn @click="addToSynonyms" color="primary">
              <v-icon>mdi-plus</v-icon>&nbsp;Add Synonym
            </v-btn>
          </v-col>
          <v-col cols="12" class="mb-2" v-if="actionType === 'C'">
            <v-chip
              close
              v-for="item, index of newTerm.synonyms"
              @click:close="deleteChip('synonym', index)"
              :key="index"
              :disabled="item.disabled"
            >
              {{ item.value }}
            </v-chip>
          </v-col>

          <v-col cols="12" class="mb-2" v-else>
            <v-chip
              close
              v-for="item, index of newTerm.synonyms"
              @click:close="deleteChip('synonym', index)"
              :key="index"
            >
              {{ item }}
            </v-chip>
          </v-col>

          <v-col cols="12" class="mb-2">
            <v-select
              v-model="selectedFields"
              :items="newTerm.fieldsSelect"
              label="Field(s)*"
              multiple
              chips
              hint="Select the corresponding fields"
              persistent-hint
            ></v-select>
          </v-col>

          <v-col cols="12" v-if="showMessageFieldsSelect">
            <p class="font-weight-bold red--text" ><v-icon class="red--text">mdi-alert</v-icon>Select synonym fields</p>
          </v-col>

          <!--v-col cols="12" class="mb-2">
            <v-checkbox
              label="Add New Fields"
              color="primary"
              @click="showFieldCreate"
              v-model="checkedField"
            ></v-checkbox>
          </v-col>

          <v-col cols="9" v-if="showFieldInput">
            <v-text-field
              label="New Field(s)"
              v-model="newField"
              hint="Click the button to Add a new Field"
              persistent-hint
            >
            </v-text-field>
          </v-col>

          <v-col cols="3" v-if="showFieldInput">
            <v-btn @click="addToFields" color="primary">
              <v-icon>mdi-plus</v-icon>&nbsp;Add field
            </v-btn>
          </v-col>

          <v-col cols="12" class="mb-2" v-if="showFieldInput">
            <v-chip
              close
              v-for="item, index of newTerm.fields"
              @click:close="deleteChip('field', index)"
              :key="index"
            >
              {{ item }}
            </v-chip>
          </v-col-->

          <v-col cols="12" v-if="showMessageField">
            <p class="font-weight-bold red--text" ><v-icon class="red--text">mdi-alert</v-icon>Fields are required for new terms</p>
          </v-col>

          <v-col cols="12" v-if="showUpdateValidation">
            <p class="font-weight-bold red--text" ><v-icon class="red--text">mdi-alert</v-icon>Synonyms or fields must not be empty</p>
          </v-col>
        </v-row>

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
import { SYNONYMS_CREATE, TERMS_CREATE, SYNONYMS_FIELDS_CREATE, SYNONYMS_UPDATE, TERMS_UPDATE } from "../urls";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import store from "../store";
import * as urls from "../urls";

export default {
  components: {
    AddTermDialog,
    ConfirmDialog
  },
  data() {
    return {
      currentTermIndex: -1,
      dialogTitle: "",
      showNewTerm: false,
      showNewSynonym: false,
      selectedTerm: null,
      newSynonym: "",
      newField: "",
      newTerm: {
        term: "",
        fields: [],
        synonyms: [],
        fieldsSelect: [],
      },
      search: '',
      headers: [
        { text: 'Term', value: 'term', filterable: true },
        { text: 'Fields', value: 'synonyms_fields_name_array', filterable: false, sortable: false },
        {
          text: 'Synonym',
          align: 'start',
          filterable: false,
          value: 'synonym_array',
        },
        { text: "Actions", align: 'end', value: "term_id", filterable: false, sortable: false },
      ],
      termsSynonym: [],
      termsList: [],
      synonymFields: [],
      fieldTerms: [],
      fieldSynonyms: [],
      synonymsList: [],
      employeeFields: [],
      termSelected: null,
      showRemove: false,
      paramsRemove: { title: "Delete Term",
                      message: "Do you really want to delete this item permanently? Synonyms and Fields attached to this term will be deleted too."
                    },
      idSynonym: null,
      showMessageSave: false,
      showMessageSynonym: false,
      showMessageField: false,
      showMessageFieldsSelect: false,
      newTermInput: null,
      showTermInput: false,
      selectTermDisabled: false,
      selectFieldDisabled: false,
      loadingTable: false,
      showTermDuplicated: false,
      showFieldInput: false,
      newFieldInput: null,
      selectedFields: [],
      originalSelectedFields: [],
      actionType: '',
      checkedField: false,
      showUpdateValidation: false,
      selectedField: null,
      breadcrumbsList: this.$route.meta.breadcrumb,
    }
  },
  methods: {
    ...mapActions({
        getSynonyms: "getSynonyms",
        getSynonymsList: "getSynonymsList",
        getTerms: "getTerms",
        deleteSynonym: "deleteSynonym",
        getSynonymFields: "getSynonymFields",
        deleteSynonymFieldByTerm: "deleteSynonymFieldByTerm",
        deleteTerm: "deleteTerm",
        deleteSynonymByTerm: "deleteSynonymByTerm",
        deleteSynonymFieldByValues: "deleteSynonymFieldByValues",
        deleteSynonymByValues: "deleteSynonymByValues",
        deleteFieldsBatch: "deleteFieldsBatch",
        refreshSynonyms:"refreshSynonyms",
        getEmployeeFields: "getEmployeeFields",
        UpdateTerm: "UpdateTerm",
    }),
    filterFields(fields, type){
      let filteredElements = [];
      var fieldIds = [];
      var trackedIds = {};

      if(type == 'F'){

        filteredElements = fields.filter(item => item.term_id === this.selectedTerm);
        var clean = filteredElements.map(({ term_id, term, ...rest }) => rest);
        fieldIds = clean.map(item => (item.field_id));

      } else if(type == 'S'){

        fields.forEach(item => {
          if (item.term_id === this.selectedTerm && !trackedIds[item.id]) {
              trackedIds[item.id] = true;
              fieldIds.push(item.synonym);
          }
        });

      }

      return fieldIds;
    },
    changeTerm(){
      this.newTerm.term = "";
      this.newTerm.fields = [];
      this.newTerm.synonyms = [];

      this.fieldTerms = this.filterFields(this.synonymFields, 'F');

      if (this.fieldTerms.length > 0) {
        this.selectedFields.push(...this.fieldTerms);
        this.originalSelectedFields.push(...this.fieldTerms);
        this.newField = "";
      }

      this.fieldSynonyms = this.filterFields(this.synonymsList, 'S');

      this.fieldSynonyms.forEach(value => {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
          this.newTerm.synonyms.push({ value: trimmed, disabled: true });
          this.newField = "";
        }
      });

    },
    showFieldCreate(){
      this.showFieldInput = this.showFieldInput ? false : true;
      this.newTerm.fields = [];
    },
    showTermCreate(){
      this.showTermInput = this.showTermInput ? false : true;
      this.newTermInput = null;
      this.selectedTerm = null;
      this.selectTermDisabled = this.selectTermDisabled ? false : true;
      this.selectFieldDisabled = this.selectFieldDisabled ? false : true;
      this.newTerm.term = "";
      this.newTerm.fields = [];
      this.newTerm.synonyms = [];

      this.checkedField = this.checkedField ? false : true;
      this.showFieldInput = this.showFieldInput ? false : true;
    },
    DeleteSynonym(id){
      this.idSynonym = id;
      this.showRemoveDialog();
    },
    showRemoveDialog() {
        this.showRemove = true;
    },
    editSynonym(id) {
      this.actionType = 'U';
      this.dialogTitle = "Edit Synonym terms";
      this.idSynonym = id;
      this.selectTermDisabled = true;
      this.selectFieldDisabled = false;
      this.newTerm.fieldsSelect = this.employeeFields;

      const synonym = this.termsSynonym.find(item => item.term_id === id);

      let filteredElements = this.synonymFields.filter(item => item.term_id === id);
      let clean = filteredElements.map(({ term_id, term, ...rest }) => rest);
      let fieldIds = clean.map(item => (item.field_id));

      if (fieldIds.length > 0) {
        this.selectedFields.push(...fieldIds);
        this.originalSelectedFields.push(...fieldIds);
        this.newField = "";
      }

      this.selectedTerm = synonym.term_id;
      this.newTermInput = synonym.term;

      let synonyms = synonym.synonym.split(',');

      synonyms.forEach(value => {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
          this.newTerm.synonyms.push(trimmed);
          this.newField = "";
        }
      });

      this.showNewTerm = true;
		},
    openNewSynonym(index) {
      this.currentTermIndex = index;
      this.showNewSynonym = true;
      this.newSynonym = "";
    },
    closeNewSynonym() {
      this.currentTermIndex = -1;
      this.showNewSynonym = false;
      this.newSynonym = "";
    },
    openNewTerm() {
      this.actionType = 'C';
      this.dialogTitle = "New Synonym terms";
      this.showNewTerm = true;
      this.newSynonym = "";
      this.newField = "";
      this.newTerm = {
        term: "",
        fields: [],
        synonyms: [],
        fieldsSelect: [],
      };
      this.newTerm.fieldsSelect = this.employeeFields;
    },
    closeNewTerm() {
      this.loadingTable = true;

      this.showNewTerm = false;
      this.newSynonym = "";
      this.newField = "";
      this.newTerm = {
        term: "",
        fields: [],
        synonyms: [],
        fieldsSelect: [],
      };
      this.checkedField = false;
      this.showFieldInput = false;
      this.newTermInput = null;
      this.newSynonym = null;
      this.showTermInput = false;
      this.newTermInput = null;
      this.selectedTerm = null;
      this.selectTermDisabled = false;
      this.selectFieldDisabled = false;
      this.selectedFields = [];
      this.showMessageSave = false;
      this.showMessageField = false;
      this.showMessageSynonym = false;
      this.showMessageFieldsSelect = false;

      this.loadingTable = false;
    },
    addToFields() {
      const trimmed = this.newField.trim();
      if (trimmed.length > 0) {

        this.newTerm.fields.push(trimmed);

        this.newField = "";
      }
    },
    addToSynonyms() {
      const trimmed = this.newSynonym.trim();
      if (trimmed.length > 0) {

        if(this.actionType == 'C'){
          this.newTerm.synonyms.push({ value: trimmed, disabled: false });
        }else{
          this.newTerm.synonyms.push(trimmed);
        }

        this.newSynonym = "";
      }

    },
    deleteChip(type, ChipIndex) {
      if (type === "synonym" && ChipIndex >= 0) {
        this.newTerm.synonyms = this.newTerm.synonyms.filter((_, index) => ChipIndex !== index);
      } else if (type === "field") {
        this.newTerm.fields = this.newTerm.fields.filter((_, index) => ChipIndex !== index);
      }
    },
    async createSynonym() {

      if (this.actionType == 'U'){
        if(this.selectedFields.length > 0 && this.newTerm.synonyms.length > 0){
          this.showUpdateValidation = false;
          this.updateSynonym();
        }else{
          this.showUpdateValidation = true;
        }
      }else if(this.actionType == 'C'){

        let validations = await this.validateCreation();

        if(validations){
          await this.saveSynonymFields();
          this.closeNewTerm();
        }
      }

    },
    saveSynonym(dataSynoyms) {
      axios
        .post(SYNONYMS_CREATE, dataSynoyms)
        .then((resp) => {
          this.$store.dispatch('showSnackBar', { message: "Synonym saved", status: "success" });
          this.$store.dispatch('getSynonyms');
        })
        .catch((err) => console.error(err));
    },
    saveField(dataFields) {
      axios
        .post(SYNONYMS_FIELDS_CREATE, dataFields)
        .then((resp) => {
          console.log(resp);
          this.$store.dispatch('getSynonyms');
        })
        .catch((err) => console.error(err));
    },
    saveFieldSynonyms(dataSynoyms) {
      axios
        .post(SYNONYMS_CREATE, dataSynoyms)
        .then((resp) => {
          this.$store.dispatch('showSnackBar', { message: "Synonym saved", status: "success" });
          this.$store.dispatch('getSynonyms');
        })
        .catch((err) => console.error(err));
    },
    validateCreation() {

      if(this.newTermInput == null){
        this.showMessageSave = true;
      }else{
        this.showMessageSave = false;
      }

      if (this.selectedFields.length == 0) {
        this.showMessageField = true;
      }else{
        this.showMessageField = false;
      }

      if(this.newTerm.synonyms.length == 0){
        this.showMessageSynonym = true;
      }else{
        this.showMessageSynonym = false;
      }

      return !this.showMessageSave && !this.showMessageField && !this.showMessageSynonym && !this.showMessageFieldsSelect;

    },
    saveSynonymFields() {

          var termId = this.selectedTerm;

          if(this.newTermInput !== null){

            const exists = this.termsList.some(item => item.text === this.newTermInput);

            if(!exists){
              this.showTermDuplicated = false;
              const createSynonyms = this.newTerm.synonyms;
              const selectedFields = this.selectedFields;

              axios
              .post(TERMS_CREATE, {
                  term: this.newTermInput
              })
              .then((resp) => {

                termId = resp.data.Id;

                if (selectedFields.length > 0) {

                  selectedFields.forEach(value => {
                      let dataFields = {
                        term_id: termId,
                        field_id: value
                      }

                      this.saveField(dataFields);
                  });

                }

                if (createSynonyms.length > 0) {

                  createSynonyms.forEach(value => {
                    if(value.disabled == false){
                      let dataFields = {
                        term_id: termId,
                        synonym: value.value
                      }

                      this.saveSynonym(dataFields);
                    }
                  });

                }

              })
              .catch((err) => console.error(err));

            }else{
              this.showTermDuplicated = true;
            }
          }else{

            const addedFields = this.selectedFields.filter(item => !this.originalSelectedFields.includes(item));

            if (this.selectedFields.length > 0) {
              this.updateFields(this.selectedFields);
            }

            if (addedFields.length > 0) {

              addedFields.forEach(value => {

                  let dataFields = {
                    term_id: termId,
                    field_id: value
                  }

                  this.saveField(dataFields);
              });

            }

            if (this.newTerm.synonyms.length > 0) {

              this.newTerm.synonyms.forEach(value => {
                if(value.disabled == false){
                  let dataFields = {
                    term_id: termId,
                    synonym: value.value
                  }

                  this.saveSynonym(dataFields);
                }
              });

            }

          }

        this.refreshData();
    },
    updateFields(selectedFields) {

      const removed = this.originalSelectedFields.filter(item => !selectedFields.includes(item));

      const deletedFields = this.synonymFields.filter(item =>
            removed.includes(item.field_id) && item.term_id === this.selectedTerm
        ).map(item => item.id);

      if (deletedFields.length > 0) {
        this.deleteFieldsBatch(deletedFields);
      }

    },
    updateSynonym() {

      const synonym = this.termsSynonym.find(item => item.term_id === this.idSynonym);
      const originalSynonyms = synonym.synonym.split(',').map(item => item.trim());

      const deletedFieldsSynonym = this.findDifference(originalSynonyms.map(String), this.newTerm.synonyms.map(String));
      const addedFieldsSynonym = this.findDifference(this.newTerm.synonyms.map(String), originalSynonyms.map(String));

      const addedFields = this.selectedFields.filter(item => !this.originalSelectedFields.includes(item));
      const removedFields = this.originalSelectedFields.filter(item => !this.selectedFields.includes(item));

      if (removedFields.length > 0) {
        removedFields.forEach(value => {

          let dataFields = {
            term_id: synonym.term_id,
            field_id: value
          }

          this.deleteSynonymFieldByValues(dataFields);
        });

      }

      if (deletedFieldsSynonym.length > 0) {
        deletedFieldsSynonym.forEach(value => {
          let dataFields = {
            term_id: synonym.term_id,
            synonym: value
          }

          this.deleteSynonymByValues(dataFields);
        });

      }

      if (addedFields.length > 0) {
        addedFields.forEach(value => {
          let dataFields = {
            term_id: synonym.term_id,
            field_id: value
          }

          this.saveField(dataFields)
        });

      }

      if (addedFieldsSynonym.length > 0) {
        addedFieldsSynonym.forEach(value => {
          let dataFields = {
            term_id: synonym.term_id,
            synonym: value
          }

          this.saveFieldSynonyms(dataFields)
        });

      }

      let termData = {
          id: this.idSynonym,
          term: this.newTermInput
      }

      this.UpdateTerm({ termId: this.idSynonym, termData });

      let dataSynonym = {
          term_id: this.selectedTerm,
          synonym: this.newSynonym
      }

      axios
        .patch(`${SYNONYMS_UPDATE}/${this.idSynonym}`, dataSynonym)
        .then((resp) => {

          this.$store.dispatch('showSnackBar', { message: "Synonym updated", status: "success" });

          this.closeNewTerm();

          this.refreshData();
        })
        .catch((err) => console.error(err));

    },
    async refreshData() {
      this.termsSynonym = [];
      this.termsList = [];
      this.synonymFields = [];
      this.synonymsList = [];
      this.employeeFields = [];

      this.$store.commit('SET_SYNONYMS', []);
      this.$store.commit('SET_TERMS', []);
      this.$store.commit('SET_FIELDS', []);
      this.$store.commit('SET_SYNONYMS_LIST', []);
      this.$store.commit('SET_EMPLOYEE_FIELDS', []);

      await this.$store.dispatch('getSynonyms');
      await this.$store.dispatch('getSynonymsList');
      await this.$store.dispatch('getTerms');
      await this.$store.dispatch('getSynonymFields');
      await this.$store.dispatch('getEmployeeFields');

      this.termsSynonym = [...this.$store.getters.synonyms];
      this.termsList = [...this.$store.getters.terms];
      this.synonymFields = [...this.$store.getters.fields];
      this.synonymsList = [...this.$store.getters.listSynonyms];
      this.employeeFields = [...this.$store.getters.employeeFieldsList];
    },
    findDifference(arr1, arr2) {
      return arr1.filter(item => !arr2.includes(item));
    },
    cancelDelete() {
      this.showRemove = false;
    },
    acceptDelete() {
      if (this.idSynonym !== null) {

        this.deleteSynonymFieldByTerm(this.idSynonym);
        this.deleteSynonymByTerm(this.idSynonym);
        this.deleteTerm(this.idSynonym);

        this.refreshData();

        this.showRemove = false;
      }
    },
  },
  computed: {
    ...mapGetters([
      "synonyms",
      "terms",
      "fields",
      "listSynonyms",
      "employeeFieldsList",
    ]),
  },
  watch: {
    '$route'() {
      this.breadcrumbsList = this.$route.meta.breadcrumb
    },
    synonyms: function () {
      this.termsSynonym = [ ...this.synonyms ];
    },
    terms: function () {
      this.termsSynonym = [ ...this.terms ];
    },
    fields: function () {
      this.synonymFields = [ ...this.fields ];
    },
    listSynonyms: function () {
      this.synonymsList = [ ...this.listSynonyms ];
    },
    employeeFieldsList: function () {
      this.employeeFields = [ ...this.employeeFieldsList ];
    },
  },
  async created() {
    this.loadingTable = true;

    await this.getSynonyms();
    await this.getSynonymsList();
    await this.getTerms();
    await this.getSynonymFields();
    await this.getEmployeeFields();

    this.termsSynonym = [ ...this.synonyms ];
    this.termsList = [ ...this.terms ];
    this.synonymFields = [ ...this.fields ];
    this.synonymsList = [ ...this.listSynonyms ];
    this.employeeFields = [ ...this.employeeFieldsList ];

    this.loadingTable = false;
  },

}
</script>