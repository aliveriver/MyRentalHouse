/**
 * 用户角色工具类
 * 与后端UserRole枚举保持一致：买家、卖家、管理员
 */

// 角色常量 - 与后端UserRole枚举保持一致
export const USER_ROLES = {
  BUYER: '买家',
  SELLER: '卖家',
  ADMIN: '管理员',
};

// 角色映射表 - 兼容各种可能的角色标识
const ROLE_MAPPING = {
  // 中文角色（与后端枚举一致）
  买家: USER_ROLES.BUYER,
  卖家: USER_ROLES.SELLER,
  管理员: USER_ROLES.ADMIN,

  // 英文角色（兼容旧版本）
  buyer: USER_ROLES.BUYER,
  seller: USER_ROLES.SELLER,
  admin: USER_ROLES.ADMIN,
  user: USER_ROLES.BUYER, // 默认用户映射为买家
  BUYER: USER_ROLES.BUYER,
  SELLER: USER_ROLES.SELLER,
  ADMIN: USER_ROLES.ADMIN,

  // 数字角色（新接口使用数字）
  1: USER_ROLES.BUYER, // 1-买家
  2: USER_ROLES.SELLER, // 2-卖家
  3: USER_ROLES.ADMIN, // 3-管理员(预留)
  1: USER_ROLES.BUYER,
  2: USER_ROLES.SELLER,
  3: USER_ROLES.ADMIN,
};

/**
 * 标准化角色名称
 * @param {string|number} role - 原始角色标识
 * @returns {string} 标准化后的角色名称
 */
export function normalizeRole(role) {
  if (!role) return USER_ROLES.BUYER; // 默认为买家

  const roleStr = String(role).toLowerCase();
  return ROLE_MAPPING[roleStr] || ROLE_MAPPING[role] || USER_ROLES.BUYER;
}

/**
 * 获取角色的中文显示名称
 * @param {string} role - 角色标识
 * @returns {string} 中文显示名称
 */
export function getRoleDisplayName(role) {
  return normalizeRole(role);
}

/**
 * 检查是否为卖家角色（包括管理员）
 * @param {string} role - 角色标识
 * @returns {boolean}
 */
export function isSellerRole(role) {
  const normalizedRole = normalizeRole(role);
  return (
    normalizedRole === USER_ROLES.SELLER || normalizedRole === USER_ROLES.ADMIN
  );
}

/**
 * 检查是否为买家角色
 * @param {string} role - 角色标识
 * @returns {boolean}
 */
export function isBuyerRole(role) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === USER_ROLES.BUYER;
}

/**
 * 检查是否为管理员角色
 * @param {string} role - 角色标识
 * @returns {boolean}
 */
export function isAdminRole(role) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === USER_ROLES.ADMIN;
}

/**
 * 根据角色获取默认首页路径
 * @param {string} role - 角色标识
 * @returns {string} 默认路径
 */
export function getDefaultRouteByRole(role) {
  const normalizedRole = normalizeRole(role);

  switch (normalizedRole) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.SELLER:
      return '/'; // 卖家和管理员默认到数据概览
    case USER_ROLES.BUYER:
    default:
      return '/house/info'; // 买家默认到房源资讯
  }
}

/**
 * 根据角色过滤路由权限
 * @param {Array} routes - 路由列表
 * @param {string} role - 用户角色
 * @returns {Array} 过滤后的路由
 */
export function filterRoutesByUserRole(routes, role) {
  if (!role || !routes) return [];

  const normalizedRole = normalizeRole(role);

  return routes.filter((route) => {
    if (!route.meta?.roles) return true; // 没有角色限制的路由默认可访问

    // 检查当前角色是否在允许的角色列表中
    return route.meta.roles.some((allowedRole) => {
      const normalizedAllowedRole = normalizeRole(allowedRole);
      return normalizedAllowedRole === normalizedRole;
    });
  });
}
