<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card style="font-size: 14px; height: 100%">
          <template #header>
            <div class="card-header">
              <span>头像信息</span>
            </div>
          </template>
          <div class="ava-content">
            <el-avatar :size="50" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
            <div><el-button type="primary">选择头像</el-button></div>
            <div><el-button type="success">上传头像</el-button></div>
            <p class="text">限制上传一个头像，新头像将覆盖旧头像</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card style="font-size: 14px; height: 100%">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
            </div>
          </template>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
            <el-form-item label="输入密码" prop="password">
              <el-input v-model="form.password" autocomplete="off" type="password" />
            </el-form-item>
            <el-form-item label="确认输入密码" prop="repassword">
              <el-input v-model="form.repassword" autocomplete="off" type="password" />
            </el-form-item>
            <el-form-item label=" ">
              <div>
                <el-button type="primary">提交</el-button>
                <el-button @click="reset">重置</el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
const form = ref({
  password: "",
  repassword: "",
})
const formRef = ref(null);

const validatePass2 = (rule, value, callback) => {
  if (value !== form.value.password) {
    callback(new Error("密码不一致"))
  } else {
    callback()
  }
}
const rules = reactive({
  password: { message: '请输入密码', trigger: 'blur' },
  repassword: { validator: validatePass2, trigger: 'blur' },
})

const reset = () => {
  formRef.value.resetFields();
}
</script>

<style lang="scss" scoped>
.ava-content {
  text-align: center;

  >div {
    margin: 10px 0;
  }

  .text {
    font-family: 10px;
    color: #666;
  }
}
</style>