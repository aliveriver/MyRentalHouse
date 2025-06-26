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
              <h3>管理员</h3>
              <p>系统管理员</p>
            </div>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-number">1,247</div>
              <div class="stat-label">管理房源</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">892</div>
              <div class="stat-label">成功交易</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">98.5%</div>
              <div class="stat-label">满意度</div>
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
            :model="displayForm"
            :rules="profileRules"
            ref="profileFormRef"
            label-width="100px"
            class="profile-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="displayForm.name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工号">
                  <el-input v-model="displayForm.employeeId" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="displayForm.phone" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="displayForm.email" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="部门">
                  <el-select
                    v-model="displayForm.department"
                    style="width: 100%"
                  >
                    <el-option label="房源管理部" value="house" />
                    <el-option label="客户服务部" value="service" />
                    <el-option label="技术部" value="tech" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="角色">
                  <el-input v-model="displayForm.role" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="个人简介">
              <el-input
                v-model="displayForm.bio"
                type="textarea"
                :rows="3"
                placeholder="请输入个人简介"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProfile"
                >保存信息</el-button
              >
              <el-button @click="resetProfile">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 密码修改 -->
      <el-col :span="12">
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
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePassword"
                >修改密码</el-button
              >
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 登录日志 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近登录记录</span>
            </div>
          </template>
          <div class="login-logs">
            <div v-for="log in loginLogs" :key="log.id" class="log-item">
              <div class="log-info">
                <div class="log-time">{{ log.loginTime }}</div>
                <div class="log-location">{{ log.location }}</div>
              </div>
              <div class="log-device">{{ log.device }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import profileApi from '@/api/profile'

const passwordFormRef = ref(null)
const profileFormRef = ref(null)

 // 当前用户ID，实际应该从登录状态获取
const currentUserId = ref('1')

// 用于显示的表单数据
const displayForm = reactive({
  name: '张三',
  employeeId: 'EMP001',
  phone: '13800138000',
  email: 'admin@example.com',
  department: 'house',
  role: '系统管理员',
  bio: '负责房源管理系统的日常维护和数据管理工作'
})

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 个人信息表单验证规则
const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在2到50个字符', trigger: 'blur' }
  ],
  phone: [
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

// 登录日志
const loginLogs = ref([
  {
    id: 1,
    loginTime: '2024-01-22 09:30:25',
    location: '北京市朝阳区',
    device: 'Chrome 120.0 / Windows 10'
  },
  {
    id: 2,
    loginTime: '2024-01-21 14:15:42',
    location: '北京市朝阳区',
    device: 'Chrome 120.0 / Windows 10'
  },
  {
    id: 3,
    loginTime: '2024-01-20 08:45:18',
    location: '北京市朝阳区',
    device: 'Chrome 120.0 / Windows 10'
  },
  {
    id: 4,
    loginTime: '2024-01-19 16:22:35',
    location: '北京市朝阳区',
    device: 'Safari 17.0 / MacOS'
  },
  {
    id: 5,
    loginTime: '2024-01-18 10:10:10',
    location: '北京市海淀区',
    device: 'Chrome 120.0 / Windows 10'
  }
])

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await profileApi.getCurrentUser()

    if (response) {
      // 更新显示表单
      Object.assign(displayForm, {
        name: response.username || '未设置',
        employeeId: `USER${response.id || '000'}`,
        phone: response.phonenumber || '未设置',
        email: response.email || '未设置',
        department: response.department || "house",
        role: getRoleText(response.role),
        bio: response.bio || '负责房源管理系统的日常维护和数据管理工作'
      })
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 根据角色获取文本
const getRoleText = (role) => {
  const roleMap = {
    '1': '普通用户',
  }
  return roleMap[role] || '普通用户'
}

const saveProfile = async () => {
  // 验证表单
  if (!profileFormRef.value) return

  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) {
      ElMessage.error('请检查输入信息')
      return
    }

    // 准备更新数据
    const updateData = {
      username: displayForm.name,
      email: displayForm.email,
      phonenumber: displayForm.phone,
      department: displayForm.department,
      bio: displayForm.bio
    }

    // 使用profile API更新信息
    const response = await profileApi.updateProfile(updateData)

    if (response) {
      ElMessage.success('个人信息保存成功')
      // 重新获取用户信息
      await getUserInfo()
    }
  } catch (error) {
    console.error('保存用户信息失败:', error)
    ElMessage.error('保存信息失败')
  }
}

const resetProfile = () => {
  // 重新获取用户信息
  getUserInfo()
  // 清除表单验证状态
  profileFormRef.value?.clearValidate()
  ElMessage.info('已重置到初始状态')
}

const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) {
      ElMessage.error('请检查输入信息')
      return
    }

    // 使用 profile 接口修改密码
    const passwordData = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }

    const response = await profileApi.updateProfile(passwordData)

    if (response) {
      ElMessage.success('密码修改成功')
      resetPasswordForm()
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('密码修改失败')
  }
}

const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordFormRef.value?.clearValidate()
}

// 组件挂载时获取用户信息
onMounted(() => {
  getUserInfo()
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
          font-size: 24px;
          font-weight: 600;
          color: #409eff;
          margin-bottom: 8px;
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

  .login-logs {
    max-height: 300px;
    overflow-y: auto;

    .log-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .log-info {
        .log-time {
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
        }

        .log-location {
          font-size: 12px;
          color: #999;
        }
      }

      .log-device {
        font-size: 12px;
        color: #666;
        text-align: right;
      }
    }
  }
}
</style>
