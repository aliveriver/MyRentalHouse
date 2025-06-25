<template>
  <div class="createuser-container">
    <!-- 左侧装饰区域 -->
    <div class="left-section">
      <div class="decoration-icon">
        <div class="mountain-icon">
          <div class="circle"></div>
          <div class="mountain"></div>
        </div>
      </div>
    </div>

    <!-- 右侧注册表单区域 -->
    <div class="right-section">
      <div class="createuser-form">
        <h2 class="welcome-title">注册新账号</h2>

        <el-form ref="formRef" :model="form" :rules="rules" class="form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
              class="input-field"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              class="input-field"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请确认密码"
              prefix-icon="Lock"
              size="large"
              class="input-field"
              show-password
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱地址"
              prefix-icon="Message"
              size="large"
              class="input-field"
            />
          </el-form-item>

          <el-form-item prop="phonenumber">
            <el-input
              v-model="form.phonenumber"
              placeholder="请输入手机号码"
              prefix-icon="Phone"
              size="large"
              class="input-field"
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="agreeTerms" class="agree-checkbox">
              我已阅读并同意<span class="terms-link">《用户协议》</span>和<span
                class="terms-link"
                >《隐私政策》</span
              >
            </el-checkbox>
          </div>

          <el-button
            type="primary"
            size="large"
            class="createuser-btn"
            @click="onSubmit"
            :loading="loading"
            :disabled="!agreeTerms"
          >
            注册
          </el-button>

          <div class="form-footer">
            <span class="login-link" @click="goToLogin"
              >已有账号？立即登录</span
            >
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router"
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Phone } from '@element-plus/icons-vue'
import usersApi from '../../api/users'

const router = useRouter()
const loading = ref(false)
const agreeTerms = ref(false)

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phonenumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

const formRef = ref(null)
const form = ref({
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
  phonenumber: "",
  role: "1"
})

// 提交注册表单
const onSubmit = async () => {
  if (!agreeTerms.value) {
    ElMessage.warning('请先同意用户协议和隐私政策')
    return
  }

  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true
      try {
        // 构造注册数据，按照接口文档格式
        const registerData = {
          username: form.value.username,
          password: form.value.password,
          email: form.value.email,
          phonenumber: form.value.phonenumber,
          registrationtime: new Date().toISOString(),
          role: form.value.role
        }

        const response = await usersApi.createUser(registerData)

        if (response) {
          ElMessage.success('注册成功！请前往登录')
          router.push('/login')
        } else {
          ElMessage.error('注册失败，请稍后重试')
        }
      } catch (error) {
        console.error('注册失败:', error)
        ElMessage.error('注册失败：' + (error.message || '网络错误'))
      } finally {
        loading.value = false
      }
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.createuser-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;

  .left-section {
    flex: 3;
    background-color: #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .decoration-icon {
      .mountain-icon {
        position: relative;

        .circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #c0c0c0;
          margin: 0 auto 20px;
        }

        .mountain {
          width: 0;
          height: 0;
          border-left: 100px solid transparent;
          border-right: 100px solid transparent;
          border-bottom: 120px solid #a8a8a8;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 20px;
            left: -80px;
            width: 0;
            height: 0;
            border-left: 80px solid transparent;
            border-right: 80px solid transparent;
            border-bottom: 100px solid #969696;
          }
        }
      }
    }
  }

  .right-section {
    flex: 1;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow-y: auto;

    .createuser-form {
      width: 100%;
      max-width: 400px;

      .welcome-title {
        font-size: 24px;
        font-weight: 500;
        color: #333;
        margin-bottom: 30px;
        text-align: left;
      }

      .form {
        .input-field {
          margin-bottom: 10px;

          :deep(.el-input__wrapper) {
            border-radius: 6px;
            border: 1px solid #e0e0e0;
            box-shadow: none;

            &:hover {
              border-color: #c0c0c0;
            }

            &.is-focus {
              border-color: #409eff;
              box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
            }
          }

          :deep(.el-input__inner) {
            font-size: 14px;
            color: #333;

            &::placeholder {
              color: #999;
            }
          }

          :deep(.el-input__prefix) {
            color: #999;
          }

          :deep(.el-select .el-input__wrapper) {
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }
        }

        .form-options {
          margin-bottom: 20px;

          .agree-checkbox {
            :deep(.el-checkbox__label) {
              color: #666;
              font-size: 14px;
              line-height: 1.4;
            }

            .terms-link {
              color: #409eff;
              cursor: pointer;

              &:hover {
                color: #357ABD;
                text-decoration: underline;
              }
            }
          }
        }

        .createuser-btn {
          width: 100%;
          height: 44px;
          font-size: 16px;
          font-weight: 500;
          border-radius: 6px;
          background: linear-gradient(90deg, #4A90E2 0%, #357ABD 100%);
          border: none;
          margin-bottom: 20px;

          &:hover:not(:disabled) {
            background: linear-gradient(90deg, #357ABD 0%, #2E6DA4 100%);
          }

          &:disabled {
            background: #f5f5f5;
            border-color: #e4e7ed;
            color: #c0c4cc;
            cursor: not-allowed;
          }
        }

        .form-footer {
          text-align: center;
          font-size: 14px;

          .login-link {
            color: #409eff;
            cursor: pointer;

            &:hover {
              color: #357ABD;
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .createuser-container {
    flex-direction: column;

    .left-section {
      height: 25vh;

      .decoration-icon .mountain-icon {
        transform: scale(0.7);
      }
    }

    .right-section {
      height: 75vh;
      padding: 15px;
    }
  }
}
</style>
