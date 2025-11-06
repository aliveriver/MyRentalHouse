// 权限相关工具函数

/**
 * 根据用户角色过滤路由
 * @param {Array} routes - 所有路由
 * @param {string} userRole - 用户角色
 * @returns {Array} 过滤后的路由
 */
export function filterRoutesByRole(routes, userRole) {
  if (!userRole) return [];

  return routes.filter((route) => {
    return (
      route.meta?.roles && route.meta.roles.includes(userRole.toLowerCase())
    );
  });
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
