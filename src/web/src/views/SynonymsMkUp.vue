<template>
  <v-container>
    <v-card>
      <v-card-title>
        <h3>Synonyms</h3>
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
              Add
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-data-table
        checkbox-color="red"
        :headers="headers"
        :items="termsSynonym"
        :search="search"
        :loading="loadingTable"
      >
        <template v-slot:[`item.id`]="{ item }">
          <v-btn color="error" x-small>
            <v-icon small @click="DeleteSynonym(item.id)">mdi-delete</v-icon>
          </v-btn>
          &nbsp;&nbsp;
          <v-btn color="primary" x-small>
            <v-icon small @click="showDetails(item.id)">mdi-pencil</v-icon>
          </v-btn>
        </template>
        <template v-slot:item.synonyms="{ item, index }">
          <v-row>
            <v-col cols="10" align-self="center">
              <v-chip class="mx-1" small dark v-for="synonym, synIndex in item.synonyms" :key="'synonyms_'+synIndex">
                {{ synonym }}
              </v-chip>
            </v-col>
            <v-col cols="2">
              <v-btn rounded small color="primary" @click="openNewSynonym(index)">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-data-table>

    </v-card>
    
    <AddTermDialog
      :title="'New Synonym'"
      :dialog="showNewTerm"
      :close="closeNewTerm"
      :save="createSynonym"
    >
      <template v-slot:inputs>
        <v-row justify="start" align="center">
          <v-col cols="12">
            <v-select
              :items="termsList"
              v-model="selectedTerm"
              :disabled="selectTermDisabled"
              label="Terms"
              id="term-select"
              @change="changTerm"
            >
            </v-select>
            <v-btn
              color="primary"
              @click="showTermCreate"
            >
              Create a new term
            </v-btn>
          </v-col>

          <v-col cols="12" v-if="showTermInput">
            <v-text-field
							label="Term"
							v-model="newTermInput"
						>
						</v-text-field>
          </v-col>

          <v-col cols="12" v-if="showTermDuplicated">
            <p class="font-weight-bold" color="red">Term already exists</p>
          </v-col>

          <v-col cols="12">
            <v-text-field
							label="Synonym"
							v-model="newSynonym"
						>
						</v-text-field>
          </v-col>

          <v-col cols="12">
            <v-select
              :items="fieldTerms"
              label="Fields"
              multiple
              v-model="selectedFields"
            ></v-select>
            <v-btn
              color="primary"
              @click="showFieldCreate"
            >
              Add Field
            </v-btn>
          </v-col>

          <v-col cols="12" v-if="showFieldInput">
            <v-text-field
							label="Field"
							v-model="newFieldInput"
						>
						</v-text-field>
          </v-col>

          <v-col cols="12" v-if="showMessageSave">
            <p class="font-weight-bold" color="red">Enter required fields</p>
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
import { SYNONYMS_CREATE, TERMS_CREATE, SYNONYMS_FIELDS_CREATE } from "../urls";
import ConfirmDialog from "../components/ConfirmDialog.vue";

export default {
  components: {
    AddTermDialog,
    ConfirmDialog
  },
  data() {
    return {
      currentTermIndex: -1,
      showNewTerm: false,
      showNewSynonym: false,
      selectedTerm: null,
      newSynonym: "",
      newField: "",
      newTerm: {
        term: "",
        fields: [],
        synonyms: [],
      },
      search: '',
      headers: [
        {
          text: 'Synonym',
          align: 'start',
          filterable: true,
          value: 'synonym',
        },
        { text: 'Term', value: 'term', filterable: false },
        { text: 'Fields', value: 'field_id', filterable: false },
        { text: "", align: 'end', value: "id", sortable: false },
      ],
      termsSynonym: [],
      termsList: [],
      synonymFields: [],
      fieldTerms: [],
      termSelected: null,
      showRemove: false,
      paramsRemove: { title: "Confirm delete", message: "do you really want to delete this item permanently? " },
      idSynonym: null,
      showMessageSave: false,
      newTermInput: null,
      showTermInput: false,
      selectTermDisabled: false,
      loadingTable: false,
      showTermDuplicated: false,
      showFieldInput: false,
      newFieldInput: null,
      selectedFields: [],
    }
  },
  methods: {
    ...mapActions({
        getSynonyms: "getSynonyms",
        getTerms: "getTerms",
        deleteSynonym: "deleteSynonym",
        getSynonymFields: "getSynonymFields",
    }),
    filterFields(fields){
      let filteredElements = fields.filter(item => item.term_id === this.selectedTerm);
      const clean = filteredElements.map(({ term_id, term, ...rest }) => rest);

      let selectFields = clean.map(({ id, field_id, ...rest }) => ({
          ...rest,
          value: id,
          text: field_id
      }));

      return selectFields;
    },
    changTerm(){

      this.fieldTerms = this.filterFields(this.synonymFields);

    },
    showFieldCreate(){
      this.showFieldInput = this.showFieldInput ? false : true;
    },
    showTermCreate(){
      this.showTermInput = this.showTermInput ? false : true;
      this.newTermInput = null;
      this.selectedTerm = null;
      this.selectTermDisabled = this.selectTermDisabled ? false : true;
    },
    DeleteSynonym(id){
      this.idSynonym = id;
      this.showRemoveDialog();
    },
    showRemoveDialog() {
        this.showRemove = true;
    },
    showDetails(id) {
			//his.$router.push({ path: route });
      console.log(id);
		},
    getColor(calories) {
      if (calories > 400) return 'red'
      else if (calories > 200) return 'orange'
      else return 'green'
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
      this.showNewTerm = true;
      this.newSynonym = "";
      this.newField = "";
      this.newTerm = {
        term: "",
        fields: [],
        synonyms: [],
      };
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
      };

      this.newTermInput = null;
      this.selectedTerm = null;
      this.newSynonym = null;

      this.getSynonyms();

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
        this.newTerm.synonyms.push(trimmed);
        this.newSynonym = "";
      }
    },
    transformString(string) {
      const trimmed = string.trim();

      if(trimmed.length > 0) {
        
      }
    },
    deleteChip(type, ChipIndex) {
      if (type === "synonym" && ChipIndex >= 0) {
        this.newTerm.synonyms = this.newTerm.synonyms.filter((_, index) => ChipIndex !== index);
      } else if (type === "field") {
        this.newTerm.fields = this.newTerm.fields.filter((_, index) => ChipIndex !== index);
      }
    },
    createSynonym() {
      /*if (this.newTerm.term.length > 0) {
        this.termsSynonym.push({ ...this.newTerm });
        this.closeNewTerm();
      }*/

      if(this.newSynonym == ""){
        this.showMessageSave = true;
      }else{
        this.showMessageSave = false;
      }

      if(this.showMessageSave == false){

        var termId = this.selectedTerm;

        if(this.newTermInput !== null){

          const exists = this.termsList.some(item => item.text === this.newTermInput);

          if(!exists){
            this.showTermDuplicated = false;

            axios
            .post(TERMS_CREATE, {
                term: this.newTermInput
            })
            .then((resp) => {

              termId = resp.data.Id;

              let dataSynonym = {
                term_id: resp.data.Id,
                synonym: this.newSynonym
              };

              this.saveSynonym(dataSynonym);

              if(this.newFieldInput !== null){
                let dataFields = {
                    term_id: termId,
                    field_id: this.newFieldInput
                }

                this.saveField(dataFields);
              }

            })
            .catch((err) => console.error(err));

          }else{
            this.showTermDuplicated = true;
          }
        }else{

          let dataSynonym = {
              term_id: this.selectedTerm,
              synonym: this.newSynonym
          }

          this.saveSynonym(dataSynonym);

          this.selectedFields.forEach(value => {

            let dataFields = {
              term_id: termId,
              field_id: value
            }

            this.saveField(dataFields);
          });

        }

      }

      

    },
    saveSynonym(dataSynoyms) {

      console.log(dataSynoyms);

      axios
        .post(SYNONYMS_CREATE, dataSynoyms)
        .then((resp) => {
          console.log("saveSynonym");
          console.log(resp);
        })
        .catch((err) => console.error(err));
    },
    saveField(dataFields) {

      console.log(dataFields);

      axios
        .post(SYNONYMS_FIELDS_CREATE, dataFields)
        .then((resp) => {
          console.log("saveField");
          console.log(resp);
          this.closeNewTerm();
        })
        .catch((err) => console.error(err));
    },
    /*createSynonym() {
      if (this.currentTermIndex > -1) {
        this.termsSynonym[this.currentTermIndex].synonyms.push(this.newSynonym);
        this.closeNewSynonym();
      }
    },*/
    cancelDelete() {
      this.showRemove = false;
    },
    acceptDelete() {
      if (this.idSynonym !== null) {
        this.deleteSynonym(this.idSynonym);
        this.showRemove = false;
      }
    },
  },
  computed: {
    ...mapGetters([
      "synonyms",
      "terms",
      "fields",
    ]),
  },
  watch: {
    synonyms: function () {
      this.termsSynonym = [ ...this.synonyms ];
      //this.termsList = [ ...this.terms ];
    },
    terms: function () {
      this.termsSynonym = [ ...this.synonyms ];
    },
    fields: function () {
      this.synonymFields = [ ...this.synonyms ];
    },
  },
  async created() {
    this.loadingTable = true;
    await this.getSynonyms();
    await this.getTerms();
    await this.getSynonymFields();

    this.termsSynonym = [ ...this.synonyms ];
    this.termsList = [ ...this.terms ];
    this.synonymFields = [ ...this.fields ];

    this.loadingTable = false;
  },

}
</script>