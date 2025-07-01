# 修改密码复用 Profile 接口完成

## 修改总结

已成功将修改密码功能整合到统一的 profile 接口中：

### 前端修改
1. **简化密码修改逻辑**：
   - 移除了密码验证步骤
   - 直接使用 `profileApi.updateProfile()` 进行密码修改
   - 通过传递 `currentPassword` 和 `newPassword` 字段实现

2. **统一接口调用**：
   ```javascript
   // 个人信息更新
   const updateData = {
     username: displayForm.name,
     email: displayForm.email,
     phonenumber: displayForm.phone,
     department: displayForm.department,
     bio: displayForm.bio
   }
   await profileApi.updateProfile(updateData)

   // 密码修改
   const passwordData = {
     currentPassword: passwordForm.currentPassword,
     newPassword: passwordForm.newPassword
   }
   await profileApi.updateProfile(passwordData)
   ```

### 后端接口要求

后端的 `PUT /users/profile` 接口需要能够处理两种情况：

1. **基本信息更新**：当请求中包含 `username`, `email`, `phonenumber` 等字段时
2. **密码修改**：当请求中包含 `currentPassword` 和 `newPassword` 字段时

后端应该根据请求数据的字段来判断执行哪种操作。

### API 简化结果

现在只需要两个主要的 profile 接口：
- `GET /users/profile` - 获取用户信息
- `PUT /users/profile` - 更新用户信息（包括基本信息和密码）

### 优势

1. **接口统一**：所有更新操作都通过同一个接口
2. **代码简化**：前端逻辑更加简洁
3. **维护便利**：减少接口数量，降低维护成本
4. **用户体验**：统一的错误处理和响应

## 测试建议

1. 测试基本信息更新
2. 测试密码修改功能
3. 测试错误场景（如当前密码错误）
4. 确保两种操作不会互相干扰
