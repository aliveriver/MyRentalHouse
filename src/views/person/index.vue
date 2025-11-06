<template>
  <div class="person-center">
    <el-row :gutter="20">
      <!-- 个人信息卡片 -->
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar
              :size="80"
              src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
            />
            <div class="profile-info">
              <h3>{{ userForm.username || '未设置' }}</h3>
              <p>{{ getRoleText(userForm.role) }}</p>
            </div>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-number">{{ userForm.userid || '0' }}</div>
              <div class="stat-label">用户ID</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ formatDate(userForm.registrationtime) }}
              </div>
              <div class="stat-label">注册时间</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ getRoleText(userForm.role) }}
              </div>
              <div class="stat-label">用户类型</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 基本信息设置 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-form
            :model="userForm"
            :rules="profileRules"
            ref="profileFormRef"
            label-width="100px"
            class="profile-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input
                    v-model="userForm.username"
                    placeholder="请输入用户名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户ID">
                  <el-input :value="userForm.userid" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号" prop="phonenumber">
                  <el-input
                    v-model="userForm.phonenumber"
                    placeholder="请输入手机号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input
                    v-model="userForm.email"
                    placeholder="请输入邮箱地址"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="角色">
                  <el-input :value="getRoleText(userForm.role)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="注册时间">
                  <el-input
                    :value="formatDateTime(userForm.registrationtime)"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- <el-form-item label="当前密码" prop="password">
              <el-input
                v-model="userForm.password"
                type="password"
                show-password
                placeholder="请输入当前密码以验证身份"
              />
            </el-form-item> -->
            <el-form-item>
              <el-button type="primary" @click="saveProfile" :loading="saving">
                保存信息
              </el-button>
              <el-button @click="resetProfile">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 密码修改 -->
      <el-col :span="8">
        <el-card style="height: 100%">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>
          <el-form
            :model="passwordForm"
            :rules="passwordRules"
            ref="passwordFormRef"
            label-width="100px"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
                placeholder="请输入当前密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="changePassword"
                :loading="changingPassword"
              >
                修改密码
              </el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 账户信息 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>账户信息</span>
            </div>
          </template>
          <div class="account-info">
            <div class="info-item">
              <div class="info-label">用户ID:</div>
              <div class="info-value">{{ userForm.userid || 'N/A' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">用户名:</div>
              <div class="info-value">{{ userForm.username || 'N/A' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">邮箱:</div>
              <div class="info-value">{{ userForm.email || 'N/A' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">手机号:</div>
              <div class="info-value">{{ userForm.phonenumber || 'N/A' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">角色:</div>
              <div class="info-value">
                <el-tag
                  :type="userInfo.role === 'admin' ? 'danger' : 'primary'"
                  size="small"
                >
                  {{ getRoleText(userForm.role) }}
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">注册时间:</div>
              <div class="info-value">
                {{ formatDateTime(userForm.registrationtime) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usersApi } from '../../api/index'
import useStore from "@/store/index"
import { getRoleDisplayName } from '@/utils/userRole'

const store = useStore()
const passwordFormRef = ref(null)
const profileFormRef = ref(null)
const saving = ref(false)
const changingPassword = ref(false)

// 从store获取用户信息
const userInfo = computed(() => store.userInfo || {})

// 用户编辑表单数据
const userForm = reactive({
  username: '',
  email: '',
  phonenumber: '',
  password: '',
  registrationtime: '',
  role: ''
})

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 个人信息表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度在2到50个字符', trigger: 'blur' }
  ],
  phonenumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入当前密码以验证身份', trigger: 'blur' }
  ]
}

// 密码验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 根据角色获取文本 - 使用统一的角色工具
const getRoleText = (role) => {
  return getRoleDisplayName(role);
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  } catch (error) {
    return 'N/A'
  }
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN')
  } catch (error) {
    return 'N/A'
  }
}

// 初始化表单数据
const initFormData = async () => {
  try {
    // 调用新的查询接口 GET /auth/me，不需要传递用户ID
    const response = await usersApi.getCurrentUser()

    if (response.success) {
      const user = response.data
      // 适配新接口返回的字段：userid, username, avatar, registrationtime, role
      userForm.userid = user.userid || ''
      userForm.username = user.username || ''
      userForm.email = user.email || ''
      userForm.password = user.password || ''
      userForm.phonenumber = user.phoneNumber || user.phonenumber || ''
      userForm.registrationtime = user.registrationtime || user.registrationTime || ''
      userForm.role = user.role || ''

      console.log('用户信息加载成功:', user)
    } else {
      ElMessage.error(response.errorMsg || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败：' + (error.response?.data?.message || error.message))
  }
}

// 保存个人信息
const saveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) {
      ElMessage.error('请检查输入信息')
      return
    }

    await ElMessageBox.confirm(
      '确定要保存修改的个人信息吗？',
      '确认保存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    saving.value = true

    const userId = userInfo.value.id || userInfo.value.userid;

    const updateData = {
      username: userForm.username,
      email: userForm.email,
      phonenumber: userForm.phonenumber,
      password: userForm.password,
      registrationtime: userForm.registrationtime,
      role: userForm.role
    }

    const response = await usersApi.updateUser(userId, updateData)

    if (response.success) {
      ElMessage.success('个人信息保存成功')
      // 更新store中的用户信息
      store.setUserInfo({
        ...userInfo.value,
        name: userForm.username,
        username: userForm.username,
        email: userForm.email,
        phoneNumber: userForm.phonenumber,
        phonenumber: userForm.phonenumber
      })
      // 清空密码字段
      userForm.password = ''
      profileFormRef.value?.clearValidate()
    } else {
      ElMessage.error(response.errorMsg || '保存信息失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      return // 用户取消操作
    }
    console.error('保存用户信息失败:', error)
    ElMessage.error('保存信息失败，请稍后再试')
  } finally {
    saving.value = false
  }
}

// 重置个人信息表单
const resetProfile = () => {
  initFormData()
  profileFormRef.value?.clearValidate()
  ElMessage.info('已重置到初始状态')
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) {
      ElMessage.error('请检查输入信息')
      return
    }

    await ElMessageBox.confirm(
      '确定要修改密码吗？修改后需要重新登录。',
      '确认修改密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    changingPassword.value = true

    const userId = userInfo.value.id || userInfo.value.userid;

    const passwordData = {
      username: userForm.username,
      email: userForm.email,
      phonenumber: userForm.phonenumber,
      password: passwordForm.newPassword, // 使用新密码
      registrationtime: userForm.registrationtime,
      role: userForm.role
    }

    const response = await usersApi.updateUser(userId, passwordData)

    if (response.success) {
      ElMessage.success('密码修改成功，请重新登录')
      resetPasswordForm()

      // 密码修改成功后，建议用户重新登录
      setTimeout(() => {
        store.logout()
        window.location.href = '/login'
      }, 2000)
    } else {
      ElMessage.error(response.errorMsg || '密码修改失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      return // 用户取消操作
    }
    console.error('修改密码失败:', error)
    ElMessage.error('密码修改失败，请稍后再试')
  } finally {
    changingPassword.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordFormRef.value?.clearValidate()
}

// 组件挂载时初始化数据
onMounted(() => {
  if (!store.isLogin) {
    ElMessage.warning('请先登录')
    return
  }
  initFormData()
})
</script>

<style lang="scss" scoped>
.person-center {
  .profile-card {
    height: 100%;

    .profile-header {
      display: flex;
      align-items: center;
      margin-bottom: 30px;

      .profile-info {
        margin-left: 20px;

        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #333;
        }

        p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }

    .profile-stats {
      display: flex;
      justify-content: space-around;
      text-align: center;

      .stat-item {
        .stat-number {
          font-size: 16px;
          font-weight: 600;
          color: #409eff;
          margin-bottom: 8px;
          word-break: break-all;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  .card-header {
    font-weight: 600;
    color: #333;
  }

  .profile-form {
    :deep(.el-form-item__label) {
      font-weight: 600;
    }
  }

  .account-info {
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-weight: 600;
        color: #333;
        min-width: 80px;
      }

      .info-value {
        color: #666;
        text-align: right;
        word-break: break-all;
      }
    }
  }
}

@media (max-width: 768px) {
  .person-center {
    .el-row {
      margin: 0 !important;

      .el-col {
        margin-bottom: 20px;
      }
    }

    .profile-stats {
      .stat-item {
        .stat-number {
          font-size: 14px;
        }
      }
    }

    .profile-form {
      :deep(.el-form-item__label) {
        width: 80px !important;
      }
    }

    .account-info {
      .info-item {
        flex-direction: column;
        align-items: flex-start;

        .info-value {
          text-align: left;
          margin-top: 4px;
        }
      }
    }
  }
}
</style>
