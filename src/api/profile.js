import request from './request'

// 用户个人资料相关接口
const profileApi = {
  // 获取当前用户信息
  getCurrentUser() {
    return request({
      url: '/users/profile',
      method: 'get'
    })
  },
  // 更新个人基本信息（包括密码修改）
  updateProfile(profileData) {
    return request({
      url: '/users/profile',
      method: 'put',
      data: profileData
    })
  },

  // 上传头像
  uploadAvatar(avatarFile) {
    const formData = new FormData()
    formData.append('avatar', avatarFile)
    
    return request({
      url: '/users/upload-avatar',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取登录日志
  getLoginLogs(params = {}) {
    return request({
      url: '/users/login-logs',
      method: 'get',
      params
    })
  }
}

export default profileApi
