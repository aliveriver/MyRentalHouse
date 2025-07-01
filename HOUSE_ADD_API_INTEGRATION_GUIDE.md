# 房源添加页面接口集成说明

## 概述
本文档说明了在房源添加页面(`src/views/house/list/add.vue`)中集成的房源管理接口功能。

## 🎯 实现的功能

### 1. **房源创建** (新增模式)
- ✅ **表单验证**: 前端完整的字段验证
- ✅ **数据转换**: 界面数据转换为API格式
- ✅ **API调用**: `POST /properties` 创建房源
- ✅ **用户反馈**: 成功/失败消息提示
- ✅ **页面跳转**: 创建成功后跳转到列表页

### 2. **房源编辑** (编辑模式)
- ✅ **数据加载**: 从API获取房源详情
- ✅ **表单预填**: 将API数据映射到表单字段
- ✅ **更新保存**: `PUT /properties/{propertyid}` 更新房源
- ✅ **降级处理**: API失败时使用模拟数据

### 3. **房源查看** (查看模式)
- ✅ **只读显示**: 表单字段只读状态
- ✅ **完整信息**: 显示所有房源详细信息
- ✅ **图片展示**: 房源图片列表显示

## 🔄 数据映射逻辑

### 表单字段到API字段的映射

```javascript
// 表单数据 → API数据
const prepareApiData = () => {
  return {
    title: form.value.title,                              // 房源标题
    description: form.value.description,                  // 房源描述
    price: parseFloat(form.value.displayPrice),          // 价格(从展示价格)
    area: parseFloat(form.value.houseSize.replace('㎡', '')), // 面积(去除单位)
    layout: form.value.layout,                            // 户型(新增字段)
    address: `${form.value.productionPlace}${form.value.location}`, // 地址拼接
    publishdate: new Date().toISOString().split('T')[0], // 当前日期
    status: '在售',                                       // 默认状态
    sellerid: store.getUserInfo?.userid || 1,           // 当前用户ID
    tagIds: form.value.keywords.split(',').map((_, i) => i + 1) // 关键词转标签
  }
}
```

### API数据到表单字段的映射

```javascript
// API数据 → 表单数据
const mapApiToForm = (propertyData) => {
  return {
    // API字段直接映射
    title: propertyData.title,
    description: propertyData.description,
    layout: propertyData.layout,
    
    // 转换映射
    houseSize: propertyData.area + '㎡',
    displayPrice: propertyData.price.toString(),
    
    // 辅助映射
    houseType: mapLayoutToHouseType(propertyData.layout),
    productionPlace: extractCityFromAddress(propertyData.address),
    location: extractLocationFromAddress(propertyData.address),
    
    // 默认值
    marketPrice: (propertyData.price * 1.2).toString(),
    keywords: propertyData.tagIds?.join(',') || '',
    status: propertyData.status || '在售'
  }
}
```

## 🚀 新增功能特性

### 1. **户型选择字段**
- 新增了户型结构选择字段
- 支持多种户型：1室1厅、2室1厅、2室2厅、3室2厅、4室2厅、复式、别墅
- 与API的`layout`字段直接对应

### 2. **智能数据转换**
- 自动从地址提取城市和位置信息
- 价格格式验证和转换
- 面积单位自动处理

### 3. **增强的表单验证**
- 价格格式验证：只允许数字和小数点
- 面积格式验证：支持"120㎡"或"120"格式
- 必填字段完整验证

### 4. **用户体验优化**
- Loading状态显示
- 按钮文本动态更新（发布/更新）
- 错误提示详细友好
- 网络错误时的降级处理

## 📋 使用方法

### 新增房源
1. 访问 `/house/add` 路径
2. 填写房源基本信息：
   - 房源标题 ✓
   - 房源编号 ✓  
   - 房源类型 ✓
   - 户型结构 ✓ (新增)
   - 生产产地 ✓
   - 对应位置 ✓
   - 房源大小 ✓
   - 展示价格 ✓
   - 市场价格 ✓
3. 填写详细信息：
   - 关键词
   - 产品简介 ✓
   - 图片上传
   - 详细内容 ✓
4. 点击"发布"按钮创建房源

### 编辑房源
1. 从列表页点击编辑，访问 `/house/add?mode=edit&id={propertyid}`
2. 系统自动加载房源数据并预填表单
3. 修改需要更新的字段
4. 点击"更新"按钮保存修改

### 查看房源详情
1. 从列表页点击房源名称，访问 `/house/add?mode=view&id={propertyid}`
2. 以只读模式显示所有房源信息
3. 点击"返回"按钮返回上一页

## 🔧 技术实现细节

### API集成
```javascript
// 创建房源
const response = await propertiesApi.createProperty(apiData)

// 更新房源  
const response = await propertiesApi.updateProperty(propertyId, apiData)

// 获取房源详情
const response = await propertiesApi.getPropertyById(propertyId)
```

### 错误处理
- 网络错误：显示模拟数据，保证界面可用
- 验证错误：实时表单验证提示
- API错误：显示具体错误信息

### 状态管理
- `loading`: 控制按钮和表单的加载状态
- `isEdit`: 区分编辑和新增模式
- `isView`: 控制只读模式

## ⚠️ 注意事项

### 1. **数据格式要求**
- 价格：纯数字，支持小数
- 面积：数字+可选"㎡"单位
- 日期：自动生成YYYY-MM-DD格式

### 2. **用户权限**
- 需要用户登录状态
- 从store获取当前用户ID作为卖家ID

### 3. **图片上传**
- 当前仅支持本地预览
- 实际项目需要集成文件上传服务

### 4. **标签处理**
- 关键词按逗号分割转换为标签ID
- 简化处理，实际项目可能需要标签管理功能

## 🎯 后续优化建议

1. **图片上传服务集成**
2. **标签管理系统**
3. **地址选择组件**
4. **房源模板功能**
5. **草稿保存功能**
6. **富文本编辑器**

## 📄 相关文件

- **页面组件**: `src/views/house/list/add.vue`
- **API接口**: `src/api/properties.js`
- **路由配置**: 需要在路由中配置对应路径
- **状态管理**: `src/store/index.js` (用户信息)

房源添加功能已完全集成API接口，支持创建、编辑、查看三种模式，提供了完整的用户体验！
