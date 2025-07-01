# Profile 接口建议

根据前端代码的需求，后端需要在 `UsersController` 中添加以下接口：

## 1. 获取当前用户信息 (GET /users/profile)

```java
@GetMapping("/profile")
public Result getCurrentUserProfile(HttpSession session) {
    Users currentUser = (Users) session.getAttribute("user");
    if (currentUser == null) {
        return Result.fail("用户未登录");
    }
    
    Users userInfo = usersService.getById(currentUser.getUserid());
    if (userInfo != null) {
        return Result.ok(userInfo);
    } else {
        return Result.fail("用户信息不存在");
    }
}
```

## 2. 更新个人基本信息（包括密码修改）(PUT /users/profile)

```java
@PutMapping("/profile")
public Result updateUserProfile(@RequestBody Users profileData, HttpSession session) {
    Users currentUser = (Users) session.getAttribute("user");
    if (currentUser == null) {
        return Result.fail("用户未登录");
    }
    
    // 设置要更新的用户ID
    profileData.setUserid(currentUser.getUserid());
    
    // 检查是否为密码修改请求
    if (profileData.getCurrentPassword() != null && profileData.getNewPassword() != null) {
        // 处理密码修改
        Users userInfo = usersService.getById(currentUser.getUserid());
        
        // 验证当前密码
        if (userInfo == null || !userInfo.getPassword().equals(profileData.getCurrentPassword())) {
            return Result.fail("当前密码不正确");
        }
        
        // 更新密码
        userInfo.setPassword(profileData.getNewPassword());
        boolean success = usersService.updateById(userInfo);
        
        if (success) {
            // 更新session中的用户信息
            session.setAttribute("user", userInfo);
            return Result.ok("密码修改成功");
        } else {
            return Result.fail("密码修改失败");
        }
    } else {
        // 处理基本信息更新
        boolean success = usersService.updateById(profileData);
        if (success) {
            // 更新session中的用户信息
            Users updatedUser = usersService.getById(currentUser.getUserid());
            session.setAttribute("user", updatedUser);
            return Result.ok("个人信息更新成功");
        } else {
            return Result.fail("更新失败");
        }
    }
}
```

注意：需要在 Users 实体类中添加 currentPassword 和 newPassword 字段（用于接收前端数据，不存储到数据库）：

```java
public class Users {
    // ...existing fields...
    
    // 用于密码修改的临时字段，不映射到数据库
    @TableField(exist = false)
    private String currentPassword;
    
    @TableField(exist = false)
    private String newPassword;
    
    // getters and setters
    public String getCurrentPassword() {
        return currentPassword;
    }
    
    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
```

## 3. 获取登录日志 (GET /users/login-logs)

```java
@GetMapping("/login-logs")
public Result getLoginLogs(HttpSession session) {
    Users currentUser = (Users) session.getAttribute("user");
    if (currentUser == null) {
        return Result.fail("用户未登录");
    }
    
    // 这里可以返回模拟的登录日志数据，或者从数据库中查询真实数据
    List<Map<String, Object>> logs = new ArrayList<>();
    // ... 构造登录日志数据
    
    return Result.ok(logs);
}
```

## 完整的 UsersController 更新版本

将上述方法添加到现有的 `UsersController` 类中。现在只需要两个主要的 profile 接口：

1. `GET /users/profile` - 获取当前用户信息
2. `PUT /users/profile` - 更新个人信息（包括基本信息和密码修改）

通过统一的 profile 接口，可以简化前端调用逻辑，同时保持接口的一致性。
