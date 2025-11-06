/**
 * JWT Token 工具类
 * 用于处理 JWT token 的存储、获取、验证等操作
 */

const TOKEN_KEY = 'token';
const TOKEN_PREFIX = 'Bearer';
const REMEMBER_ME_KEY = 'rememberMe';
const REMEMBER_UNTIL_KEY = 'rememberUntil';

/**
 * 保存 token 到 localStorage
 * @param {string} token - JWT token
 * @param {boolean} rememberMe - 是否记住登录状态
 */
export function setToken(token, rememberMe = false) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);

    if (rememberMe) {
      // 记住登录状态7天
      const rememberUntil = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      localStorage.setItem(REMEMBER_UNTIL_KEY, rememberUntil.toString());
    }
  }
}

/**
 * 获取存储的 token
 * @returns {string|null} JWT token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 移除 token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  localStorage.removeItem(REMEMBER_UNTIL_KEY);
}

/**
 * 检查 token 是否存在
 * @returns {boolean}
 */
export function hasToken() {
  return !!getToken();
}

/**
 * 获取带前缀的 Authorization header 值
 * @returns {string|null}
 */
export function getAuthHeader() {
  const token = getToken();
  return token ? `${TOKEN_PREFIX} ${token}` : null;
}

/**
 * 解析 JWT token 的 payload
 * @param {string} token - JWT token
 * @returns {object|null} 解析后的 payload 对象
 */
export function parseToken(token) {
  if (!token) return null;

  try {
    // JWT token 格式: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // 解码 payload (base64)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('解析 token 失败:', error);
    return null;
  }
}

/**
 * 从 token 中提取用户信息
 * @param {string} token - JWT token
 * @returns {object|null} 用户信息对象
 */
export function getUserInfoFromToken(token) {
  const payload = parseToken(token || getToken());
  if (!payload) return null;

  return {
    // 适配新接口返回的字段
    userid: payload.userId || payload.userid,
    username: payload.username,
    phoneNumber: payload.phoneNumber,
    role: payload.role, // 可能是数字（1-买家, 2-卖家）或字符串
    avatar: payload.avatar,
  };
}

/**
 * 检查 token 是否过期
 * @param {string} token - JWT token
 * @returns {boolean} true-已过期, false-未过期
 */
export function isTokenExpired(token) {
  const payload = parseToken(token || getToken());
  if (!payload || !payload.exp) return true;

  // exp 是以秒为单位的时间戳
  const expirationTime = payload.exp * 1000;
  const currentTime = new Date().getTime();

  return currentTime >= expirationTime;
}

/**
 * 检查记住登录状态是否有效
 * @returns {boolean}
 */
export function isRememberMeValid() {
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
  const rememberUntil = localStorage.getItem(REMEMBER_UNTIL_KEY);

  if (!rememberMe || !rememberUntil) return false;

  const until = parseInt(rememberUntil);
  const now = new Date().getTime();

  return now < until;
}

/**
 * 验证 token 是否有效
 * @param {string} token - JWT token
 * @returns {boolean}
 */
export function validateToken(token) {
  if (!token) return false;

  // 检查 token 格式
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // 检查是否过期
  if (isTokenExpired(token)) return false;

  return true;
}

/**
 * 获取 token 剩余有效时间（秒）
 * @param {string} token - JWT token
 * @returns {number} 剩余秒数，-1 表示已过期或无效
 */
export function getTokenRemainingTime(token) {
  const payload = parseToken(token || getToken());
  if (!payload || !payload.exp) return -1;

  const expirationTime = payload.exp * 1000;
  const currentTime = new Date().getTime();
  const remaining = Math.floor((expirationTime - currentTime) / 1000);

  return remaining > 0 ? remaining : -1;
}

/**
 * 从 token 中提取用户ID
 * @param {string} token - JWT token
 * @returns {number|null} 用户ID
 */
export function extractUserId(token) {
  const payload = parseToken(token || getToken());
  return payload?.userId || null;
}

/**
 * 从 token 中提取用户名
 * @param {string} token - JWT token
 * @returns {string|null} 用户名
 */
export function extractUsername(token) {
  const payload = parseToken(token || getToken());
  return payload?.username || null;
}

/**
 * 从 token 中提取用户角色
 * @param {string} token - JWT token
 * @returns {number|null} 用户角色
 */
export function extractRole(token) {
  const payload = parseToken(token || getToken());
  return payload?.role || null;
}

/**
 * 从 token 中提取手机号
 * @param {string} token - JWT token
 * @returns {string|null} 手机号
 */
export function extractPhoneNumber(token) {
  const payload = parseToken(token || getToken());
  return payload?.phoneNumber || null;
}

export default {
  setToken,
  getToken,
  removeToken,
  hasToken,
  getAuthHeader,
  parseToken,
  getUserInfoFromToken,
  isTokenExpired,
  isRememberMeValid,
  validateToken,
  getTokenRemainingTime,
  extractUserId,
  extractUsername,
  extractRole,
  extractPhoneNumber,
};
