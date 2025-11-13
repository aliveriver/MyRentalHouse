import request from './request.js';

/**
 * 账单管理API
 */
export const billsApi = {
  /**
   * 获取买家的待支付账单列表
   * @returns {Promise} 响应数据
   */
  getPendingBillsByBuyer: () => {
    return request({
      url: '/bills/buyer/pending',
      method: 'get',
    });
  },

  /**
   * 获取买家的所有账单列表
   * @returns {Promise} 响应数据
   */
  getAllBillsByBuyer: () => {
    return request({
      url: '/bills/buyer/all',
      method: 'get',
    });
  },

  /**
   * 根据ID获取账单详情
   * @param {number} billId - 账单ID
   * @returns {Promise} 响应数据
   */
  getBillById: (billId) => {
    return request({
      url: `/bills/${billId}`,
      method: 'get',
    });
  },

  /**
   * 支付账单
   * @param {number} billId - 账单ID
   * @param {Object} paymentData - 支付数据
   * @param {string} paymentData.paymentMethod - 支付方式（支付宝、微信支付、银行卡）
   * @param {string} paymentData.paymentTransactionId - 支付交易号（可选）
   * @returns {Promise} 响应数据
   */
  payBill: (billId, paymentData) => {
    return request({
      url: `/bills/${billId}/pay`,
      method: 'post',
      data: paymentData,
    });
  },

  /**
   * 取消账单
   * @param {number} billId - 账单ID
   * @returns {Promise} 响应数据
   */
  cancelBill: (billId) => {
    return request({
      url: `/bills/${billId}/cancel`,
      method: 'post',
    });
  },

  /**
   * 撤回账单（买家可以撤回服务费账单，同时删除对应的合同记录）
   * @param {number} billId - 账单ID
   * @returns {Promise} 响应数据
   */
  withdrawBill: (billId) => {
    return request({
      url: `/bills/${billId}/withdraw`,
      method: 'post',
    });
  },
};

