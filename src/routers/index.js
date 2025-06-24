import { createWebHashHistory, createRouter } from "vue-router";
import useStore from "../store/index"

import Layout from "../views/Layout.vue";

const routes = [
  { path: "/login", component: () => import("../views/login/index.vue") },
  { 
    path: "/", 
    component: Layout,
    children: [
      {
        path: "",
        component: () => import("../views/home/index.vue")
      },
      {
        path: "classify",
        component: () => import("../views/classify/index.vue")
      },
      {
        path: "commodity",
        component: () => import("../views/commodity/index.vue")
      },
      {
        path: "person",
        component: () => import("../views/person/index.vue")
      },
    ]
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// router.beforeEach(((to, from, next) => {
//   const w = ["/login"];
//   const store = useStore()
//   if (!store.isLogin && !w.includes(to.path)) {
//     next("/login")
//     return
//   }
// }))

export default router