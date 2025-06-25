import request from './request'

// 用户相关接口
const usersApi = {
  // 用户登录
  login(loginData) {
    return request({
      url: '/auth/login',
      method: 'post',
      data: loginData
    })
  },

  // 用户注册
  register(registerData) {
    return request({
      url: '/auth/register',
      method: 'post',
      data: registerData
    })
  },

  // 用户退出登录
  logout() {
    return request({
      url: '/auth/logout',
      method: 'post'
    })
  },

  // 获取当前用户信息
  getCurrentUser() {
    return request({
      url: '/auth/me',
      method: 'get'
    })
  },

  // 创建用户
  createUser(userData) {
    return request({
      url: '/users',
      method: 'post',
      data: userData
    })
  },

  // 更新用户
  updateUser(userid, userData) {
    return request({
      url: `/users/${userid}`,
      method: 'put',
      data: userData
    })
  },

  // 删除用户
  deleteUser(userid) {
    return request({
      url: `/users/${userid}`,
      method: 'delete'
    })
  },

  // 获取单个用户详情
  getUserById(userid) {
    return request({
      url: `/users/${userid}`,
      method: 'get'
    })
  },

  // 获取所有用户
  getAllUsers() {
    return request({
      url: '/users',
      method: 'get'
    })
  },

  
  // 修改密码
  changePassword(userid, passwordData) {
    return request({
      url: `/users/${userid}/password`,
      method: 'put',
      data: passwordData
    })
  }
}

export default usersApi
