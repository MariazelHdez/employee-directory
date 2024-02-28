<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row no-gutters justify="end" align="center">
          <v-col cols="12" md="2" align-self="center">
            <v-btn :disabled="!wasMoved" color="secondary" width="100%" @click="reset">
              Reset
            </v-btn>
          </v-col>
          <v-col cols="12" md="1" align-self="center">
          </v-col>
          <v-col cols="12" md="2" align-self="center">
            <v-btn :disabled="!wasMoved" color="secondary" width="100%" @click="saveChanges">
              save changes
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="4" align-self="center">
            <v-btn color="primary" width="100%" @click="openNewTerm">
              <v-icon>mdi-plus</v-icon>
              Add
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-data-table
      :headers="headers"
      :items="terms"
      item-key="id"
      :show-select="false"
      :disable-pagination="true"
      :hide-default-footer="true"
      class="page__table"
    >
      <template v-slot:body="props">
        <draggable
          :list="props.items"
          tag="tbody"
          @start="drag=true" 
          @end="drag=false"
          @change="checkMovement($event)"
        >
          <tr
            v-for="(item, index) in props.items"
            :key="index"
          >
            <td>
              <v-icon
                small
                class="page__grab-icon mr-5"
              >
                mdi-arrow-all
              </v-icon>

              {{ item.term }} 

            </td>
          </tr>
        </draggable>
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
        <v-col cols="12">
          <v-text-field
            label="Term*"
            v-model="newTerm"
          >
          </v-text-field>
        </v-col>
      </template>
    </AddTermDialog>
  </v-container>
  </template>
  
  <script>
  import draggable from "vuedraggable";
  import AddTermDialog from '../components/AddDialog.vue';
  export default {
    components: {
      draggable,
      AddTermDialog
    },
    data() {
      return {
        wasMoved: false,
        showNewTerm: false,
        drag: false,
        newTerm: "",
        headers: [
          {
            text: 'Term',
            align: 'start',
            filterable: true,
            sortable: false,
            value: 'term',
          },
        ],
        terms: [
          { term: "Administrative assistante" },
          { term: "Administrative Coordinator" },
          { term: "Administrative Finance Clerk" },
          { term: "Administrative Research Assistant" },
          { term: "Admission/Assessment Coordinator" },
          { term: "Wildlife Harvest Biologist" },
          { term: "Wildlife Harvest Specialist" },
          { term: "Wildlife Viewing Specialist" },
          { term: "Airports Duty Manager" },
          { term: "YGS Student" },
          { term: "YHC - Community Manager RR" },
          { term: "YHC - Housing Manager Watson Lake" },
        ],
        backupTerms: [],
      };
    },
    methods: {
      openNewTerm() {
        this.showNewTerm = true;
        this.newTerm = "";
      },
      closeNewTerm() {
        this.showNewTerm = false;
        this.newTerm = "";
      },
      saveTerm() {
        const trimmed = this.newTerm.trim();
        
        if (trimmed.length > 0) {
          this.terms.push({ term: trimmed });
          this.wasMoved = true;
          this.closeNewTerm();
        }
      },
      checkMovement(e) {
        this.wasMoved = true;
        const { oldIndex, newIndex } = e.moved;
        this.switchItems(oldIndex, newIndex);
      },
      switchItems(oldIndex, newIndex) {
        const items = [...this.terms];
        const oldItem = items[newIndex];
        
        items[newIndex] = this.terms[oldIndex];
        items[oldIndex] = oldItem;

        this.terms = [...items];
      },
      reset() {
        this.terms = [ ...this.backupTerms ];
        this.wasMoved = false;
      },
      saveChanges() {
        this.backupTerms = [ ...this.terms ];
        this.wasMoved = false;
      },
    },
    mounted() {
      this.backupTerms = [ ...this.terms ];
    },
  };
  </script>
  <style scoped>
  </style>