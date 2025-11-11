import request from './request';
import { extractUserId } from '@/utils/jwt';

// 用户个人资料相关接口
const profileApi = {
  // 获取当前用户信息
  getCurrentUser() {
    // 从JWT token中提取用户ID
    const userId = extractUserId();
    if (!userId) {
      return Promise.reject(new Error('未找到用户ID，请先登录'));
    }
    return request({
      url: `/api/users/${userId}`,
      method: 'get',
    });
  },
  // 更新个人基本信息（包括密码修改）
  updateProfile(profileData) {
    return request({
      url: '/users/profile/username',
      method: 'put',
      data: profileData,
    });
  },

  // 上传头像
  uploadAvatar(avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    return request({
      url: '/users/upload-avatar',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 获取登录日志
  getLoginLogs(params = {}) {
    return request({
      url: '/users/login-logs',
      method: 'get',
      params,
    });
  },
};

export default profileApi;
