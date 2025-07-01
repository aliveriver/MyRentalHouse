import { addDynamicRoutes, adminRoutes, userRoutes } from '@/routers/index';
import { filterRoutesByRole } from '@/utils/auth';
import { defineStore } from 'pinia';

export default defineStore({
  id: 'index',
  state: () => {
    return {
      isLogin: false,
      routes: [],
      userInfo: null,
    };
  },
  actions: {
    setIsLogin(value) {
      this.isLogin = value;
    },
    setRoutes(routes) {
      this.routes = routes;
    },
    setUserInfo(userInfo) {
      this.isLogin = true;
      this.userInfo = userInfo;
      // 根据用户信息动态设置路由
      this.generateRoutes(userInfo);
    },
    // 根据用户角色生成路由
    generateRoutes(userInfo) {
      let accessibleRoutes = [];

      if (userInfo && userInfo.role) {
        const userRole = userInfo.role.toLowerCase();

        // 根据角色获取对应的路由配置
        let availableRoutes = [];
        // 卖家相关角色
        if (
          userRole === '卖家' ||
          userRole === 'admin' ||
          userRole === 'seller'
        ) {
          availableRoutes = [...adminRoutes];
        } else {
          // 买家相关角色（包括 user、买家、buyer 等）
          availableRoutes = [...userRoutes];
        }

        // 过滤路由：只显示当前用户角色可访问的路由
        accessibleRoutes = filterRoutesByRole(availableRoutes, userRole);

        console.log(`Generated routes for ${userRole}:`, accessibleRoutes);
      }

      // 设置路由到 store
      this.setRoutes(accessibleRoutes);

      // 动态添加路由到 router
      addDynamicRoutes(accessibleRoutes);
    },
    logout() {
      this.isLogin = false;
      this.userInfo = null;
      this.routes = [];
      localStorage.removeItem('token');
      // 清除动态路由
      addDynamicRoutes([]);
    },
  },
  getters: {
    getRoutes() {
      return this.routes;
    },
    getUserInfo() {
      return this.userInfo;
    },
    getUserRole() {
      return this.userInfo?.role || null;
    },
  },
});
