// API 统一导出文件
import profileApi from './profile'
import userManagementApi from './userManagement'
import usersApi from './users'

export { profileApi, userManagementApi, usersApi }

// 也可以作为默认导出
export default {
  users: usersApi,
  profile: profileApi,
  userManagement: userManagementApi,
}
