// API 统一导出文件
import { billsApi } from './bills';
import { contractsApi } from './contracts';
import dashboardApi from './dashboard';
import favoritesApi from './favorites';
import filesApi from './files';
import infoApi from './info';
import profileApi from './profile';
import propertiesApi from './properties';
import userManagementApi from './userManagement';
import usersApi from './users';
import viewingAppointmentsApi from './viewingAppointments';

export {
  billsApi,
  contractsApi,
  dashboardApi,
  favoritesApi,
  filesApi,
  infoApi,
  profileApi,
  propertiesApi,
  userManagementApi,
  usersApi,
  viewingAppointmentsApi,
};

// 也可以作为默认导出
export default {
  bills: billsApi,
  users: usersApi,
  profile: profileApi,
  userManagement: userManagementApi,
  properties: propertiesApi,
  info: infoApi,
  favorites: favoritesApi,
  viewingAppointments: viewingAppointmentsApi,
  contracts: contractsApi,
  dashboard: dashboardApi,
  files: filesApi,
};
