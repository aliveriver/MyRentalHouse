import request from './request';

// 用户收藏相关接口
const favoritesApi = {
  // 分页获取用户收藏列表
  getFavorites(page, size) {
    return request({
      url: '/users/favorites',
      method: 'get',
      params: {
        page,
        size,
      },
    });
  },

  // 收藏房源
  addFavorite(propertyId) {
    return request({
      url: `/users/favorites/${propertyId}`,
      method: 'post',
    });
  },

  // 取消收藏
  removeFavorite(propertyId) {
    return request({
      url: `/users/favorites/${propertyId}`,
      method: 'delete',
    });
  },

  // 检查是否收藏
  checkFavorite(propertyId) {
    return request({
      url: `/users/favorites/check/${propertyId}`,
      method: 'get',
    });
  },
};

export default favoritesApi;
