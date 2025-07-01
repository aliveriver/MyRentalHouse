// API 统一导出文件
import infoApi from './info';
import profileApi from './profile';
import propertiesApi from './properties';
import userManagementApi from './userManagement';
import usersApi from './users';

export { infoApi, profileApi, propertiesApi, userManagementApi, usersApi };

// 也可以作为默认导出
export default {
  users: usersApi,
  profile: profileApi,
  userManagement: userManagementApi,
  properties: propertiesApi,
  info: infoApi,
};
