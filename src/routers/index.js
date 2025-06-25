import { createRouter, createWebHashHistory } from "vue-router";

import Layout from "../views/Layout.vue";

export const constantRoutes = (() => {
  const adminRouter = [
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
      path: "/person",
      component: () => import("../views/person/index.vue"),
      meta: { title: "个人中心", icon: "Setting" },
    },
  ];

  const userRoutes = [
    {
      path: "/house/info",
      component: () => import("../views/house/info/index.vue"),
      meta: { title: "房源资讯", icon: "Tickets" },
    },
    {
      path: "/house/detail/:id",
      component: () => import("../views/house/detail/index.vue"),
      meta: { title: "房源详情", isHidden: true }
    },
    {
      path: "/person",
      component: () => import("../views/person/index.vue"),
      meta: { title: "个人中心", icon: "Setting" },
    },
  ]
  return userRoutes
})();

export const routes = [
  { path: "/login", component: () => import("../views/login/index.vue") },
  { path: "/register", component: () => import("../views/register/index.vue") },
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

// 路由守卫
// router.beforeEach((to, from, next) => {
//   const whiteList = ["/login", "/register"]; // 白名单，不需要登录即可访问
//   const store = useStore();
  
//   // 检查token是否存在
//   const token = localStorage.getItem('token');
  
//   // 检查记住密码功能
//   const rememberMe = localStorage.getItem('rememberMe');
//   const rememberUntil = localStorage.getItem('rememberUntil');
  
//   if (token) {
//     // 如果有token，检查是否过期（针对记住密码功能）
//     if (rememberMe && rememberUntil) {
//       if (Date.now() > parseInt(rememberUntil)) {
//         // 记住密码已过期，清除相关数据
//         localStorage.removeItem('token');
//         localStorage.removeItem('rememberMe');
//         localStorage.removeItem('rememberUntil');
//         store.logout();
        
//         if (!whiteList.includes(to.path)) {
//           next("/login");
//           return;
//         }
//       }
//     }
    
//     // 设置登录状态
//     store.setIsLogin(true);
    
//     // 如果已登录用户访问登录页，重定向到首页
//     if (to.path === "/login") {
//       next("/");
//       return;
//     }
//   } else {
//     // 没有token，清除登录状态
//     store.setIsLogin(false);
    
//     // 如果访问的不是白名单页面，重定向到登录页
//     if (!whiteList.includes(to.path)) {
//       // next("/login");
//       return;
//     }
//   }
  
//   next();
// });

export default router;
