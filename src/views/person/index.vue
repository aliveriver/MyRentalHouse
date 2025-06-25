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
            :model="profileForm"
            label-width="100px"
            class="profile-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名">
                  <el-input v-model="profileForm.name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工号">
                  <el-input v-model="profileForm.employeeId" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号">
                  <el-input v-model="profileForm.phone" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱">
                  <el-input v-model="profileForm.email" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="部门">
                  <el-select
                    v-model="profileForm.department"
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
                  <el-input v-model="profileForm.role" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="个人简介">
              <el-input
                v-model="profileForm.bio"
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const passwordFormRef = ref(null)

// 个人信息表单
const profileForm = reactive({
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

// 方法
const saveProfile = () => {
  ElMessage.success('个人信息保存成功')
}

const resetProfile = () => {
  // 重置到初始值
  Object.assign(profileForm, {
    name: '张三',
    employeeId: 'EMP001',
    phone: '13800138000',
    email: 'admin@example.com',
    department: 'house',
    role: '系统管理员',
    bio: '负责房源管理系统的日常维护和数据管理工作'
  })
  ElMessage.info('已重置到初始状态')
}

const changePassword = () => {
  passwordFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('密码修改成功')
      resetPasswordForm()
    } else {
      ElMessage.error('请检查输入信息')
    }
  })
}

const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordFormRef.value?.clearValidate()
}
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
