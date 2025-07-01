# 用户更新接口使用说明

## 概述

本文档说明了房屋租赁系统中用户更新相关接口的使用方法，包括个人资料更新、密码修改等功能。

## API 接口列表

### 1. 个人资料更新

#### 更新基本信息
```javascript
import { profileApi } from '@/api'

// 更新个人基本信息
const updateProfile = async () => {
  try {
    const profileData = {
      username: '张三',
      email: 'zhangsan@example.com',
      phonenumber: '13800138000',
      department: 'house',
      bio: '个人简介'
    }
    
    const response = await profileApi.updateProfile(profileData)
    console.log('更新成功:', response)
  } catch (error) {
    console.error('更新失败:', error)
  }
}
```

#### 获取当前用户信息
```javascript
// 获取当前用户信息
const getCurrentUser = async () => {
  try {
    const userInfo = await profileApi.getCurrentUser()
    console.log('用户信息:', userInfo)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}
```

### 2. 密码管理

#### 验证当前密码
```javascript
// 验证当前密码
const verifyPassword = async (password) => {
  try {
    const result = await profileApi.verifyCurrentPassword(password)
    return result
  } catch (error) {
    console.error('密码验证失败:', error)
    return false
  }
}
```

#### 修改密码
```javascript
// 修改密码
const changePassword = async () => {
  try {
    const passwordData = {
      currentPassword: '当前密码',
      newPassword: '新密码'
    }
    
    const response = await profileApi.changePassword(passwordData)
    console.log('密码修改成功:', response)
  } catch (error) {
    console.error('密码修改失败:', error)
  }
}
```

### 3. 用户管理（管理员功能）

#### 获取所有用户
```javascript
import { userManagementApi } from '@/api'

// 获取用户列表
const getUserList = async () => {
  try {
    const params = {
      page: 1,
      size: 10,
      search: '搜索关键词'
    }
    
    const users = await userManagementApi.getAllUsers(params)
    console.log('用户列表:', users)
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}
```

#### 创建用户
```javascript
// 创建新用户
const createUser = async () => {
  try {
    const userData = {
      username: 'newuser',
      password: 'password123',
      email: 'newuser@example.com',
      phonenumber: '13800138000',
      role: '1'
    }
    
    const response = await userManagementApi.createUser(userData)
    console.log('用户创建成功:', response)
  } catch (error) {
    console.error('用户创建失败:', error)
  }
}
```

#### 更新用户信息
```javascript
// 更新用户信息
const updateUser = async (userid) => {
  try {
    const userData = {
      username: '更新后的用户名',
      email: 'updated@example.com',
      phonenumber: '13900139000'
    }
    
    const response = await userManagementApi.updateUser(userid, userData)
    console.log('用户更新成功:', response)
  } catch (error) {
    console.error('用户更新失败:', error)
  }
}
```

#### 删除用户
```javascript
// 删除用户
const deleteUser = async (userid) => {
  try {
    const response = await userManagementApi.deleteUser(userid)
    console.log('用户删除成功:', response)
  } catch (error) {
    console.error('用户删除失败:', error)
  }
}
```

## 在 Vue 组件中的使用示例

### 个人中心页面示例

```vue
<template>
  <div class="profile-page">
    <!-- 个人信息表单 -->
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item label="姓名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      
      <el-form-item label="手机号" prop="phonenumber">
        <el-input v-model="form.phonenumber" />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="saveProfile">保存</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 密码修改表单 -->
    <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
      <el-form-item label="当前密码" prop="currentPassword">
        <el-input v-model="passwordForm.currentPassword" type="password" />
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="passwordForm.newPassword" type="password" />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="passwordForm.confirmPassword" type="password" />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="changePassword">修改密码</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { profileApi } from '@/api'

const formRef = ref()
const passwordFormRef = ref()

// 个人信息表单
const form = reactive({
  username: '',
  email: '',
  phonenumber: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phonenumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

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

// 获取用户信息
const getUserInfo = async () => {
  try {
    const userInfo = await profileApi.getCurrentUser()
    Object.assign(form, userInfo)
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

// 保存个人信息
const saveProfile = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    await profileApi.updateProfile(form)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 重置表单
const resetForm = () => {
  getUserInfo()
}

// 修改密码
const changePassword = async () => {
  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return
    
    await profileApi.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    ElMessage.success('密码修改成功')
    
    // 重置密码表单
    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error) {
    ElMessage.error('密码修改失败')
  }
}

onMounted(() => {
  getUserInfo()
})
</script>
```

## 错误处理

### 常见错误码

- `400`: 请求参数错误
- `401`: 未授权，需要重新登录
- `403`: 权限不足
- `404`: 用户不存在
- `409`: 用户名或邮箱已存在
- `500`: 服务器内部错误

### 错误处理示例

```javascript
try {
  const response = await profileApi.updateProfile(profileData)
  ElMessage.success('更新成功')
} catch (error) {
  if (error.response) {
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        ElMessage.error(data.message || '请求参数错误')
        break
      case 401:
        ElMessage.error('登录已过期，请重新登录')
        // 跳转到登录页
        router.push('/login')
        break
      case 403:
        ElMessage.error('权限不足')
        break
      case 409:
        ElMessage.error('用户名或邮箱已存在')
        break
      default:
        ElMessage.error('操作失败')
    }
  } else {
    ElMessage.error('网络错误')
  }
}
```

## 最佳实践

1. **表单验证**: 始终在前端进行表单验证，提升用户体验
2. **错误处理**: 统一处理各种错误情况，给用户友好的提示
3. **加载状态**: 在API调用时显示加载状态
4. **数据缓存**: 合理使用数据缓存，避免重复请求
5. **权限控制**: 根据用户角色控制功能访问权限

## 注意事项

1. 所有API调用都需要在请求头中携带有效的JWT Token
2. 密码修改操作需要验证当前密码
3. 个人信息更新后需要重新获取用户信息以保持数据同步
4. 敏感操作建议添加确认对话框
5. 上传文件时注意文件大小和格式限制
