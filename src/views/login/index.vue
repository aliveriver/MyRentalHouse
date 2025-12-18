<template>
  <div class="login-container">
    <!-- 左侧装饰区域 -->
    <div class="left-section">
      <!-- 背景图已通过 CSS 设置 -->
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="right-section">
      <div class="login-form">
        <h2 class="welcome-title">欢迎使用</h2>

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
            <span class="register-link" @click="goToRegister">注册账号</span>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import useStore from "../../store/index"
import { usersApi } from "../../api/index"
import { setToken, getUserInfoFromToken, validateToken } from '@/utils/jwt'

const store = useStore()
const router = useRouter()
const loading = ref(false)
const rememberMe = ref(false)

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ],
}

const formRef = ref(null)
const form = ref({
  username: "",
  password: ""
})

const onSubmit = async () => {
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        loading.value = true
        // 调用登录API，使用后端字段命名：username, password
        const response = await usersApi.login({
          username: form.value.username,
          password: form.value.password
        });

        console.log('Login response:', response);

        // 登录成功，保存token和用户信息
        if (response && response.success) {
          // 提取 JWT token
          let token = null;
          if (response.data && response.data.token) {
            token = response.data.token;
          } else if (response.token) {
            token = response.token;
          }

          if (!token) {
            ElMessage.error('登录失败，未获取到token');
            return;
          }

          // 先清除旧的路由和用户信息（防止切换账号时路由冲突）
          // 注意：先清除旧数据，再保存新 token
          store.isLogin = false;
          store.userInfo = null;
          store.routes = [];
          // 清除旧的动态路由
          const { addDynamicRoutes } = await import('@/routers/index');
          addDynamicRoutes([]);
          // 清除旧的 localStorage 用户信息
          try {
            localStorage.removeItem('userInfo');
          } catch (e) {
            console.warn('清除旧 userInfo 失败:', e);
          }

          // 保存JWT token到localStorage（使用JWT工具）
          setToken(token, rememberMe.value);

          // 从token中提取用户信息
          const userInfoFromToken = getUserInfoFromToken(token);

          if (!userInfoFromToken) {
            ElMessage.error('登录失败，无法解析用户信息');
            return;
          }

          console.log('User info from token:', userInfoFromToken);
          console.log('Response data:', response.data);

          // 合并响应中的用户信息（优先使用响应中的用户信息，特别是role字段）
          const responseUser = response.data?.user || response.data;
          const userInfo = {
            ...userInfoFromToken,
            ...responseUser,
            // 确保role字段存在（优先使用响应中的role）
            role: responseUser?.role || userInfoFromToken?.role,
          };

          console.log('Final user info:', userInfo);

          // 保存用户信息到 localStorage（作为备份，以防 token 中没有 role）
          try {
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
          } catch (e) {
            console.warn('保存用户信息到 localStorage 失败:', e);
          }

          // 保存用户信息到store（这会触发动态路由生成）
          store.setIsLogin(true)
          store.setUserInfo(userInfo)

          ElMessage.success('登录成功')

          // 等待路由生成完成后再跳转
          await new Promise(resolve => setTimeout(resolve, 300));

          // 根据用户角色动态跳转到对应的默认页面
          const { getDefaultRouteByRole } = await import('@/utils/userRole');
          const defaultRoute = getDefaultRouteByRole(userInfo.role);
          console.log(`登录成功，角色: ${userInfo.role}，准备跳转到 ${defaultRoute}`);

          try {
            await router.push(defaultRoute);
          } catch (err) {
            console.error('路由跳转失败:', err);
            // 如果跳转失败，使用replace
            try {
              await router.replace(defaultRoute);
            } catch (replaceErr) {
              console.error('路由replace也失败:', replaceErr);
              // 最后尝试直接跳转到根路径，让路由守卫处理
              window.location.href = '/';
            }
          }
        } else {
          ElMessage.error(response?.message || '登录失败，请检查用户名和密码')
        }

      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error(error.response?.data?.message || error.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 检查是否已经登录（路由守卫会处理重定向，这里只恢复状态）
const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  if (token && validateToken(token)) {
    // 如果已经有有效的token，从token中恢复用户信息
    const userInfo = getUserInfoFromToken(token)
    if (userInfo) {
      store.setIsLogin(true)
      store.setUserInfo(userInfo)
      // 路由守卫会自动处理重定向，这里不需要手动跳转
    }
  }
}

// 组件挂载时检查登录状态
onMounted(() => {
  checkLoginStatus()
})
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;

  .left-section {
    flex: 3;
    background-image: url('@/assets/login-bg.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
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
    }

    .right-section {
      height: 70vh;
      padding: 20px;
    }
  }
}
</style>
