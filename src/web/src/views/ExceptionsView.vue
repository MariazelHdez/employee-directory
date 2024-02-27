<template>
    <v-container>
      <v-card>
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
    },
  
  }
  </script>