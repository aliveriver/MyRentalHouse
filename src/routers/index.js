import {
  getUserInfoFromToken,
  isRememberMeValid,
  validateToken,
} from '@/utils/jwt';
import { getDefaultRouteByRole } from '@/utils/userRole';
import { createRouter, createWebHistory } from 'vue-router';

import Layout from '../views/Layout.vue';

// 管理员路由
export const adminRoutes = [
  {
    path: '',
    component: () => import('../views/home/index.vue'),
    meta: {
      title: '数据概览',
      icon: 'DataAnalysis',
      roles: ['卖家', '管理员'],
    },
  },
  {
    path: 'house/list',
    component: () => import('../views/house/list/index.vue'),
    meta: { title: '房源列表', icon: 'House', roles: ['卖家', '管理员'] },
  },
  {
    path: 'house/add',
    component: () => import('../views/house/list/add.vue'),
    meta: { title: '房源编辑', isHidden: true, roles: ['卖家', '管理员'] },
  },
  {
    path: 'house/detail/:id',
    component: () => import('../views/house/detail/index.vue'),
    meta: {
      title: '房源详情',
      isHidden: true,
      roles: ['卖家', '管理员', '买家'],
    },
  },
  {
    path: 'info/list',
    component: () => import('../views/info/list/index.vue'),
    meta: { title: '资讯管理', icon: 'Document', roles: ['卖家', '管理员'] },
  },
  {
    path: 'info/list/add',
    component: () => import('../views/info/list/add.vue'),
    meta: { title: '资讯编辑', isHidden: true, roles: ['卖家', '管理员'] },
  },
  {
    path: 'appointments',
    component: () => import('../views/appointments/index.vue'),
    meta: { title: '预约管理', icon: 'Calendar', roles: ['卖家', '管理员'] },
  },
  {
    path: 'contracts',
    component: () => import('../views/contracts/index.vue'),
    meta: { title: '合同管理', icon: 'Document', roles: ['卖家', '管理员'] },
  },
  {
    path: 'person',
    component: () => import('../views/person/index.vue'),
    meta: {
      title: '个人中心',
      icon: 'Setting',
      roles: ['卖家', '管理员', '买家'],
    },
  },
];

// 普通用户路由
export const userRoutes = [
  {
    path: 'house/info',
    component: () => import('../views/house/info/index.vue'),
    meta: { title: '房源资讯', icon: 'Tickets', roles: ['买家'] },
  },
  {
    path: 'house/detail/:id',
    component: () => import('../views/house/detail/index.vue'),
    meta: { title: '房源详情', isHidden: true, roles: ['买家'] },
  },
  {
    path: 'houseMap',
    component: () => import('../views/house/map/index.vue'),
    meta: { title: '地图找房', icon: 'LocationInformation', roles: ['买家'] },
  },
  {
    path: 'person',
    component: () => import('../views/person/index.vue'),
    meta: { title: '个人中心', icon: 'Setting', roles: ['买家'] },
  },
  {
    path: '/contract/sign/:propertyId',
    name: 'ContractSign',
    component: () => import('../views/contract/sign/index.vue'),
    meta: {
      title: '签署购房合同',
      roles: ['买家'],
      isHidden: true,
    },
  },
];

// 基础路由（所有用户都可以访问）
export const baseRoutes = [
  {
    path: 'person',
    component: () => import('../views/person/index.vue'),
    meta: {
      title: '个人中心',
      icon: 'Setting',
      roles: ['卖家', '管理员', '买家'],
    },
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

  // 检查token是否存在和有效
  const token = localStorage.getItem('token');
  const tokenValid = token && validateToken(token);

  if (tokenValid) {
    // Token有效，检查记住密码功能
    if (!isRememberMeValid() && localStorage.getItem('rememberMe')) {
      // 记住密码已过期，清除相关数据
      store.logout();

      if (!whiteList.includes(to.path)) {
        next('/login');
        return;
      }
    }

    // 设置登录状态
    store.setIsLogin(true);

    // 如果没有用户信息或路由信息，从token中恢复
    if (!store.userInfo || store.routes.length === 0) {
      try {
        // 从JWT token中提取用户信息
        const userInfo = getUserInfoFromToken(token);

        if (userInfo) {
          // 设置用户信息，这会自动触发动态路由生成
          store.setUserInfo(userInfo);
        } else {
          // Token无效，清除登录状态
          console.error('无法从token中提取用户信息');
          store.logout();
          next('/login');
          return;
        }
      } catch (error) {
        console.error('Failed to get user info from token:', error);
        store.logout();
        next('/login');
        return;
      }
    }

    // 如果已登录用户访问登录页，重定向到首页
    if (to.path === '/login') {
      // 根据用户角色重定向到对应的首页
      if (store.userInfo && store.userInfo.role) {
        const defaultRoute = getDefaultRouteByRole(store.userInfo.role);
        next(defaultRoute);
      } else {
        next('/house/info'); // 默认跳转到房源资讯页
      }
      return;
    }
  } else {
    // Token不存在或无效，清除登录状态
    if (token) {
      // Token存在但无效（可能过期），清除它
      console.log('Token无效或已过期，清除登录状态');
      store.logout();
    }
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
