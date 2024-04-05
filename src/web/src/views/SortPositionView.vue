<template>
  <v-container>
    <v-card>
      <v-card-title>
        <h3>Sort Positions</h3>
      </v-card-title>
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
              <v-row no-gutters>
                <v-icon
                  small
                  class="page__grab-icon mr-5"
                >
                  mdi-arrow-all
                </v-icon>

                <div class="align-content-center">{{ item.Description }}</div>
                <v-spacer></v-spacer>
                <v-btn
                  color="error"
                  x-small
                  @click="showRemoveDialog(item)"
                >
                  <v-icon
                    small
                  >
                    mdi-delete
                  </v-icon>
                </v-btn>
              </v-row>
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
            v-model="newItem.Description"
          >
          </v-text-field>
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
  import draggable from "vuedraggable";
  import AddTermDialog from '../components/AddDialog.vue';
  import { mapActions, mapGetters } from "vuex";
  import ConfirmDialog from "../components/ConfirmDialog.vue";
  export default {
    components: {
      draggable,
      AddTermDialog,
      ConfirmDialog,
    },
    data() {
      return {
        showRemove: false,
        paramsRemove: { title: "Confirm delete", message: "do you really want to delete this item permanently? " },
        currentToRemove: null,
        wasMoved: false,
        showNewTerm: false,
        drag: false,
        newTerm: "",
        newItem: {
          Description: "",
          Weight: 0
        },
        headers: [
          {
            text: 'Term',
            align: 'start',
            filterable: true,
            sortable: false,
            value: 'term',
          },
        ],
        terms: [],
        backupTerms: [],
      };
    },
    methods: {
      ...mapActions({
        getSortPositions: "getSortPositions",
        addToNewSortPositions: "addToNewSortPositions",
        cleanNewSortPositions: "cleanNewSortPositions",
        reorderPositions: "postNewSortPositions",
        insertSortPosition: "insertSortPosition",
        deleteSortPosition: "deleteSortPosition",
      }),
      showRemoveDialog(item) {
        this.showRemove = true;
        this.currentToRemove = item;
      },
      cancelDelete() {
        this.showRemove = false;
        this.currentToRemove = null;

      },
      acceptDelete() {
        if (this.currentToRemove?.Id) {
          this.deleteSortPosition(this.currentToRemove.Id);
        }
      },
      openNewTerm() {
        this.showNewTerm = true;
        this.newItem.Description = "";
      },
      closeNewTerm() {
        this.showNewTerm = false;
        this.newItem.Description = "";
      },
      saveTerm() {
        const trimmed = this.newItem.Description.trim();
        
        if (trimmed.length > 0) {
          this.newItem.Description = trimmed;
          this.insertSortPosition({sortPosition: { ...this.newItem } });
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
        const oldWeight = items[oldIndex].Weight;

        items[newIndex] = this.terms[oldIndex];
        items[newIndex].Weight = oldItem.Weight;
        items[oldIndex] = oldItem;
        items[oldIndex].Weight = oldWeight;

        this.terms = [...items];

        this.addToNewSortPositions({ position: items[newIndex] });
        this.addToNewSortPositions({ position: items[oldIndex] });
      },
      reset() {
        this.terms = [ ...this.backupTerms ];
        this.wasMoved = false;
        this.cleanNewSortPositions();
      },
      saveChanges() {
        this.reorderPositions();
      },
    },
    computed: {
      ...mapGetters([
        "sortPositions",
        "newSortPositions",
      ]),
    },
    watch: {
      sortPositions: function () {
        this.terms = [ ...this.sortPositions ];
        this.backupTerms = [ ...this.sortPositions ];
        this.wasMoved = false;
        this.cleanNewSortPositions();
        this.closeNewTerm();
        this.showRemove = false;
        this.currentToRemove = null;
      }
    },
    async created() {
      await this.getSortPositions();
      this.terms = [ ...this.sortPositions ];
      this.backupTerms = [ ...this.sortPositions ];
    },
  };
  </script>
  <style scoped>
  </style>