import request from './request';

// 房源管理相关接口
const propertiesApi = {
  /**
   * 创建房源
   * @param {Object} propertyData - 房源数据
   * @param {string} propertyData.title - 房源标题
   * @param {string} propertyData.description - 房源描述
   * @param {number} propertyData.price - 价格
   * @param {number} propertyData.area - 面积
   * @param {string} propertyData.layout - 户型
   * @param {string} propertyData.address - 房源地址
   * @param {string} propertyData.publishdate - 发布日期
   * @param {string} propertyData.status - 状态
   * @param {number} propertyData.sellerid - 卖家ID
   * @param {number[]} propertyData.tagIds - 标签ID列表
   */
  createProperty(propertyData) {
    return request({
      url: '/properties',
      method: 'post',
      data: propertyData,
    });
  },

  /**
   * 更新房源
   * @param {number} propertyid - 房源ID
   * @param {Object} propertyData - 房源数据
   */
  updateProperty(propertyid, propertyData) {
    return request({
      url: `/properties/${propertyid}`,
      method: 'put',
      data: propertyData,
    });
  },

  /**
   * 删除房源
   * @param {number} propertyid - 房源ID
   */
  deleteProperty(propertyid) {
    return request({
      url: `/properties/${propertyid}`,
      method: 'delete',
    });
  },

  /**
   * 查询单个房源
   * @param {number} propertyid - 房源ID
   */
  getPropertyById(propertyid) {
    return request({
      url: `/properties/${propertyid}`,
      method: 'get',
    });
  },

  /**
   * 查询所有房源
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   * @param {string} params.search - 搜索关键词
   * @param {string} params.status - 状态筛选
   */
  getAllProperties(params = {}) {
    return request({
      url: '/properties',
      method: 'get',
      params,
    });
  },

  /**
   * 批量删除房源
   * @param {number[]} id - 房源ID
   */
  batchDeleteProperties(id) {
    return request({
      url: '/properties/' + id,
      method: 'delete',
    });
  },

  /**
   * 按状态筛选房源
   * @param {string} status - 状态（在售、已售等）
   */
  getPropertiesByStatus(status) {
    return request({
      url: '/properties',
      method: 'get',
      params: { status },
    });
  },

  /**
   * 搜索房源
   * @param {Object} searchParams - 搜索参数
   * @param {string} searchParams.keyword - 关键词
   * @param {number} searchParams.minPrice - 最低价格
   * @param {number} searchParams.maxPrice - 最高价格
   * @param {string} searchParams.area - 面积范围
   * @param {string} searchParams.layout - 户型
   */
  searchProperties(searchParams) {
    return request({
      url: '/properties',
      method: 'get',
      params: searchParams,
    });
  },

  /**
   * 管理员审核房源
   * @param {number} propertyid - 房源ID
   * @param {string} status - 审核状态（'在售'表示审核通过，'审核拒绝'表示审核拒绝）
   */
  approveProperty(propertyid, status) {
    return request({
      url: `/properties/approve/${propertyid}`,
      method: 'put',
      params: { status },
    });
  },
};

export default propertiesApi;
