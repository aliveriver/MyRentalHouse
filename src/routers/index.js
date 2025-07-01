import { createRouter, createWebHistory } from 'vue-router';

import Layout from '../views/Layout.vue';

// 管理员路由
export const adminRoutes = [
  {
    path: '',
    component: () => import('../views/home/index.vue'),
    meta: { title: '数据概览', icon: 'DataAnalysis', roles: ['卖家'] },
  },
  {
    path: 'house/list',
    component: () => import('../views/house/list/index.vue'),
    meta: { title: '房源列表', icon: 'House', roles: ['卖家'] },
  },
  {
    path: 'house/list/add',
    component: () => import('../views/house/list/add.vue'),
    meta: { title: '房源编辑', isHidden: true, roles: ['卖家'] },
  },
  {
    path: 'house/detail/:id',
    component: () => import('../views/house/detail/index.vue'),
    meta: { title: '房源详情', isHidden: true, roles: ['卖家', 'user'] },
  },
  {
    path: 'info/list',
    component: () => import('../views/info/list/index.vue'),
    meta: { title: '资讯管理', icon: 'Document', roles: ['卖家'] },
  },
  {
    path: 'info/list/add',
    component: () => import('../views/info/list/add.vue'),
    meta: { title: '资讯编辑', isHidden: true, roles: ['卖家'] },
  },
  {
    path: 'appointments',
    component: () => import('../views/appointments/index.vue'),
    meta: { title: '预约管理', icon: 'Calendar', roles: ['卖家'] },
  },
  {
    path: 'houseMap',
    component: () => import('../views/house/map/index.vue'),
    meta: { title: '地图找房', icon: 'LocationInformation', roles: ['卖家'] },
  },
  {
    path: 'person',
    component: () => import('../views/person/index.vue'),
    meta: { title: '个人中心', icon: 'Setting', roles: ['卖家', 'user'] },
  },
];

// 普通用户路由
export const userRoutes = [
  {
    path: 'house/info',
    component: () => import('../views/house/info/index.vue'),
    meta: { title: '房源资讯', icon: 'Tickets', roles: ['买家', 'user'] },
  },
  {
    path: 'house/detail/:id',
    component: () => import('../views/house/detail/index.vue'),
    meta: { title: '房源详情', isHidden: true, roles: ['买家', 'user'] },
  },
  {
    path: 'person',
    component: () => import('../views/person/index.vue'),
    meta: { title: '个人中心', icon: 'Setting', roles: ['买家', 'user'] },
  },
];

// 基础路由（所有用户都可以访问）
export const baseRoutes = [
  {
    path: 'person',
    component: () => import('../views/person/index.vue'),
    meta: { title: '个人中心', icon: 'Setting', roles: ['卖家', 'user'] },
  },
];

// 初始路由（空数组，将在登录后动态添加）
export const constantRoutes = [];

// 基础静态路由
export const routes = [
  { path: '/login', component: () => import('../views/login/index.vue') },
  { path: '/register', component: () => import('../views/register/index.vue') },
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    children: [
      // 默认空路由，会在登录后动态添加
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 动态添加路由的函数
export const addDynamicRoutes = (userRoutes) => {
  // 清空 constantRoutes
  constantRoutes.length = 0;

  if (userRoutes && userRoutes.length > 0) {
    // 直接更新 constantRoutes 数组
    constantRoutes.push(...userRoutes);

    // 获取当前的 Layout 路由
    const layoutRoute = router
      .getRoutes()
      .find((route) => route.name === 'Layout');
    if (layoutRoute) {
      // 移除旧的子路由
      const childRoutes = router
        .getRoutes()
        .filter(
          (route) =>
            route.path.startsWith('/') &&
            route.path !== '/' &&
            route.path !== '/login' &&
            route.path !== '/register'
        );

      childRoutes.forEach((route) => {
        if (route.name) {
          try {
            router.removeRoute(route.name);
          } catch (e) {
            // 忽略移除失败的情况
          }
        }
      });

      // 重新添加子路由
      userRoutes.forEach((route, index) => {
        const routeWithName = {
          ...route,
          name:
            route.name ||
            `dynamic-route-${index}-${route.path.replace(/[/:]/g, '-')}`,
        };

        try {
          router.addRoute('Layout', routeWithName);
          console.log('Added child route to Layout:', routeWithName);
        } catch (e) {
          console.warn('Failed to add child route:', routeWithName, e);
        }
      });
    }
  }

  console.log('Dynamic routes updated:', constantRoutes);
  console.log('All routes:', router.getRoutes());
};

// 路由守卫
router.beforeEach(async (to, from, next) => {
  console.log('Route guard triggered:', { to: to.path, from: from.path });

  const whiteList = ['/login', '/register']; // 白名单，不需要登录即可访问

  // 动态导入 store，避免循环依赖
  const { default: useStore } = await import('@/store/index');
  const store = useStore();

  console.log('Store state:', {
    isLogin: store.isLogin,
    userInfo: store.userInfo,
    routes: store.routes,
  });

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
          next('/login');
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
          console.warn(
            'Token exists but no user info found. You may need to implement user info retrieval.'
          );
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
        store.logout();
        next('/login');
        return;
      }
    } // 如果已登录用户访问登录页，重定向到首页
    if (to.path === '/login') {
      // 根据用户角色重定向到对应的首页
      if (store.userInfo && store.userInfo.role) {
        const userRole = store.userInfo.role.toLowerCase();
        if (userRole === '卖家') {
          next('/'); // 管理员默认到数据概览页
        } else {
          next('/house/info'); // 普通用户默认到房源资讯页
        }
      } else {
        next('/');
      }
      return;
    }
  } else {
    // 没有token，清除登录状态
    store.setIsLogin(false);

    // 如果访问的不是白名单页面，重定向到登录页
    if (!whiteList.includes(to.path)) {
      next('/login');
      return;
    }
  }

  next();
});

export default router;
