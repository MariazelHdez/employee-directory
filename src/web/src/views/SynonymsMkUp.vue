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

      <v-data-table checkbox-color="red" :headers="headers" :items="terms" :search="search">

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
      :title="'New Term'"
      :dialog="showNewTerm"
      :close="closeNewTerm"
      :save="saveTerm"
    >
      <template v-slot:inputs>
        <v-row justify="start" align="center">
          <v-col cols="12">
            <v-text-field
              label="Term*"
              v-model="newTerm.term"
            >
            </v-text-field>
          </v-col>
          <v-col cols="9">
            <v-text-field
              label="Field(s)*"
              v-model="newField"
            >
            </v-text-field>
          </v-col>
          <v-col cols="3">
            <v-btn @click="addToFields">
              Add field
            </v-btn>
          </v-col>
          <v-col cols="12" class="mb-2">
            <v-chip 
              close 
              v-for="item, index of newTerm.fields" 
              @click:close="deleteChip('field', index)"
              :key="index"
            >
              {{ item }}
            </v-chip>
          </v-col>
          <v-col cols="8">
            <v-text-field
              label="Synonyms*"
              v-model="newSynonym"
            >
            </v-text-field>
          </v-col>
          <v-col cols="4">
            <v-btn width="100%" @click="addToSynonyms">
              Add Synonym
            </v-btn>
          </v-col>
          <v-col cols="12" class="mb-2">
            <v-chip 
              close 
              v-for="item, index of newTerm.synonyms" 
              @click:close="deleteChip('synonym', index)"
              :key="index"
            >
              {{ item }}
            </v-chip>
          </v-col>
        </v-row>
      </template>
    </AddTermDialog>

    <AddTermDialog 
      :title="'New Synonym'"
      :dialog="showNewSynonym"
      :close="closeNewSynonym"
      :save="saveSynonym"
    >
      <template v-slot:inputs>
        <v-col cols="12">
          <v-text-field
            label="Synonym*"
            v-model="newSynonym"
          >
          </v-text-field>
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
      currentTermIndex: -1,
      showNewTerm: false,
      showNewSynonym: false,
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
          text: 'Term',
          align: 'start',
          filterable: true,
          value: 'term',
        },
        { text: 'Field(s)', value: 'fields', filterable: false },
        { text: 'Synonyms', value: 'synonyms', filterable: false },
      ],
      terms: [
        {
          term: "Assistant Deputy Minister",
          fields: ["Position"],
          synonyms: ["ADM",  "Assistant Deputy", "ADM",  " Deputy", "ADM",  "Assistant Deputy"]
        },
        {
          term: "Human Resources",
          fields: ["Position", "Branch", "Division"],
          synonyms: ["ADM",  "Assistant Deputy"]
        },
        {
          term: "Deputy Minister",
          fields: ["Position"],
          synonyms: ["DM"]
        },
        {
          term: "Health and Social Services",
          fields: ["Position", "Division"],
          synonyms: ["HSS",  "Health Services"]
        },
      ],
    }
  },
  methods: {
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
      this.showNewTerm = false;
      this.newSynonym = "";
      this.newField = "";
      this.newTerm = {
        term: "",
        fields: [],
        synonyms: [],
      };
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
    saveTerm() {
      if (this.newTerm.term.length > 0) {
        this.terms.push({ ...this.newTerm });
        this.closeNewTerm();
      }
    },
    saveSynonym() {
      if (this.currentTermIndex > -1) {
        this.terms[this.currentTermIndex].synonyms.push(this.newSynonym);
        this.closeNewSynonym();
      }
    }
  },

}
</script>