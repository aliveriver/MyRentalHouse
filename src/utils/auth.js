// 权限相关工具函数

/**
 * 根据用户角色过滤路由
 * @param {Array} routes - 所有路由
 * @param {string} userRole - 用户角色
 * @returns {Array} 过滤后的路由
 */
export function filterRoutesByRole(routes, userRole) {
  if (!userRole) {
    console.warn('filterRoutesByRole: userRole is empty');
    return [];
  }

  // 标准化角色（确保是中文角色名）
  const normalizedRole = String(userRole);
  console.log('filterRoutesByRole:', { userRole, normalizedRole, routesCount: routes.length });

  const filtered = routes.filter((route) => {
    const hasRoles = route.meta?.roles;
    if (!hasRoles) {
      console.warn('Route has no roles meta:', route.path);
      return false;
    }
    
    // 检查角色是否匹配（支持中文和英文）
    const roleMatches = route.meta.roles.some(role => {
      const roleStr = String(role);
      // 直接匹配（中文对中文）
      if (roleStr === normalizedRole) {
        return true;
      }
      // 大小写不敏感匹配（英文对英文）
      if (roleStr.toLowerCase() === normalizedRole.toLowerCase()) {
        return true;
      }
      // 特殊映射
      if ((normalizedRole === '买家' || normalizedRole.toLowerCase() === 'buyer') && 
          (roleStr === '买家' || roleStr.toLowerCase() === 'buyer')) {
        return true;
      }
      if ((normalizedRole === '卖家' || normalizedRole.toLowerCase() === 'seller') && 
          (roleStr === '卖家' || roleStr.toLowerCase() === 'seller')) {
        return true;
      }
      if ((normalizedRole === '管理员' || normalizedRole.toLowerCase() === 'admin') && 
          (roleStr === '管理员' || roleStr.toLowerCase() === 'admin')) {
        return true;
      }
      return false;
    });
    
    return roleMatches;
  });
  
  console.log('filtered routes:', filtered.map(r => ({ path: r.path, roles: r.meta?.roles })));
  return filtered;
}

/**
 * 检查用户是否有访问指定路由的权限
 * @param {string} path - 路由路径
 * @param {string} userRole - 用户角色
 * @param {Array} routes - 路由列表
 * @returns {boolean}
 */
export function hasRoutePermission(path, userRole, routes) {
  if (!userRole || !routes) return false;

  const route = routes.find((r) => r.path === path);
  if (!route) return false;

  return route.meta?.roles && route.meta.roles.includes(userRole.toLowerCase());
}

/**
 * 获取用户默认首页路径 - 与后端UserRole枚举保持一致
 * @param {string} userRole - 用户角色
 * @returns {string} 默认路径
 */
export function getDefaultRoute(userRole) {
  if (!userRole) return '/login';

  const role = userRole.toLowerCase();

  switch (role) {
    case '管理员':
    case 'admin':
      return '/'; // 管理员默认到数据概览
    case '卖家':
    case 'seller':
      return '/'; // 卖家默认到数据概览
    case '买家':
    case 'buyer':
    case 'user':
      return '/house/info'; // 买家默认到房源资讯
    default:
      return '/house/info'; // 默认到房源资讯页
  }
}
