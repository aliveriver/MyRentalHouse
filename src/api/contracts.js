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

  /**
   * 买家提出合同签订申请
   * @param {Object} requestData - 申请数据
   * @param {number} requestData.propertyId - 房源ID
   * @param {string} requestData.contractFileUri - 合同文件URI
   * @returns {Promise} 响应数据
   */
  applyContract: (requestData) => {
    return request({
      url: '/contracts/apply',
      method: 'post',
      data: requestData,
    });
  },

  /**
   * 卖家查看待审核的合同列表
   * @returns {Promise} 响应数据
   */
  getPendingContractsBySeller: () => {
    return request({
      url: '/contracts/seller/pending',
      method: 'get',
    });
  },

  /**
   * 卖家签订合同
   * @param {number} contractId - 合同ID
   * @returns {Promise} 响应数据
   */
  signContract: (contractId) => {
    return request({
      url: `/contracts/${contractId}/sign`,
      method: 'post',
    });
  },

  /**
   * 上传合同文件
   * @param {File} file - 合同文件
   * @returns {Promise} 响应数据
   */
  uploadContractFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return request({
      url: '/files/upload/contract',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
