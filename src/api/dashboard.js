import request from './request';

/**
 * 获取平台总体统计数据
 * 返回所有统计数据，包括用户、房源、预约、合同、收藏、账单和月度统计
 */
export const getDashboardStats = () => {
  return request({
    url: '/dashboard/stats',
    method: 'get',
  });
};

const dashboardApi = {
  getDashboardStats,
};

export default dashboardApi;
