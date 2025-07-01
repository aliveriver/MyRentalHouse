import request from './request';

/**
 * 获取平台总体统计数据
 */
export const getDashboardStats = () => {
  return request({
    url: '/dashboard/stats',
    method: 'get',
  });
};

/**
 * 获取用户统计数据
 */
export const getUserStats = () => {
  return request({
    url: '/dashboard/users',
    method: 'get',
  });
};

/**
 * 获取房源统计数据
 */
export const getPropertyStats = () => {
  return request({
    url: '/dashboard/properties',
    method: 'get',
  });
};

/**
 * 获取预约统计数据
 */
export const getAppointmentStats = () => {
  return request({
    url: '/dashboard/appointments',
    method: 'get',
  });
};

/**
 * 获取合同统计数据
 */
export const getContractStats = () => {
  return request({
    url: '/dashboard/contracts',
    method: 'get',
  });
};

/**
 * 获取收藏统计数据
 */
export const getFavoriteStats = () => {
  return request({
    url: '/dashboard/favorites',
    method: 'get',
  });
};

/**
 * 获取月度统计数据（用于图表）
 */
export const getMonthlyStats = () => {
  return request({
    url: '/dashboard/monthly',
    method: 'get',
  });
};

const dashboardApi = {
  getDashboardStats,
  getUserStats,
  getPropertyStats,
  getAppointmentStats,
  getContractStats,
  getFavoriteStats,
  getMonthlyStats,
};

export default dashboardApi;
