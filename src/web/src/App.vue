<template>
  <v-app>
    <div id="app">
      <div class="text-center loading" v-show="loading">
        <v-progress-circular :size="75" color="primary" indeterminate>
          <span class="loadingText">Redirecting to logout platform</span>
        </v-progress-circular>
      </div>
      <v-navigation-drawer v-model="drawer" app :temporary="$vuetify.breakpoint.mdAndUp">
        <v-list class="mt-15">
          <v-list-item link @click="drawer = false">
            <v-list-item-icon>
              <v-icon>mdi-circle-small</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                <v-btn text href="/settings/synonyms" v-if="isAuthenticated">
                  Synonyms
                </v-btn>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link @click="drawer = false">
            <v-list-item-icon>
              <v-icon>mdi-circle-small</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                <v-btn text href="/settings/sorting" v-if="isAuthenticated">
                  Sorting
                </v-btn>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link @click="drawer = false">
            <v-list-item-icon>
              <v-icon>mdi-circle-small</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                <v-btn text href="/settings/exceptions" v-if="isAuthenticated">
                  Exceptions
                </v-btn>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link @click="drawer = false" class="mt-15">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                <v-btn v-if="isAuthenticated" @click="logout">
                  Logout
                </v-btn>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-app-bar flat height="77" max-height="77" class="shadow" color="white" elevation="2" dense>
        <v-app-bar-nav-icon @click="drawer = !drawer" v-show="!$vuetify.breakpoint.mdAndUp"></v-app-bar-nav-icon>
        <v-toolbar-title class="bar-title">
          <a :href="$t('yukon_urls.home') "><img src="/yukon.svg" style="margin-top:10px;" height="63" /></a>
          <v-progress-circular :class="loadingClass" indeterminate color="#f3b228" size="20" width="2" +
            class="ml-4"></v-progress-circular>
        </v-toolbar-title>
        <v-btn text href="/settings/synonyms" v-show="$vuetify.breakpoint.mdAndUp" v-if="isAuthenticated">
          Synonyms
        </v-btn>
        <v-btn text href="/settings/sorting" v-show="$vuetify.breakpoint.mdAndUp" v-if="isAuthenticated">
          Sorting
        </v-btn>
        <v-btn text href="/settings/exceptions" v-show="$vuetify.breakpoint.mdAndUp" v-if="isAuthenticated">
          Exceptions
        </v-btn>
        <v-btn text @click="toggleLocale(locale)" class="text-capitalize">
          {{ locale === 'en' ? 'Français' : 'English' }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="isAuthenticated" @click="logout" class="mr-10" v-show="$vuetify.breakpoint.mdAndUp">
          <v-icon>mdi-logout</v-icon>&nbsp;Logout
        </v-btn>
      </v-app-bar>
    </div>

    <v-main :class="{ 'no-bg-img': noBgImg === false }">
      <!-- Provides the application the proper gutter -->
      <v-container fluid id="container-main">
        <v-row id="container-row">
          <v-col>
            <router-view @changeBg="changeBackground"></router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <FeedbackForm v-if="showInMockUps()" />
    <v-footer class="mt-16" flat style="z-index: 10" padless height="70">
      <v-card class="flex " flat tile>
        <v-card-title class="py-16 header-container full-width" id="footer-bg">
          <v-container class="container-content">
            <img src="/logo-white.svg" style="margin: -8px 155px 0 0" height="44" />
          </v-container>
        </v-card-title>
        <v-divider></v-divider>

        <v-card class="footer-details">
          <v-container class="container container-content">

            <div class="d-flex justify-space-between links-to">

              <div class="d-flex flex-column pa-2">
                <a target="_blank" :href="$t('yukon_urls.home')">{{ $t("footer.sections.government") }}</a>
                <a target="_blank" :href="$t('yukon_urls.copyright')">{{ $t("footer.sections.copyright") }}</a>
                <a target="_blank" :href="$t('yukon_urls.disclaimer')">{{ $t("footer.sections.disclaimer") }}</a>
                <a target="_blank" :href="$t('yukon_urls.privacy_statement')">{{ $t("footer.sections.privacy")
                  }}</a>
              </div>
              <v-card-text class="white--text text-right">
                <span>© {{ new Date().getFullYear() }} <a href="/">{{ $t("footer.sections.government")
                    }}</a></span>
              </v-card-text>
            </div>
          </v-container>
        </v-card>

      </v-card>
    </v-footer>
    <ShowMessage></ShowMessage>
  </v-app>
</template>

<script>
import router from "./router";
//import { mapState } from "vuex";
import store from "./store";
import * as config from "./config";
import { mapState, mapGetters, mapActions } from "vuex";
import IconLoader from "./components/icons/IconLoader.vue";
import FeedbackForm from "./components/UI/FeedbackForm.vue";
import ShowMessage from "./components/ShowMessage.vue";

export default {
    name: "App",
    data: () => ({
        noBgImg: false,
        dialog: false,
        drawer: null,
        drawerRight: null,
        headerShow: false,
        menuShow: false,
        loadingClass: "d-none",
        applicationName: config.applicationName,
        applicationIcon: config.applicationIcon,
        sections: config.sections,
        loading: false,
    }),
    created: async function () {
    },
    watch: {},
    methods: {
        ...mapActions({
          loadLocale: "setLocale",
          changeLocale: "setCookieLocale"
        }),
        changeBackground() {
            this.noBgImg = false;
        },
        nav: function (location) {
            router.push(location);
        },
        toggleHeader: function () {
            this.headerShow = !this.headerShow;
        },
        toggleMenu: function () {
            this.menuShow = !this.menuShow;
        },
        showInMockUps() {
          let show = true;

          if (this.currentRouteName !== 'Synonyms' || this.currentRouteName !== 'Exceptions' || this.currentRouteName == 'Sorting') {
            show = false;
          }
          
          return show;
        },
        logout() {
          this.loading = true;
          this.$store.dispatch("signOut");
          this.loading = false;
      },
      toggleLocale: function () {
        const currentLocale = this.$cookies.get("locale");

        const newLocale = currentLocale === "en" ? "fr" : "en";

        this.$cookies.set("locale", newLocale);
        this.loadLocale(newLocale);
        this.$i18n.locale = newLocale;
      },
    },
    components: { IconLoader, FeedbackForm, ShowMessage },
    mounted() {
      if (this.$cookies.isKey("locale")) {
        const locale = this.$cookies.get("locale");
        this.loadLocale(locale);
        this.$i18n.locale = locale;
      } else {
        this.$cookies.set("locale", "en");
        this.$i18n.locale = "en";
      }
    },
    computed: {
      ...mapGetters(["isAuthenticated", "locale"]),
      currentRouteName() {
        return this.$route.name;
      }
    }
};
</script>

<style>
.menu-button {
  color: black !important;
  font-weight: 500;
}

.no-bg-img {
  background: white !important;
}

.header-container {
  width: 100%;
  margin: 0 auto;
  padding: 12px 24px;
}

@media (min-width:1070px) {
  .header-container {
    width: 1170px;
  }
}

.flex-end {
  display: flex;
  justify-content: start;
  align-items: center;
  align-content: center;
}

.v-text-field>>>fieldset {
  border: 1.5px solid #F3A901;
}

.v-app-bar,
.shadow {
  box-shadow: 1px 3px 16px 0px rgba(163, 163, 163, 1) !important;
  -webkit-box-shadow: 1px 3px 16px 0px rgba(163, 163, 163, 1) !important;
  -moz-box-shadow: 1px 3px 16px 0px rgba(163, 163, 163, 1) !important;
}

.v-app-bar {
  z-index: 10000;
}

.search-header {
  z-index: 2;
}

.index-text {
  text-decoration: underline;
  color: #000000 !important;
}

.divisions-text {
  color: #0097A9 !important;
  font-size: 16px !important;

  text-decoration: underline;
}

.v-banner span {
  font-weight: 700;
}

.full-width {
  width: 100vw;
  position: relative;
  left: calc(-50vw + 50%);
}


.yellow-border {
  border-bottom: 3px #ffcd57 solid;
}

.white-bg {
  background-color: white;
}

.gray-bg {
  background-color: #EDEDED;
}

@media (min-width: 1170px) {
  .container-content {
    width: 1170px !important;
  }
}

.container-content {
  width: 100%;
  padding: 12px 24px;
}



@media (max-width: 755px) {
  .search-responsive {
    padding: 12px 24px !important;

    margin: 0 auto !important;
    width: 90%;
  }

}

.width-100 {
  width: 100%;
}

.data-header {
  background-color: #DC4405;
  text-align: left;
  color: white;
}

.table-body td {
  padding: 1rem 1rem !important;
}

.table-body a {
  text-decoration: underline;
}

.table-body-managers {
  font-weight: 700;
}

.table-body .employees a {
  padding-left: 1rem !important;
}

.table-body .table-border {
  border-bottom: none !important;
}

.table-body tr:nth-child(odd) {
  background-color: #EDEDED;
}

.links-to div a {
  white-space: nowrap;
}

@media screen and (max-width: 530px) {
  .links-to div a {
    text-align: center;
  }
  .links-to {
    flex-direction: column;
    justify-content: center;
  }
  .links-to div:nth-child(2) {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
  }
}

@media (min-width: 1904px) {
  .small-container {
    max-width: 1185px !important;
  }
}
</style>
