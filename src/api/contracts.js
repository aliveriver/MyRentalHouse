import request from './request.js';

/**
 * 合同管理API
 */
export const contractsApi = {
  /**
   * 创建合同
   * @param {Object} contractData - 合同数据
   * @param {number} contractData.propertyid - 房源ID
   * @param {number} contractData.buyerid - 买家ID
   * @param {string} contractData.signingdate - 签订日期
   * @param {string} contractData.contractstatus - 合同状态
   * @returns {Promise} 响应数据
   */
  createContract: (contractData) => {
    return request({
      url: '/contracts',
      method: 'post',
      data: contractData,
    });
  },

  /**
   * 获取所有合同
   * @returns {Promise} 响应数据
   */
  getAllContracts: () => {
    return request({
      url: '/contracts',
      method: 'get',
    });
  },

  /**
   * 根据ID获取合同详情
   * @param {number} contractId - 合同ID
   * @returns {Promise} 响应数据
   */
  getContractById: (contractId) => {
    return request({
      url: `/contracts/${contractId}`,
      method: 'get',
    });
  },

  /**
   * 更新合同
   * @param {number} contractId - 合同ID
   * @param {Object} contractData - 更新的合同数据
   * @returns {Promise} 响应数据
   */
  updateContract: (contractId, contractData) => {
    return request({
      url: `/contracts/${contractId}`,
      method: 'put',
      data: contractData,
    });
  },

  /**
   * 删除合同
   * @param {number} contractId - 合同ID
   * @returns {Promise} 响应数据
   */
  deleteContract: (contractId) => {
    return request({
      url: `/contracts/${contractId}`,
      method: 'delete',
    });
  },

  /**
   * 根据买家ID获取合同列表
   * @param {number} buyerId - 买家ID
   * @returns {Promise} 响应数据
   */
  getContractsByBuyerId: (buyerId) => {
    return request({
      url: `/contracts/buyer/${buyerId}`,
      method: 'get',
    });
  },

  /**
   * 根据房源ID获取合同列表
   * @param {number} propertyId - 房源ID
   * @returns {Promise} 响应数据
   */
  getContractsByPropertyId: (propertyId) => {
    return request({
      url: `/contracts/property/${propertyId}`,
      method: 'get',
    });
  },
};
