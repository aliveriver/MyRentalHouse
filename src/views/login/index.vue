<template>
  <div class="login-container">
    <div class="login-content">
      <el-card class="card">
        <h3 class="title">后台管理系统</h3>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="auto" class="form">
          <el-form-item label="用户名" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" />
          </el-form-item>
          <el-form-item label="">
            <div style="margin-top: 10px">
              <el-button type="primary" @click="onSubmit">登录</el-button>
              <el-button @click="reset">重置</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router"
import useStore from "../../store/index"

const store = useStore()
const router = useRouter();
const rules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
}

const formRef = ref(null);
const form = ref({
  name: "",
  password: ""
})

const onSubmit = async () => {
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      store.setIsLogin(true)
      router.push("/")
    }
  })
}
const reset = () => {
  formRef.value.resetFields()
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #FFB7B7 0%, #727272 100%), radial-gradient(60.91% 100% at 50% 0%, #FFD1D1 0%, #260000 100%), linear-gradient(238.72deg, #FFDDDD 0%, #720066 100%), linear-gradient(127.43deg, #00FFFF 0%, #FF4444 100%), radial-gradient(100.22% 100% at 70.57% 0%, #FF0000 0%, #00FFE0 100%), linear-gradient(127.43deg, #B7D500 0%, #3300FF 100%);
  background-blend-mode: screen, overlay, hard-light, color-burn, color-dodge, normal;
  position: relative;

  .login-content {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);

    .card {
      width: 800px;

      .title {
        text-align: center;
        padding: 20px 0 40px;
      }

      .form {
        margin: 0 auto;
        width: 60%;
      }
    }
  }
}
</style>