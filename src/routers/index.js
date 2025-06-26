import { createRouter, createWebHashHistory } from "vue-router";

import Layout from "../views/Layout.vue";

// 管理员路由
export const adminRoutes = [
  {
    path: "/",
    component: () => import("../views/home/index.vue"),
    meta: { title: "数据概览", icon: "DataAnalysis", roles: ['卖家'] },
  },
  {
    path: "/house/list",
    component: () => import("../views/house/list/index.vue"),
    meta: { title: "房源列表", icon: "House", roles: ['卖家'] },
  },
  {
    path: "/house/add",
    component: () => import("../views/house/list/add.vue"),
    meta: { title: "房源编辑", isHidden: true, roles: ['卖家'] }
  },
  {
    path: "/house/detail/:id",
    component: () => import("../views/house/detail/index.vue"),
    meta: { title: "房源详情", isHidden: true, roles: ['卖家', 'user'] }
  },
  {
    path: "/houseMap",
    component: () => import("../views/house/map/index.vue"),
    meta: { title: "地图找房", icon: "LocationInformation", roles: ['卖家'] },
  },
  {
    path: "/classify",
    component: () => import("../views/classify/index.vue"),
    meta: { title: "分类管理", icon: "Histogram", roles: ['卖家'] },
  },
  {
    path: "/commodity",
    component: () => import("../views/commodity/index.vue"),
    meta: { title: "商品管理", icon: "Briefcase", roles: ['卖家'] },
  },
  {
    path: "/person",
    component: () => import("../views/person/index.vue"),
    meta: { title: "个人中心", icon: "Setting", roles: ['卖家', 'user'] },
  },
];

// 普通用户路由
export const userRoutes = [
  {
    path: "/house/info",
    component: () => import("../views/house/info/index.vue"),
    meta: { title: "房源资讯", icon: "Tickets", roles: ['user'] },
  },
  {
    path: "/house/detail/:id",
    component: () => import("../views/house/detail/index.vue"),
    meta: { title: "房源详情", isHidden: true, roles: ['卖家', 'user'] }
  },
  {
    path: "/person",
    component: () => import("../views/person/index.vue"),
    meta: { title: "个人中心", icon: "Setting", roles: ['卖家', 'user'] },
  },
];

// 基础路由（所有用户都可以访问）
export const baseRoutes = [
  {
    path: "/person",
    component: () => import("../views/person/index.vue"),
    meta: { title: "个人中心", icon: "Setting", roles: ['卖家', 'user'] },
  },
];

// 初始路由（空数组，将在登录后动态添加）
export const constantRoutes = [];

// 基础静态路由
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

// 动态添加路由的函数
export const addDynamicRoutes = (userRoutes) => {
  // 为每个路由添加到主路由下
  userRoutes.forEach(route => {
    // 检查路由是否已经存在，避免重复添加
    const existingRoute = router.hasRoute(route.path);
    if (!existingRoute) {
      router.addRoute('/', route);
    }
  });
  
  // 更新 constantRoutes 供 Layout 组件使用
  constantRoutes.length = 0; // 清空原有路由
  constantRoutes.push(...userRoutes); // 添加新路由
};

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const whiteList = ["/login", "/register"]; // 白名单，不需要登录即可访问
  
  // 动态导入 store，避免循环依赖
  const { default: useStore } = await import("@/store/index");
  const store = useStore();
  
  // 检查token是否存在
  const token = localStorage.getItem('token');
  
  // 检查记住密码功能
  const rememberMe = localStorage.getItem('rememberMe');
  const rememberUntil = localStorage.getItem('rememberUntil');
  
  if (store.isLogin) {
    // 如果有token，检查是否过期（针对记住密码功能）
    if (rememberMe && rememberUntil) {
      if (Date.now() > parseInt(rememberUntil)) {
        // 记住密码已过期，清除相关数据
        localStorage.removeItem('token');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberUntil');
        store.logout();
        
        if (!whiteList.includes(to.path)) {
          next("/login");
          return;
        }
      }
    }
    
    // 设置登录状态
    store.setIsLogin(true);
    
    // 如果没有用户信息或路由信息，需要重新获取
    if (!store.userInfo || store.routes.length === 0) {
      try {
        // 这里可以调用API获取用户信息
        // const userInfo = await getUserInfo();
        // store.setUserInfo(userInfo);
        
        // 临时处理：如果有token但没有用户信息，可以设置默认用户信息
        if (!store.userInfo) {
          console.warn('Token exists but no user info found. You may need to implement user info retrieval.');
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
        store.logout();
        next("/login");
        return;
      }
    }
    
    // 如果已登录用户访问登录页，重定向到首页
    if (to.path === "/login") {
      next("/");
      return;
    }
  } else {
    // 没有token，清除登录状态
    store.setIsLogin(false);
    
    // 如果访问的不是白名单页面，重定向到登录页
    if (!whiteList.includes(to.path)) {
      next("/login");
      return;
    }
  }
  
  next();
});

export default router;
