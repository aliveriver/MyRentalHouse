<template>
  <div class="login-container">
    <!-- 左侧装饰区域 -->
    <div class="left-section">
      <div class="decoration-icon">
        <div class="mountain-icon">
          <div class="circle"></div>
          <div class="mountain"></div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="right-section">
      <div class="login-form">
        <h2 class="welcome-title">欢迎使用</h2>

        <el-form ref="formRef" :model="form" :rules="rules" class="form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入您的账号"
              prefix-icon="User"
              size="large"
              class="input-field"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入您的密码"
              prefix-icon="Lock"
              size="large"
              class="input-field"
              show-password
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberMe" class="remember-checkbox">
              记住密码（7天内免登录）
            </el-checkbox>
          </div>

          <el-button
            type="primary"
            size="large"
            class="login-btn"
            @click="onSubmit"
            :loading="loading"
          >
            登录
          </el-button>

          <div class="form-footer">
            <span class="forgot-password">忘记密码</span>
            <span class="register-link">注册账号</span>
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
import { User, Lock } from '@element-plus/icons-vue'
import useStore from "../../store/index"

const store = useStore()
const router = useRouter()
const loading = ref(false)
const rememberMe = ref(false)

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
}

const formRef = ref(null)
const form = ref({
  username: "",
  password: ""
})

const onSubmit = async () => {
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      // 模拟登录延迟
      setTimeout(() => {
        store.setIsLogin(true)
        ElMessage.success('登录成功')
        router.push("/")
        loading.value = false
      }, 1000)
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
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
    padding: 40px;

    .login-form {
      width: 100%;
      max-width: 400px;

      .welcome-title {
        font-size: 24px;
        font-weight: 500;
        color: #333;
        margin-bottom: 40px;
        text-align: left;
      }

      .form {
        .input-field {
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
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;

          .remember-checkbox {
            :deep(.el-checkbox__label) {
              color: #666;
              font-size: 14px;
            }
          }
        }

        .login-btn {
          width: 100%;
          height: 44px;
          font-size: 16px;
          font-weight: 500;
          border-radius: 6px;
          background: linear-gradient(90deg, #4A90E2 0%, #357ABD 100%);
          border: none;
          margin-bottom: 30px;

          &:hover {
            background: linear-gradient(90deg, #357ABD 0%, #2E6DA4 100%);
          }
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          font-size: 14px;

          .forgot-password {
            color: #999;
            cursor: pointer;

            &:hover {
              color: #409eff;
            }
          }

          .register-link {
            color: #409eff;
            cursor: pointer;

            &:hover {
              color: #357ABD;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;

    .left-section {
      height: 30vh;

      .decoration-icon .mountain-icon {
        transform: scale(0.7);
      }
    }

    .right-section {
      height: 70vh;
      padding: 20px;
    }
  }
}
</style>
