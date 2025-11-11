import request from './request';
import { extractUserId } from '@/utils/jwt';

// 用户相关接口
const usersApi = {
  // 用户登录
  login(loginData) {
    return request({
      url: '/users/login',
      method: 'post',
      data: loginData,
    });
  },

  // 获取当前用户信息
  getCurrentUser() {
    // 从JWT token中提取用户ID
    const userId = extractUserId();
    if (!userId) {
      return Promise.reject(new Error('未找到用户ID，请先登录'));
    }
    return request({
      url: `/users/${userId}`,
      method: 'get',
    });
  },

  // 创建用户（注册）
  createUser(userData) {
    return request({
      url: '/users/register',
      method: 'post',
      data: userData,
    });
  },
  // 更新用户信息（个人信息修改）
  updateUser(userid, userData) {
    return request({
      url: `/users/${userid}`,
      method: 'put',
      data: userData,
    });
  },

  // 更新用户个人资料（保留兼容性）
  updateProfile(userid, profileData) {
    return request({
      url: `/users/${userid}`,
      method: 'put',
      data: profileData,
    });
  },

  // 删除用户
  deleteUser(userid) {
    return request({
      url: `/users/${userid}`,
      method: 'delete',
    });
  },

  // 获取单个用户详情
  getUserById(userid) {
    return request({
      url: `/users/${userid}`,
      method: 'get',
    });
  },

  // 获取所有用户
  getAllUsers() {
    return request({
      url: '/users',
      method: 'get',
    });
  },
  /**
   * 验证用户当前密码
   * @param {string} userid - 用户ID
   * @param {string} password - 当前密码
   */ verifyPassword(userid, password) {
    return request({
      url: `/users/${userid}/verify-password`,
      method: 'post',
      data: { password },
    });
  },

  /**
   * 修改用户密码
   * @param {string} userid - 用户ID
   * @param {string} passwordData.username - 用户名
   * @param {string} passwordData.password - 用户新密码
   * @param {string} passwordData.email - 用户email
   * @param {string} passwordData.phonenumber - 用户手机
   * @param {string} passwordData.registrationtime - 注册时间
   * @param {string} passwordData.role - 用户角色
   */
  changePassword(userid, passwordData) {
    return request({
      url: `/users/${userid}`,
      method: 'put',
      data: passwordData,
    });
  },

  /**
   * 更新用户头像
   * @param {string} avatarUri - 头像URI
   */
  updateAvatar(avatarUri) {
    return request({
      url: '/users/avatar',
      method: 'put',
      data: { avatar: avatarUri },
    });
  },
};

export default usersApi;
