# 登录接口使用说明

## API接口

### 1. 登录接口
- **接口地址**: `POST /auth/login`
- **请求参数**:
```json
{
  "username": "newuser",
  "password": "password123"
}
```
- **响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com",
    "createdAt": "2025-06-25T00:00:00.000Z"
  }
}
```

### 2. 注册接口
- **接口地址**: `POST /auth/register`
- **请求参数**:
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com"
}
```

### 3. 退出登录
- **接口地址**: `POST /auth/logout`
- **请求头**: `Authorization: Bearer {token}`

### 4. 获取当前用户信息
- **接口地址**: `GET /auth/me`
- **请求头**: `Authorization: Bearer {token}`

## 前端使用方式

### 在组件中使用登录API
```javascript
import { authApi } from '@/api'

// 登录
const login = async () => {
  try {
    const response = await authApi.login({
      username: 'newuser',
      password: 'password123'
    })
    
    // 保存token
    localStorage.setItem('token', response.token)
    
    // 更新store状态
    store.setIsLogin(true)
    store.setUserInfo(response.user)
    
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  }
}
```

### 记住密码功能
登录时如果勾选"记住密码"，系统会：
1. 设置`rememberMe`标识
2. 设置7天的过期时间
3. 在路由守卫中检查是否过期

## 功能特性

1. **自动token管理**: 请求拦截器自动添加Authorization头
2. **错误处理**: 响应拦截器统一处理各种HTTP错误
3. **路由守卫**: 自动检查登录状态和token有效性
4. **记住密码**: 支持7天免登录功能
5. **状态管理**: 使用Pinia管理登录状态和用户信息

## 目录结构
```
src/
├── api/
│   ├── auth.js          # 认证相关接口
│   ├── users.js         # 用户管理接口
│   ├── request.js       # axios配置和拦截器
│   └── index.js         # API统一导出
├── store/
│   └── index.js         # Pinia状态管理
├── routers/
│   └── index.js         # 路由配置和守卫
└── views/
    └── login/
        └── index.vue    # 登录页面组件
```
