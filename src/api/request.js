import axios from 'axios';
import { ElMessage } from 'element-plus';

window.axios = axios; // 将axios挂载到window对象上，方便全局访问

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // JWT认证不需要携带cookie
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 在请求发送之前做一些处理
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const { data } = response;

    // 如果响应中包含新的token，更新本地存储
    if (data && data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },
  (error) => {
    console.error('Response error:', error);

    // 处理错误响应
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // JWT token过期或无效
          ElMessage.error('登录已过期，请重新登录');
          // 清除token并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberUntil');
          // 避免循环跳转
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          ElMessage.error('权限不足，无法访问该资源');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        default:
          ElMessage.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接');
    } else {
      ElMessage.error('请求配置错误');
    }

    return Promise.reject(error);
  }
);

export default request;
