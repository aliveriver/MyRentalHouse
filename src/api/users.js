import request from './request'

// 用户相关接口
const usersApi = {
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

  
  /**
   * 修改用户
   * @param {string} passwordData.username - 用户ID
   * @param {string} passwordData.password - 用户新密码
   * @param {string} passwordData.email - 用户新email
   * @param {string} passwordData.phonenumber - 用户手机
   * @param {string} passwordData.registrationtime - 时间
   * @param {string} passwordData.role - ？？？？
   * 
   */
  changePassword(userid, passwordData) {
    return request({
      url: `/users/${userid}`,
      method: 'put',
      data: passwordData
    })
  }
}

export default usersApi
