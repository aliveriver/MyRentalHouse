import { createRouter, createWebHashHistory } from "vue-router";

import Layout from "../views/Layout.vue";

export const constantRoutes = [
  {
    path: "/",
    component: () => import("../views/home/index.vue"),
    meta: { title: "数据概览", icon: "DataAnalysis" },
  },
  {
    path: "/house/list",
    component: () => import("../views/house/list/index.vue"),
    meta: { title: "房源列表", icon: "House" },
  },
  {
    path: "/house/add",
    component: () => import("../views/house/list/add.vue"),
    meta: { title: "房源编辑", isHidden: true }
  },
  {
    path: "/house/detail/:id",
    component: () => import("../views/house/detail/index.vue"),
    meta: { title: "房源详情", isHidden: true }
  },
  {
    path: "/houseMap",
    component: () => import("../views/house/map/index.vue"),
    meta: { title: "地图找房", icon: "LocationInformation" },
  },
  {
    path: "/classify",
    component: () => import("../views/classify/index.vue"),
    meta: { title: "分类管理", icon: "Histogram" },
  },
  {
    path: "/commodity",
    component: () => import("../views/commodity/index.vue"),
    meta: { title: "商品管理", icon: "Briefcase" },
  },
  {
    path: "person",
    component: () => import("../views/person/index.vue"),
    meta: { title: "个人中心", icon: "Setting" },
  },
];

export const routes = [
  { path: "/login", component: () => import("../views/login/index.vue") },
  {
    path: "/",
    component: Layout,
    children: constantRoutes,
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

export default router;
