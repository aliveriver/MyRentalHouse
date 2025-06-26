/**
 * 用户管理完整API示例
 * 
 * 根据提供的API文档，完整实现用户管理相关接口
 */

import request from './request'

// 用户管理API
const userManagementApi = {
  /**
   * 用户登录
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.username - 用户名
   * @param {string} loginData.password - 密码
   */
  login(loginData) {
    return request({
      url: '/users/login',
      method: 'post',
      data: loginData
    })
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.password - 密码
   * @param {string} userData.email - 邮箱
   * @param {string} userData.phonenumber - 手机号
   */
  register(userData) {
    return request({
      url: '/users/register',
      method: 'post',
      data: userData
    })
  },

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   */
  createUser(userData) {
    return request({
      url: '/users',
      method: 'post',
      data: userData
    })
  },

  /**
   * 更新用户个人资料信息
   * @param {string} userid - 用户ID
   * @param {Object} profileData - 个人资料数据
   * @param {string} profileData.username - 用户名
   * @param {string} profileData.email - 邮箱
   * @param {string} profileData.phonenumber - 手机号
   */
  updateProfile(userid, profileData) {
    return request({
      url: `/users/${userid}/profile`,
      method: 'put',
      data: profileData
    })
  },

  /**
   * 更新用户完整信息
   * @param {string} userid - 用户ID
   * @param {Object} userData - 用户完整数据
   */
  updateUser(userid, userData) {
    return request({
      url: `/users/${userid}`,
      method: 'put',
      data: userData
    })
  },

  /**
   * 删除用户
   * @param {string} userid - 用户ID
   */
  deleteUser(userid) {
    return request({
      url: `/users/${userid}`,
      method: 'delete'
    })
  },

  /**
   * 获取单个用户详情
   * @param {string} userid - 用户ID
   */
  getUserById(userid) {
    return request({
      url: `/users/${userid}`,
      method: 'get'
    })
  },

  /**
   * 获取所有用户列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   * @param {string} params.search - 搜索关键词
   */
  getAllUsers(params = {}) {
    return request({
      url: '/users',
      method: 'get',
      params
    })
  },

  /**
   * 验证用户当前密码
   * @param {string} userid - 用户ID
   * @param {string} password - 当前密码
   */
  verifyPassword(userid, password) {
    return request({
      url: `/users/${userid}/verify-password`,
      method: 'post',
      data: { password }
    })
  },

  /**
   * 修改用户密码
   * @param {string} userid - 用户ID
   * @param {Object} passwordData - 密码数据
   * @param {string} passwordData.currentPassword - 当前密码
   * @param {string} passwordData.newPassword - 新密码
   */
  changePassword(userid, passwordData) {
    return request({
      url: `/users/${userid}/change-password`,
      method: 'put',
      data: passwordData
    })
  },

  /**
   * 重置用户密码（管理员功能）
   * @param {string} userid - 用户ID
   * @param {string} newPassword - 新密码
   */
  resetPassword(userid, newPassword) {
    return request({
      url: `/users/${userid}/reset-password`,
      method: 'put',
      data: { password: newPassword }
    })
  },

  /**
   * 启用/禁用用户账户
   * @param {string} userid - 用户ID
   * @param {boolean} enabled - 是否启用
   */
  toggleUserStatus(userid, enabled) {
    return request({
      url: `/users/${userid}/status`,
      method: 'put',
      data: { enabled }
    })
  },

  /**
   * 批量删除用户
   * @param {Array} userIds - 用户ID数组
   */
  batchDeleteUsers(userIds) {
    return request({
      url: '/users/batch-delete',
      method: 'delete',
      data: { userIds }
    })
  },

  /**
   * 导出用户数据
   * @param {Object} params - 导出参数
   */
  exportUsers(params = {}) {
    return request({
      url: '/users/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  /**
   * 导入用户数据
   * @param {File} file - Excel文件
   */
  importUsers(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return request({
      url: '/users/import',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default userManagementApi
