<template>
  <div class="home">
    <SearchBarHeader class="search-header" :title="null" />
    
    <Aurora/>

    <v-container class="px-0">

      <v-breadcrumbs class="mt-6 breadcrumbs ml-n5" :items="breadcrumbsList">
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item class="z-indx" :href="item.link">
            {{ $t(item.name) }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>

      <h1 class="my-16" style="font-weight:600 !important; font-size: 34px;">{{ $t("components.not_found.page_not_found") }}</h1>
      <v-card class="not-found-card mb-6" color="transparent" outlined>
        <h2>{{ $t("components.not_found.page_is_not_here.title") }}</h2>
        <p>{{ $t("components.not_found.page_is_not_here.body") }}</p>
      </v-card>
      <v-card class="not-found-card mb-6" color="transparent" outlined>
        <h2>{{ $t("components.not_found.reached_from_inside.title") }}</h2>
        <p>{{ $t("components.not_found.reached_from_inside.body.part1") }}<a
            :href="$t('yukon_urls.contact_government')">{{ $t("components.not_found.reached_from_inside.body.part2") }}</a>{{ $t("components.not_found.reached_from_inside.body.part3") }}</p>
      </v-card>
      <v-card class="not-found-card mb-6" color="transparent" outlined>
        <h2>{{ $t("components.not_found.reached_from_outside.title") }}</h2>
        <p>{{ $t("components.not_found.reached_from_outside.body.part1") }}<a
            :href="$t('yukon_urls.contact_government')">{{ $t("components.not_found.reached_from_outside.body.part2") }}</a>{{ $t("components.not_found.reached_from_outside.body.part3") }}</p>
      </v-card>
      <v-card class="not-found-card mb-6" color="transparent" outlined>
        <h2>{{ $t("components.not_found.address_wrong_message.title") }}</h2>
        <p>{{ $t("components.not_found.address_wrong_message.body") }}</p>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import Aurora from '../components/UI/Aurora.vue';
import SearchBarHeader from '../components/UI/SearchBarHeader.vue'

export default {
  components: {
    SearchBarHeader,
    Aurora
},
  data() {
    return {
      breadcrumbsList: [],
      noBgImg: false,
    }
  },
  watch: {
    options: {
      handler() {
        this.getEmployeesData();
      },
      '$route'() {
        this.breadcrumbsList = this.$route.meta.breadcrumb
      },
      deep: true,
    },
  },
  emits: ['changeBg'],
  mounted() {
    this.updateBreadCrumbs();
    this.$emit('changeBg');
  },
  methods: {
    updateBreadCrumbs() {
      this.breadcrumbsList = this.$route.meta.breadcrumb
    },
  },
}

</script>

<style scoped>
.not-found-card h2 {
  font-size: 26px;
}

a {
  text-decoration: underline;
}
</style>