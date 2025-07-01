import request from './request';

// 资讯管理相关接口
const infoApi = {
  /**
   * 创建资讯
   * @param {Object} infoData - 资讯数据
   * @param {number} infoData.infocategoryid - 资讯分类ID
   * @param {string} infoData.title - 标题
   * @param {string} infoData.content - 内容
   * @param {string} infoData.publishdate - 发布日期
   * @param {number} infoData.publisherid - 发布者ID
   * @param {number[]} infoData.tagIds - 标签ID列表
   */
  createInfo(infoData) {
    return request({
      url: '/info',
      method: 'post',
      data: infoData,
    });
  },

  /**
   * 更新资讯
   * @param {number} infoid - 资讯ID
   * @param {Object} infoData - 资讯数据
   */
  updateInfo(infoid, infoData) {
    return request({
      url: `/info/${infoid}`,
      method: 'put',
      data: infoData,
    });
  },

  /**
   * 删除资讯
   * @param {number} infoid - 资讯ID
   */
  deleteInfo(infoid) {
    return request({
      url: `/info/${infoid}`,
      method: 'delete',
    });
  },

  /**
   * 查询单个资讯
   * @param {number} infoid - 资讯ID
   */
  getInfoById(infoid) {
    return request({
      url: `/info/${infoid}`,
      method: 'get',
    });
  },

  /**
   * 查询所有资讯
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   * @param {string} params.search - 搜索关键词
   * @param {string} params.category - 分类筛选
   */
  getAllInfo(params = {}) {
    return request({
      url: '/info',
      method: 'get',
      params,
    });
  },

  /**
   * 批量删除资讯
   * @param {number[]} id - 资讯ID列表
   */
  batchDeleteInfo(id) {
    return request({
      url: '/info/' + id,
      method: 'delete',
    });
  },

  /**
   * 按分类筛选资讯
   * @param {number} categoryid - 分类ID
   */
  getInfoByCategory(categoryid) {
    return request({
      url: '/info',
      method: 'get',
      params: { infocategoryid: categoryid },
    });
  },

  /**
   * 搜索资讯
   * @param {Object} searchParams - 搜索参数
   * @param {string} searchParams.keyword - 关键词
   * @param {number} searchParams.categoryid - 分类ID
   * @param {string} searchParams.startDate - 开始日期
   * @param {string} searchParams.endDate - 结束日期
   */
  searchInfo(searchParams) {
    return request({
      url: '/info',
      method: 'get',
      params: searchParams,
    });
  },
};

export default infoApi;
