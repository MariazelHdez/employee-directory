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
        <h3>Sort Positions</h3>
      </v-card-title>
      <v-card-title>
        <div class="text-center loading" v-show="loading">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
        </div>
        <v-row no-gutters justify="end" align="center">
          <v-col cols="12" md="2" align-self="center">
            <v-btn
              :disabled="!wasMoved"
              color="secondary"
              width="100%"
              @click="reset"
            >
              Reset
            </v-btn>
          </v-col>
          <v-col cols="12" md="1" align-self="center">
          </v-col>
          <v-col cols="12" md="2" align-self="center">
            <v-btn
              :disabled="!wasMoved"
              color="secondary"
              width="100%"
              @click="saveChanges"
            >
              Save Changes
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
  import { mapActions, mapGetters, mapMutations } from "vuex";
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
        loading: false,
        breadcrumbsList: this.$route.meta.breadcrumb,
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
      ...mapMutations([
        'SET_NEW_SORT_POSITIONS'
      ]),
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
      async acceptDelete() {
        if (this.currentToRemove?.id) {
          this.loading = true;

          await this.deleteSortPosition(this.currentToRemove.id);

          if(this.stopFetch == true){
            window.scrollTo(0, 0);
            this.refreshData();
          }

          this.loading = false;
          this.showRemove = false;
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
      async saveTerm() {
        const trimmed = this.newItem.description.trim();

        if (trimmed.length > 0) {
          this.loading = true;
          this.newItem.description = trimmed;
          await this.insertSortPosition({sortPosition: { ...this.newItem } });

          if(this.stopFetch == true){
            this.reset();
          }

          this.loading = false;
          this.showNewTerm = false;
        }
      },
      checkMovement(e) {
        this.wasMoved = true;
        const { oldIndex, newIndex } = e.moved;

        this.switchItems(oldIndex, newIndex);
      },
      switchItems(fromIndex, toIndex) {
          const items = [...this.terms];

          if (fromIndex === toIndex) return;

          const element = items[fromIndex];
          const targetWeight = items[toIndex].weight;
          const originalWeight = element.weight;

          items.splice(fromIndex, 1);

          if (fromIndex < toIndex) {
              toIndex -= 1;
          }

          items.splice(toIndex, 0, element);
          element.weight = targetWeight;
          items[toIndex].weight = originalWeight;
          const sortedWeights = items.map(item => item.weight).sort((a, b) => a - b);

          for (let i = 0; i < items.length; i++) {
              items[i].weight = sortedWeights[i];
          }

          this.terms = [...items];
          this.backupTerms = [...items];
          this.$store.commit('SET_SORT_POSITIONS', [...items]);
      },
      reset() {
        this.loading = true;
        this.refreshData();
        this.wasMoved = false;
        this.cleanNewSortPositions();
        this.loading = false;
      },
      async refreshData() {
        this.terms = [];
        this.backupTerms = [];
        await this.getOriginalSortPositions();
        this.terms = [ ...this.sortPositions ];
        this.backupTerms = [ ...this.sortPositions ];
      },
      saveChanges() {
        this.loading = true;
        this.reorderPositions();
        this.wasMoved = false;
        this.loading = false;
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
        "employeeTitles",
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
      '$route'() {
        this.breadcrumbsList = this.$route.meta.breadcrumb
      },
      sortPositions: function () {
        this.terms = [ ...this.sortPositions ];
        this.backupTerms = [ ...this.sortPositions ];
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