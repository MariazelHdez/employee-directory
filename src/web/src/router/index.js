import Vue from "vue";
import VueRouter from "vue-router";
import NotFound from "../views/NotFound.vue";
import Grid from "../components/Grid";
import Employees from "../components/Employees";
import Department from "../components/Department";
import EmployeeDetail from "../components/EmployeeDetail";
import EmployeeSearch from "../components/EmployeeSearch";
import SynonymsMkUp from '@/views/SynonymsMkUp'
import ExceptionsView from '@/views/ExceptionsView'
import SortPositionView from '@/views/SortPositionView'
import store from "../store";
import LoginView from '@/views/LoginView';
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: {name: "Find a government employee"}
  },
  {
    path: "/settings/login",
    name: "Login",
    component: LoginView,
    meta: {
      requiresAuth: false,
      isLogin: true,
    },
  },
  {
    path: "/settings/synonyms",
    name: "Synonyms",
    component: SynonymsMkUp,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {name: 'Yukon.ca home', link: 'https://yukon.ca/'},
        {name: 'Find a government employee', link: '/Find-Employee'},
        {name: 'Synonyms terms'},
      ],
    },
  },
  {
    path: "/settings/exceptions",
    name: "Exceptions",
    component: ExceptionsView,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {name: 'Yukon.ca home', link: 'https://yukon.ca/'},
        {name: 'Find a government employee', link: '/Find-Employee'},
        {name: 'Exceptions'},
      ],
    },
  },
  {
    path: "/settings/sorting",
    name: "Sorting",
    component: SortPositionView,
    meta: {
      requiresAuth: true,
      breadcrumb: [
        {name: 'Yukon.ca home', link: 'https://yukon.ca/'},
        {name: 'Find a government employee', link: '/Find-Employee'},
        {name: 'Sort positions'},
      ],
    },
  },
  {
    path: "/find-Employee/employee-detail/:department/:full_name",
    name: "Employee Detail",
    component: EmployeeDetail,
    meta: {
      breadcrumb: [
        {name: 'Yukon.ca home', link: 'https://yukon.ca/'},
        {name: 'Find a government employee', link: '/Find-Employee'},
        {name: 'Department', link: '/find-employee/Department' , dynamic: true},
        {name: 'Division', link: '/find-employee/Department/Division' , dynamic: true},
        {name: 'Branch', link: '/find-employee/Department/Division/Branch' , dynamic: true},
        {name: 'Username', dynamic: true}
      ]
    }
  },
  {
    path: "/find-employee/search/keyword=:full_name&department=:department?",
    name: "Search Employee",
    component: EmployeeSearch,
    meta: {
      breadcrumb: [
        {name: 'Yukon.ca home', link: 'https://yukon.ca/'},
        {name: 'Find a government employee', link: '/Find-Employee'},
        {name: 'Department', link: '/find-employee/Department' , dynamic: true},
        {name: 'Search', dynamic: true},
      ]
    }
  },
  {
    path: "/find-employee/:department/:division/:branch?", 
    name: "Data grid",
    component: Grid,
    meta: {
      breadcrumb: [
        {name: 'Yukon.ca home', link: 'https://yukon.ca/'},
        {name: 'Find a government employee', link: '/find-employee'},
        {name: 'Department', link: '/find-employee/Department', dynamic: true},
        {name: 'Division', link: '/find-employee/Department/Division', dynamic: true},
        {name: 'Branch', dynamic: true}
      ]
    }
  },
  {
    path: "/find-employee/:department",
    name: "Department",
    component: Department,
    
    meta: {
      breadcrumb: [
        {name: 'Yukon.ca home', link: 'https://yukon.ca/'},
        {name: 'Find a government employee', link: '/find-employee'},
        {name: 'Department', dynamic: true}
      ]
    }
  },
  {
    path: "*",
    name: "Not Found",
    component: NotFound,
    meta: {
      breadcrumb: [
        {name: 'Yukon.ca home', link: 'https://yukon.ca/'},
        {name: 'Find Employee', link: `/find-employee`},
        {name: 'Page not found'},
      ]
    }
  },
  {
    path: "/find-employee/",
    name: "Find a government employee",
    component: Employees,
    child: [

    ],
    meta: {
      breadcrumb: [
        {name: 'Yukon.ca home', link: 'https://yukon.ca/'},
        {name: 'Find a government employee'},
      ]
    }
  },
];


const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  
});

router.beforeEach(async (to, from, next) => {

  const requiresAuth = to.meta.requiresAuth || false;
  const isLogin = to.meta.isLogin || false;

  if (!requiresAuth && !isLogin) {
    return next();
  }

  await store.dispatch('checkAuthentication');
  const isAuthenticated = store.getters.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
  // if (requiresAuth) {
    console.log("You aren't authenticated, redirecting to sign-in");
    
    return next('/settings/login'); 
  }
  if (isLogin && isAuthenticated) {
    return next('/settings/synonyms'); 
  }

  

  return next();
});

export default router;
