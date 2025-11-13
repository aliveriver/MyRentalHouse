import { addDynamicRoutes, adminRoutes, userRoutes, baseRoutes } from '@/routers/index';
import { filterRoutesByRole } from '@/utils/auth';
import { removeToken } from '@/utils/jwt';
import { isSellerRole, normalizeRole } from '@/utils/userRole';
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

      // 如果只是更新头像，不需要重新生成路由
      const oldUserInfo = this.userInfo;
      const isOnlyAvatarUpdate =
        oldUserInfo &&
        userInfo &&
        oldUserInfo.userid === userInfo.userid &&
        oldUserInfo.username === userInfo.username &&
        oldUserInfo.role === userInfo.role &&
        oldUserInfo.avatar !== userInfo.avatar;

      // 使用响应式更新，确保 Vue 能检测到变化
      this.userInfo = { ...userInfo };

      // 只有在用户信息发生实质性变化时才重新生成路由（比如角色变化）
      if (!isOnlyAvatarUpdate) {
        // 根据用户信息动态设置路由
        this.generateRoutes(userInfo);
      }
    },
    // 根据用户角色生成路由 - 使用统一的角色工具
    async generateRoutes(userInfo) {
      console.log('=== generateRoutes 开始 ===');
      console.log('userInfo:', userInfo);

      let accessibleRoutes = [];

      // 检查 role 是否存在，如果不存在则使用默认值
      if (!userInfo || !userInfo.role) {
        console.warn('userInfo 或 role 为空，使用默认角色"买家"');
        // 如果没有 role，默认设置为买家
        if (userInfo) {
          userInfo.role = '买家';
        } else {
          console.error('userInfo 为空，无法生成路由');
          return;
        }
      }

      if (userInfo && userInfo.role) {
        const normalizedRole = normalizeRole(userInfo.role);
        console.log('原始 role:', userInfo.role);
        console.log('normalizedRole:', normalizedRole);

        // 根据角色获取对应的路由配置
        let availableRoutes = [];
        const isSellerOrAdmin = isSellerRole(userInfo.role);
        console.log('isSellerRole 判断结果:', isSellerOrAdmin);

        // 卖家和管理员相关角色
        if (isSellerOrAdmin) {
          availableRoutes = [...adminRoutes, ...baseRoutes];
          console.log(
            '✅ 使用 adminRoutes + baseRoutes（卖家/管理员），数量:',
            adminRoutes.length + baseRoutes.length
          );
          console.log(
            'adminRoutes 详情:',
            adminRoutes.map((r) => ({ path: r.path, title: r.meta?.title }))
          );
          console.log(
            'baseRoutes 详情:',
            baseRoutes.map((r) => ({ path: r.path, title: r.meta?.title }))
          );
        } else {
          // 买家相关角色
          availableRoutes = [...userRoutes, ...baseRoutes];
          console.log('✅ 使用 userRoutes + baseRoutes（买家），数量:', userRoutes.length + baseRoutes.length);
          console.log(
            'userRoutes 详情:',
            userRoutes.map((r) => ({ path: r.path, title: r.meta?.title }))
          );
          console.log(
            'baseRoutes 详情:',
            baseRoutes.map((r) => ({ path: r.path, title: r.meta?.title }))
          );
        }

        // 过滤路由：只显示当前用户角色可访问的路由
        accessibleRoutes = filterRoutesByRole(availableRoutes, normalizedRole);

        console.log(
          `Generated routes for ${normalizedRole}:`,
          accessibleRoutes.map((r) => ({
            path: r.path,
            title: r.meta?.title,
            roles: r.meta?.roles,
          }))
        );
        console.log('accessibleRoutes 数量:', accessibleRoutes.length);
      } else {
        console.warn('userInfo 或 role 为空:', {
          userInfo,
          role: userInfo?.role,
        });
      }

      // 设置路由到 store
      this.setRoutes(accessibleRoutes);

      // 动态添加路由到 router
      console.log('准备添加路由到 router，数量:', accessibleRoutes.length);
      await addDynamicRoutes(accessibleRoutes);
      console.log('=== generateRoutes 结束 ===');
    },
    logout() {
      this.isLogin = false;
      this.userInfo = null;
      this.routes = [];
      // 使用JWT工具移除token
      removeToken();
      // 清除 localStorage 中的用户信息
      try {
        localStorage.removeItem('userInfo');
      } catch (e) {
        console.warn('清除 userInfo 失败:', e);
      }
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
