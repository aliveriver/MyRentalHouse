# 房源管理接口集成说明

## 概述
本文档说明了在房源列表页面(`src/views/house/list/index.vue`)中集成的房源管理接口功能。

## 实现的功能

### 1. 房源列表管理
- ✅ **获取房源列表**: `GET /properties` - 支持分页查询
- ✅ **搜索房源**: `GET /properties/search` - 支持多条件搜索
- ✅ **创建房源**: `POST /properties` - 新增房源
- ✅ **更新房源**: `PUT /properties/{propertyid}` - 编辑房源信息
- ✅ **删除房源**: `DELETE /properties/{propertyid}` - 单个删除
- ✅ **批量删除**: `DELETE /properties/batch-delete` - 批量删除房源
- ✅ **查询单个房源**: `GET /properties/{propertyid}` - 获取房源详情

### 2. 搜索功能
支持以下搜索条件：
- **房源名称**: 关键词搜索
- **价格范围**: 预设价格区间筛选
- **房源状态**: 在售/已售/待审核/下架
- **发布时间**: 按发布日期筛选

### 3. 用户界面功能
- **分页显示**: 支持分页浏览房源列表
- **快速筛选**: 状态按钮快速筛选
- **批量操作**: 支持批量选择和删除
- **详情查看**: 点击房源名称查看详细信息
- **响应式设计**: 适配不同屏幕尺寸

## API集成详情

### API文件
- **位置**: `src/api/properties.js`
- **导出**: 通过 `src/api/index.js` 统一导出

### 主要接口方法

```javascript
import { propertiesApi } from '@/api/index'

// 获取房源列表
await propertiesApi.getAllProperties({
  page: 1,
  size: 10
})

// 搜索房源
await propertiesApi.searchProperties({
  keyword: '阳光花园',
  status: '在售',
  minPrice: 500000,
  maxPrice: 1000000
})

// 创建房源
await propertiesApi.createProperty({
  title: '房源标题',
  description: '房源描述',
  price: 500000,
  area: 120,
  layout: '3室2厅',
  address: '房源地址',
  status: '在售',
  sellerid: 1001
})
```

## 数据映射

### API数据格式到组件数据格式的映射

```javascript
// API返回的数据格式 (Properties实体)
{
  propertyid: 101,
  title: "阳光花园3居室",
  description: "精装修，南北通透...",
  price: 500000.00,
  area: 120.50,
  layout: "3室2厅1卫",
  address: "XX区XX路100号",
  publishdate: "2023-10-01",
  status: "在售",
  sellerid: 1001,
  tagIds: [1, 3]
}

// 映射到组件使用的格式
{
  id: item.propertyid,
  title: item.title,
  currentPrice: item.price,
  area: item.area,
  layout: item.layout,
  location: item.address,
  addTime: item.publishdate,
  status: item.status,
  description: item.description,
  sellerid: item.sellerid,
  tagIds: item.tagIds || []
}
```

## 错误处理

### 网络错误处理
- 当API调用失败时，会显示用户友好的错误信息
- 网络连接失败时，会显示模拟数据以便开发和测试

### 用户反馈
- 加载状态: 使用 `v-loading` 指令显示加载状态
- 成功反馈: 操作成功时显示成功消息
- 错误反馈: 操作失败时显示具体错误信息

## 使用说明

### 1. 查看房源列表
- 页面加载时自动获取房源数据
- 支持分页浏览
- 可以通过快速筛选按钮按状态筛选

### 2. 搜索房源
- 在搜索区域输入搜索条件
- 支持名称、价格范围、状态、发布时间等多条件搜索
- 点击"查询"按钮执行搜索
- 点击"重置"按钮清空搜索条件

### 3. 添加房源
- 点击"添加房源"按钮
- 填写房源信息（名称、描述、价格、面积、户型、地址、状态）
- 点击"确定"提交创建

### 4. 编辑房源
- 点击房源行的"编辑"按钮
- 修改房源信息
- 点击"确定"保存修改

### 5. 删除房源
- 单个删除：点击操作列的删除按钮
- 批量删除：选中多行，点击"批量删除"按钮

## 开发注意事项

### 1. 后端接口依赖
- 确保后端服务正常运行
- 检查接口路径和参数格式是否正确
- 验证返回数据格式是否符合预期

### 2. 用户权限
- 创建和编辑房源需要获取当前用户ID
- 删除操作可能需要权限验证（后端实现）

### 3. 数据验证
- 前端表单验证确保数据完整性
- 价格和面积必须为正数
- 必填字段不能为空

### 4. 性能优化
- 大数据量时考虑虚拟滚动
- 搜索防抖处理避免频繁请求
- 图片懒加载优化页面性能

## 待优化功能

1. **图片上传**: 集成房源图片上传功能
2. **标签管理**: 实现房源标签的添加和管理
3. **地图集成**: 添加地图定位功能
4. **高级搜索**: 更多搜索条件和筛选选项
5. **数据导出**: 支持房源数据导出功能
6. **历史记录**: 记录房源修改历史
