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
              Save changes
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
      <div class="col-12" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
        <draggable
          class="list-group"
          tag="ul"
          :list="backupTerms"
          @start="isDragging = true"
          @end="isDragging = false"
          @change="checkMovement($event)"
          v-bind="dragOptions"
        >
          <transition-group>
          <div
            class="list-group-item"
            v-for="item in terms"
            :key="item.weight"
          >
            <v-row no-gutters class="pa-1 drag-row">
              <v-icon
                small
                class="page__grab-icon mr-5"
                style="cursor:pointer"
              >
                mdi-arrow-all
              </v-icon>

              <div
                class="align-content-center"
                style="cursor:pointer"
              ><v-chip color="primary">{{ item.weight }}</v-chip>&nbsp;&nbsp;{{ item.description }}</div>
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
          </div>
          </transition-group>
        </draggable>
      </div>
      <v-row class="justify-center" v-if="stopFetch">
        <v-btn color="primary" @click="reloadFetch">
          Reload List
        </v-btn>
      </v-row>
    </v-card>

    <AddTermDialog 
    :title="'New Title'"
    :dialog="showNewTerm"
    :close="closeNewTerm"
    :save="saveTerm"
    >
      <template v-slot:inputs>
        <v-col cols="12">
          <v-autocomplete
            label="Title*"
            v-model="newItem.description"
            clearable
            :search-input.sync="search"
            :items="titleList"
            @click:clear="clearTitle"
          ></v-autocomplete>
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
        paramsRemove: { title: "Confirm delete", message: "Do you really want to delete this item permanently? " },
        currentToRemove: null,
        wasMoved: false,
        showNewTerm: false,
        drag: false,
        newTerm: "",
        newItem: {
          description: "",
          weight: 0
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
        titleList: [],
        search: null,
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
        reloadFetch: "reloadFetch",
        getEmployeeTitles: "getEmployeeTitles",
        getOriginalSortPositions: "getOriginalSortPositions",
      }),
      loadMore: function() {
        this.getSortPositions();
      },
      showRemoveDialog(item) {
        this.showRemove = true;
        this.currentToRemove = item;
      },
      cancelDelete() {
        this.showRemove = false;
        this.currentToRemove = null;

      },
      acceptDelete() {
        if (this.currentToRemove?.id) {
          this.deleteSortPosition(this.currentToRemove.id);
        }
      },
      openNewTerm() {
        this.showNewTerm = true;
        this.newItem.description = "";
      },
      closeNewTerm() {
        this.showNewTerm = false;
        this.newItem.description = "";
        this.titleList = [];
      },
      saveTerm() {
        const trimmed = this.newItem.description.trim();

        if (trimmed.length > 0) {
          this.newItem.description = trimmed;
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
        const oldweight = items[oldIndex].weight;

        items[newIndex] = this.terms[oldIndex];
        items[newIndex].weight = oldItem.weight;
        items[oldIndex] = oldItem;
        items[oldIndex].weight = oldweight;

        this.terms = [...items];
        this.backupTerms = [...items];

        this.addToNewSortPositions({ position: items[newIndex] });
        this.addToNewSortPositions({ position: items[oldIndex] });
      },
      reset() {
        this.refreshData();
        this.wasMoved = false;
        this.cleanNewSortPositions();
      },
      async refreshData() {
        this.terms = [];
        this.backupTerms = [];
        await this.getOriginalSortPositions();
        this.terms = [ ...this.sortPositions ];
        this.backupTerms = [ ...this.sortPositions ];
      },
      saveChanges() {
        this.reorderPositions();
        //this.refreshData();
      },
      searchTitle(term) {
        this.getEmployeeTitles(term);
        this.titleList = [ ...this.employeeTitles ];
      },
      clearTitle(){
        this.titleList = [];
      },
    },
    computed: {
      ...mapGetters([
        "sortPositions",
        "newSortPositions",
        "busy",
        "stopFetch",
        "employeeTitles"
      ]),
      dragOptions() {
        return {
          animation: 200,
          group: "description",
          disabled: false,
          ghostClass: "ghost"
        };
      }
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
        this.titleList = [ ...this.employeeTitles ];
      },
      search (val) {
        if(val !== null && val.length >= 3){
          this.searchTitle(val);
        }
      },
    },
    async created() {
      await this.getSortPositions();
      this.terms = [ ...this.sortPositions ];
      this.backupTerms = [ ...this.sortPositions ];
    },
    mounted() {
    },
  };
  </script>
  <style scoped>
  </style>