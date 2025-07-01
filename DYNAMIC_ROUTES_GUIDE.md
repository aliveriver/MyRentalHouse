# 动态路由使用说明

## 功能概述

系统已经实现了基于用户角色的动态路由功能。登录后，系统会根据用户的角色（`admin` 或 `user`）动态生成对应的菜单路由。

## 实现原理

1. **路由分离**: 将路由分为 `adminRoutes`（管理员路由）和 `userRoutes`（普通用户路由）
2. **动态生成**: 在用户登录成功后，根据用户角色动态生成可访问的路由
3. **权限控制**: 每个路由都配置了 `roles` 字段，用于控制访问权限

## 用户角色配置

### 管理员 (admin)
可以访问所有管理功能：
- 数据概览
- 房源列表
- 房源编辑
- 地图找房
- 分类管理
- 商品管理
- 个人中心

### 普通用户 (user)
只能访问基本功能：
- 房源资讯
- 房源详情
- 个人中心

## 使用方法

### 1. 后端API返回用户信息

登录接口需要返回包含用户角色信息的数据：

```javascript
// 登录成功后的响应数据格式
{
  "success": true,
  "data": {
    "userid": "123",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin", // 关键字段：用户角色
    "phonenumber": "13800138000"
  },
  "message": "登录成功"
}
```

### 2. 前端设置用户信息

在登录成功后调用：

```javascript
// 在登录成功处理中
store.setUserInfo(response.data); // 这会自动触发动态路由生成
```

### 3. 添加新的路由

如需添加新路由，请在对应的路由数组中添加：

```javascript
// 在 src/routers/index.js 中
export const adminRoutes = [
  // ...existing routes
  {
    path: "/new-admin-page",
    component: () => import("../views/new-admin-page/index.vue"),
    meta: { title: "新管理页面", icon: "Document", roles: ['admin'] },
  },
];

export const userRoutes = [
  // ...existing routes
  {
    path: "/new-user-page",
    component: () => import("../views/new-user-page/index.vue"),
    meta: { title: "新用户页面", icon: "User", roles: ['user'] },
  },
];
```

## 注意事项

1. **角色字段**: 确保后端返回的用户信息中包含 `role` 字段
2. **权限检查**: 每个路由的 `meta.roles` 数组必须包含允许访问的角色
3. **退出登录**: 使用 `store.logout()` 方法会自动清除动态路由
4. **路由守卫**: 已启用路由守卫，会自动检查登录状态和权限

## 测试

你可以通过以下方式测试动态路由：

1. 使用不同角色的用户登录
2. 观察左侧菜单是否显示对应的路由选项
3. 尝试直接访问无权限的路由，应该会被重定向

## 扩展功能

如需要更复杂的权限控制，可以：

1. 添加更多用户角色（如 `moderator`、`guest` 等）
2. 实现页面级别的权限控制
3. 添加动态权限更新功能
