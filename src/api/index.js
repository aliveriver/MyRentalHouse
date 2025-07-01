// API 统一导出文件
import { contractsApi } from './contracts';
import dashboardApi from './dashboard';
import favoritesApi from './favorites';
import infoApi from './info';
import profileApi from './profile';
import propertiesApi from './properties';
import userManagementApi from './userManagement';
import usersApi from './users';
import viewingAppointmentsApi from './viewingAppointments';

export {
  contractsApi,
  dashboardApi,
  favoritesApi,
  infoApi,
  profileApi,
  propertiesApi,
  userManagementApi,
  usersApi,
  viewingAppointmentsApi,
};

// 也可以作为默认导出
export default {
  users: usersApi,
  profile: profileApi,
  userManagement: userManagementApi,
  properties: propertiesApi,
  info: infoApi,
  favorites: favoritesApi,
  viewingAppointments: viewingAppointmentsApi,
  contracts: contractsApi,
  dashboard: dashboardApi,
};
