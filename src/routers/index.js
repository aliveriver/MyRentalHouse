import {
  getUserInfoFromToken,
  isRememberMeValid,
  validateToken,
} from '@/utils/jwt';
import { createRouter, createWebHistory } from 'vue-router';

// Layout 使用动态导入，避免循环依赖

// 管理员路由
export const adminRoutes = [
  {
    path: 'home', // 改为具体路径，避免空路径导致的路由冲突
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
    path: 'contract/sign/:propertyId',
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
    component: () => import('../views/Layout.vue'),
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
export const addDynamicRoutes = async (userRoutes) => {
  console.log('=== addDynamicRoutes 开始 ===');
  console.log(
    '接收到的路由:',
    userRoutes?.map((r) => ({ path: r.path, roles: r.meta?.roles }))
  );

  // 清空 constantRoutes
  constantRoutes.length = 0;

  if (userRoutes && userRoutes.length > 0) {
    // 直接更新 constantRoutes 数组
    constantRoutes.push(...userRoutes);

    // 准备子路由配置
    const childrenRoutes = userRoutes.map((route, index) => {
      // 确保子路由路径不以 / 开头
      const normalizedPath = route.path.startsWith('/')
        ? route.path.substring(1)
        : route.path;

      return {
        ...route,
        path: normalizedPath,
        name:
          route.name ||
          `dynamic-route-${index}-${normalizedPath.replace(/[/:]/g, '-')}`,
      };
    });

    console.log(
      '准备的子路由:',
      childrenRoutes.map((r) => ({ name: r.name, path: r.path }))
    );

    // 关键修复：先移除整个 Layout 路由，然后重新添加包含所有子路由的新 Layout
    try {
      router.removeRoute('Layout');
      console.log('已移除旧的 Layout 路由');
    } catch (e) {
      console.log('移除 Layout 路由失败（可能不存在）:', e);
    }

    // 重新添加完整的 Layout 路由（包含所有子路由）
    router.addRoute({
      path: '/',
      name: 'Layout',
      component: () => import('../views/Layout.vue'),
      children: childrenRoutes,
    });

    console.log(
      '已重新添加 Layout 路由，包含',
      childrenRoutes.length,
      '个子路由'
    );

    // 等待路由注册完成
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 验证路由是否正确注册
    const layoutRoute = router.getRoutes().find((r) => r.name === 'Layout');
    if (layoutRoute && layoutRoute.children) {
      console.log(
        '✅ Layout 子路由注册成功，数量:',
        layoutRoute.children.length
      );
      console.log(
        '子路由列表:',
        layoutRoute.children.map((r) => ({ name: r.name, path: r.path }))
      );
    } else {
      console.error('❌ Layout 路由注册失败！');
    }
  } else {
    console.warn('userRoutes 为空或长度为0:', userRoutes);
  }

  console.log('=== addDynamicRoutes 结束 ===');
};

// 路由守卫
router.beforeEach(async (to, from, next) => {
  console.log('Route guard triggered:', { to: to.path, from: from.path });

  const whiteList = ['/login', '/register']; // 白名单，不需要登录即可访问

  // 首先检查token是否存在和有效
  const token = localStorage.getItem('token');
  const tokenValid = token && validateToken(token);

  // 如果已登录，访问登录页或根路径，直接重定向到对应首页
  if (tokenValid && (to.path === '/login' || to.path === '/')) {
    try {
      const { default: useStore } = await import('@/store/index');
      const store = useStore();
      let userInfo = getUserInfoFromToken(token);

      if (userInfo) {
        // 优先从 localStorage 获取完整用户信息
        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
          try {
            const parsed = JSON.parse(savedUserInfo);
            if (parsed && parsed.role) {
              console.log('[路由守卫] 从 localStorage 恢复用户信息:', parsed);
              userInfo = { ...userInfo, ...parsed };
            }
          } catch (e) {
            console.warn('解析 userInfo 失败:', e);
          }
        }

        // 如果还是没有 role，使用默认值"买家"
        if (!userInfo.role) {
          console.warn('[路由守卫] Token 中没有 role，使用默认值"买家"');
          userInfo.role = '买家';
        }

        // 确保store中有用户信息
        if (!store.userInfo || !store.isLogin) {
          console.log('[路由守卫] 设置用户信息并生成路由:', userInfo);
          store.setIsLogin(true);
          store.setUserInfo(userInfo);
          // 等待路由生成
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // 根据用户角色重定向到对应首页
        const { getDefaultRouteByRole } = await import('@/utils/userRole');
        const defaultRoute = getDefaultRouteByRole(userInfo.role);
        console.log(
          `已登录用户访问登录页/根路径，角色: ${userInfo.role}，重定向到 ${defaultRoute}`
        );
        next(defaultRoute);
        return;
      } else {
        // 如果无法获取用户信息，重定向到登录页
        console.error('[路由守卫] 无法获取用户信息');
        next('/login');
        return;
      }
    } catch (error) {
      console.error('Error in login redirect:', error);
      // 出错时也重定向到登录页
      next('/login');
      return;
    }
  }

  // 如果是白名单页面且未登录，直接允许访问
  if (whiteList.includes(to.path)) {
    next();
    return;
  }

  // 动态导入 store，避免循环依赖
  const { default: useStore } = await import('@/store/index');
  const store = useStore();

  console.log('Store state:', {
    isLogin: store.isLogin,
    userInfo: store.userInfo,
    routes: store.routes,
  });

  // token已经在上面检查过了，这里直接使用

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
    // 注意：刷新页面时，main.js 已经提前恢复了动态路由，这里只是保险检查
    if (!store.userInfo || !store.isLogin) {
      try {
        // 从JWT token中提取用户信息
        let userInfo = getUserInfoFromToken(token);

        if (userInfo) {
          // 优先从 localStorage 获取完整用户信息
          const savedUserInfo = localStorage.getItem('userInfo');
          if (savedUserInfo) {
            try {
              const parsed = JSON.parse(savedUserInfo);
              if (parsed && parsed.role) {
                console.log('[路由守卫] 从 localStorage 恢复用户信息:', parsed);
                userInfo = { ...userInfo, ...parsed };
              }
            } catch (e) {
              console.warn('解析 userInfo 失败:', e);
            }
          }

          // 如果还是没有 role，使用默认值"买家"
          if (!userInfo.role) {
            console.warn('[路由守卫] Token 中没有 role，使用默认值"买家"');
            userInfo.role = '买家';
          }

          // 设置用户信息（如果 main.js 已经设置过，这里会跳过路由生成）
          store.setUserInfo(userInfo);

          // 只在路由未生成时等待
          if (store.routes.length === 0) {
            console.warn('[路由守卫] 路由尚未生成，等待中...');
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
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

    // 检查路由是否存在，如果不存在且不是登录/注册页，可能需要重新生成路由
    const allRoutes = router.getRoutes();
    console.log('检查路由是否存在，目标路径:', to.path);
    console.log(
      '所有已注册的路由:',
      allRoutes.map((r) => ({
        path: r.path,
        name: r.name,
        children: r.children?.map((c) => ({ path: c.path, name: c.name })),
      }))
    );

    const routeExists = allRoutes.some((route) => {
      // 检查精确匹配
      if (route.path === to.path) {
        console.log('找到精确匹配的路由:', route.path);
        return true;
      }
      // 检查子路由
      if (route.children && route.children.length > 0) {
        const found = route.children.some((child) => {
          // 计算完整路径
          let fullPath;
          if (route.path === '/') {
            fullPath = '/' + child.path;
          } else if (route.path.endsWith('/')) {
            fullPath = route.path + child.path;
          } else {
            fullPath = route.path + '/' + child.path;
          }
          // 规范化路径（移除末尾斜杠）
          const normalizedFullPath = fullPath.replace(/\/$/, '');
          const normalizedToPath = to.path.replace(/\/$/, '');

          // 调试输出
          if (to.path === '/house/info') {
            console.log('检查子路由:', {
              routePath: route.path,
              childPath: child.path,
              fullPath,
              normalizedFullPath,
              normalizedToPath,
              match:
                normalizedFullPath === normalizedToPath || fullPath === to.path,
            });
          }

          if (normalizedFullPath === normalizedToPath || fullPath === to.path) {
            console.log('找到子路由匹配:', {
              routePath: route.path,
              childPath: child.path,
              fullPath,
            });
            return true;
          }
          return false;
        });
        if (found) return true;
      }
      return false;
    });

    if (!routeExists && !whiteList.includes(to.path)) {
      console.warn('路由不存在，尝试重新生成:', to.path);
      console.log('当前用户信息:', store.userInfo);
      console.log('当前路由列表:', store.routes);

      if (store.userInfo) {
        // 只尝试一次重新生成
        const retryKey = `route_retry_${to.path}`;
        if (sessionStorage.getItem(retryKey)) {
          console.error('路由重新生成已尝试过，避免无限循环');
          // 如果目标路径是 /house/info，直接跳转
          if (to.path === '/house/info') {
            setTimeout(() => {
              window.location.href = '/house/info';
            }, 0);
            next(false);
            return;
          }
          next('/login');
          return;
        }

        sessionStorage.setItem(retryKey, 'true');
        store.setUserInfo(store.userInfo); // 重新生成路由
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 重新检查路由是否存在
        const newRoutes = router.getRoutes();
        const routeNowExists = newRoutes.some((route) => {
          if (route.path === to.path) return true;
          if (route.children) {
            return route.children.some((child) => {
              const fullPath =
                route.path === '/'
                  ? '/' + child.path
                  : route.path + '/' + child.path;
              return (
                fullPath === to.path ||
                fullPath.replace(/\/$/, '') === to.path.replace(/\/$/, '')
              );
            });
          }
          return false;
        });

        sessionStorage.removeItem(retryKey);

        if (routeNowExists) {
          console.log('路由重新生成成功，允许访问');
          next();
          return;
        } else {
          console.error('路由重新生成后仍然不存在，重定向到登录页');
          next('/login');
          return;
        }
      } else {
        console.error('无法重新生成路由：用户信息为空');
        next('/login');
        return;
      }
    }

    // 如果路由存在，检查权限后再放行
    if (routeExists) {
      console.log('路由存在，检查权限...');

      // 获取目标路由的配置（需要找到子路由的 meta）
      let targetRouteMeta = null;

      for (const route of allRoutes) {
        if (route.path === to.path) {
          targetRouteMeta = route.meta;
          break;
        }
        if (route.children) {
          for (const child of route.children) {
            const fullPath =
              route.path === '/'
                ? '/' + child.path
                : route.path + '/' + child.path;
            const normalizedFullPath = fullPath.replace(/\/$/, '');
            const normalizedToPath = to.path.replace(/\/$/, '');

            if (
              normalizedFullPath === normalizedToPath ||
              fullPath === to.path
            ) {
              targetRouteMeta = child.meta;
              break;
            }
          }
          if (targetRouteMeta) break;
        }
      }

      // 检查路由权限
      if (targetRouteMeta?.roles) {
        const userRole = store.userInfo?.role;
        const hasPermission = targetRouteMeta.roles.includes(userRole);

        console.log('路由权限检查:', {
          path: to.path,
          userRole,
          requiredRoles: targetRouteMeta.roles,
          hasPermission,
        });

        if (!hasPermission) {
          console.warn(`用户角色 ${userRole} 无权访问 ${to.path}`);
          // 重定向到用户的默认首页
          const { getDefaultRouteByRole } = await import('@/utils/userRole');
          const defaultRoute = getDefaultRouteByRole(userRole);
          console.log(`重定向到默认首页: ${defaultRoute}`);
          next(defaultRoute);
          return;
        }
      }

      console.log('权限检查通过，允许访问');
      next();
      return;
    }

    // 如果以上条件都不满足，且路由不存在，重定向到登录页
    if (!routeExists && !whiteList.includes(to.path)) {
      console.warn('路由不存在且无法生成，重定向到登录页');
      next('/login');
      return;
    }

    // 如果以上条件都不满足，默认放行（防止没有调用next）
    next();
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

    // 如果是白名单页面，允许访问
    next();
    return;
  }
});

export default router;
