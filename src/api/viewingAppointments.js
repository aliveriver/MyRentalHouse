import request from './request';

// 预约看房相关接口
const viewingAppointmentsApi = {
  // 用户申请预约看房
  applyAppointment(appointmentData) {
    return request({
      url: '/viewingappointments/apply',
      method: 'post',
      data: appointmentData,
    });
  },

  // 管理员审批预约
  approveAppointment(appointmentId, statusStr) {
    return request({
      url: `/viewingappointments/approve/${appointmentId}`,
      method: 'put',
      params: {
        statusStr,
      },
    });
  },

  // 更新预约信息
  updateAppointment(appointmentId, appointmentData) {
    return request({
      url: `/viewingappointments/${appointmentId}`,
      method: 'put',
      data: appointmentData,
    });
  },

  // 删除预约
  deleteAppointment(appointmentId) {
    return request({
      url: `/viewingappointments/${appointmentId}`,
      method: 'delete',
    });
  },

  // 查询单个预约
  getAppointmentById(appointmentId) {
    return request({
      url: `/viewingappointments/${appointmentId}`,
      method: 'get',
    });
  },

  // 查询所有预约
  getAllAppointments() {
    return request({
      url: '/viewingappointments',
      method: 'get',
    });
  },
};

export default viewingAppointmentsApi;
