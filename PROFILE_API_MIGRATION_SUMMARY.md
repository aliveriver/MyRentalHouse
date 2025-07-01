# 用户更新接口统一使用 /profile 路径完成

## 已完成的修改

### 1. 前端修改 (src/views/person/index.vue)

**移除的导入：**
```javascript
// 移除
import usersApi from '@/api/users'

// 保留
import profileApi from '@/api/profile'
```

**简化的获取用户信息函数：**
```javascript
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
```

**简化的保存个人资料函数：**
```javascript
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
```

**简化的修改密码函数（使用统一 profile 接口）：**
```javascript
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
```

### 2. Profile API 接口 (src/api/profile.js)

现在 profile API 更加简化，主要接口：

- `GET /users/profile` - 获取当前用户信息
- `PUT /users/profile` - 更新个人信息（包括基本信息和密码修改）
- `POST /users/upload-avatar` - 上传头像
- `GET /users/login-logs` - 获取登录日志

**重要改进：**
- 密码修改现在通过统一的 `updateProfile` 接口处理
- 移除了单独的 `verifyCurrentPassword` 和 `changePassword` 方法
- 通过传递 `currentPassword` 和 `newPassword` 字段来区分是否为密码修改请求

## 最新改进

### 统一使用的接口：
- `profileApi.getCurrentUser()` - 获取当前用户信息
- `profileApi.updateProfile()` - 更新个人基本信息和密码修改（统一接口）

**重要更新：**
- 密码修改现在也通过 `updateProfile` 接口处理
- 前端通过传递 `currentPassword` 和 `newPassword` 字段来实现密码修改
- 后端根据请求中是否包含密码字段来区分基本信息更新还是密码修改
- 进一步简化了前端代码逻辑

## 优势

1. **代码简化**：移除了复杂的回退逻辑，代码更简洁易读
2. **接口统一**：所有个人资料相关操作都通过 `/profile` 路径进行
3. **维护性提升**：单一接口路径，便于维护和调试
4. **用户体验**：统一的错误处理和响应格式

## 注意事项

- 登录和注册功能仍使用 `usersApi`，这是正确的，因为这些不属于个人资料管理范畴
- 后端需要实现相应的 profile 接口才能正常工作
- 所有个人资料相关操作现在完全依赖 `profileApi`

## 测试建议

1. 测试获取用户信息功能
2. 测试更新个人资料功能
3. 测试密码验证功能
4. 测试密码修改功能
5. 确保错误处理正常工作
