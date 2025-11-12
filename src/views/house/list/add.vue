<template>
  <div class="house-add">
    <div class="header">
      <h2>{{ isEdit ? '编辑房源' : isView ? '房源详情' : '新增房源' }}</h2>
    </div>
    <div class="form-content">
      <el-form
        :model="form"
        :rules="isView ? {} : rules"
        ref="formRef"
        label-width="100px"
        :disabled="isView"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房源标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="输入标题"
                :readonly="isFormFieldDisabled"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="户型" prop="layout">
              <el-select
                v-model="form.layout"
                placeholder="请选择户型"
                style="width: 100%"
                :disabled="isFormFieldDisabled"
              >
                <el-option
                  :label="item.value"
                  :value="item.value"
                  v-for="item in tags.houseTags"
                  :key="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房屋朝向" prop="orientation">
              <el-select
                v-model="form.orientation"
                placeholder="请选择房屋朝向"
                style="width: 100%"
                :disabled="isFormFieldDisabled"
              >
                <el-option
                  :label="item.value"
                  :value="item.value"
                  v-for="item in tags.orientationTags"
                  :key="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所在楼层" prop="floor">
              <el-select
                v-model="form.floor"
                placeholder="请选择所在楼层"
                style="width: 100%"
                :disabled="isFormFieldDisabled"
              >
                <el-option
                  :label="item.value"
                  :value="item.value"
                  v-for="item in tags.floorTags"
                  :key="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="装修情况" prop="decoration">
              <el-select
                v-model="form.decoration"
                placeholder="请选择装修情况"
                style="width: 100%"
                :disabled="isFormFieldDisabled"
              >
                <el-option
                  :label="item.value"
                  :value="item.value"
                  v-for="item in tags.afitmentTags"
                  :key="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="建筑类型" prop="buildingType">
              <el-select
                v-model="form.buildingType"
                placeholder="请选择建筑类型"
                style="width: 100%"
                :disabled="isFormFieldDisabled"
              >
                <el-option
                  :label="item.value"
                  :value="item.value"
                  v-for="item in tags.typeTags"
                  :key="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="建筑年代" prop="buildYear">
              <el-select
                v-model="form.buildYear"
                placeholder="请选择建筑年代"
                style="width: 100%"
                :disabled="isFormFieldDisabled"
              >
                <el-option
                  :label="item.value"
                  :value="item.value"
                  v-for="item in tags.buildYearTags"
                  :key="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="梯户比例" prop="elevatorRatio">
              <el-select
                v-model="form.elevatorRatio"
                placeholder="请选择梯户比例"
                style="width: 100%"
                :disabled="isFormFieldDisabled"
              >
                <el-option
                  :label="item.value"
                  :value="item.value"
                  v-for="item in tags.elevatorRatioTags"
                  :key="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="房源地址" prop="address">
              <el-input
                v-model="form.address"
                placeholder="请输入房源地址"
                :readonly="isFormFieldDisabled"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="form.status"
                placeholder="请选择状态"
                style="width: 100%"
                :disabled="isView || (isSeller && form.status === '待审核')"
              >
                <el-option
                  :label="item.value"
                  :value="item.value"
                  v-for="item in availableStatusTags"
                  :key="item.id"
                />
              </el-select>
              <el-alert
                v-if="isSeller && form.status === '待审核'"
                type="warning"
                :closable="false"
                style="margin-top: 8px"
              >
                待审核状态的房源不能修改，只能下架
              </el-alert>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签" prop="tagIds">
              <el-select
                v-model="form.tagIds"
                placeholder="请选择标签"
                style="width: 100%"
                :disabled="isFormFieldDisabled"
                multiple
              >
                <el-option
                  :label="item.value"
                  :value="item.id"
                  v-for="item in tags.all"
                  :key="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房源大小" prop="area">
              <el-input
                v-model="form.area"
                placeholder="房源大小(m²)"
                :readonly="isFormFieldDisabled"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房源价格" prop="price">
              <el-input
                v-model="form.price"
                placeholder="请输入房源价格(元)"
                :readonly="isFormFieldDisabled"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="房源描述" prop="description">
              <el-input
                type="textarea"
                v-model="form.description"
                placeholder="最少输入10个字符"
                :rows="4"
                :readonly="isFormFieldDisabled"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              :label="isView ? '房源图片' : '图片上传'"
              prop="images"
            >
              <div class="upload-section">
                <div class="uploaded-images" v-if="form.images.length > 0">
                  <div
                    v-for="(image, index) in form.images"
                    :key="image.id || index"
                    class="image-item"
                    :class="{ 'view-mode': isView }"
                  >
                    <el-image
                      v-if="isView"
                      :src="image.url"
                      :alt="image.name"
                      :preview-src-list="form.images.map(img => img.url)"
                      :initial-index="index"
                      fit="cover"
                      class="view-image"
                      preview-teleported
                    />
                    <img
                      v-else
                      :src="image.url"
                      :alt="image.name"
                    />
                    <div class="image-actions" v-if="!isView && !isFormFieldDisabled">
                      <el-button
                        type="danger"
                        size="small"
                        circle
                        @click="removeImage(index)"
                        :disabled="image.uploading"
                      >
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                    <div v-if="image.uploading" class="uploading-overlay">
                      <el-icon class="is-loading"><Loading /></el-icon>
                    </div>
                  </div>
                </div>
                <div v-if="isView && form.images.length === 0" class="no-images-tip">
                  <el-empty description="暂无图片" :image-size="80" />
                </div>
                <div class="upload-trigger" v-if="!isView && !isFormFieldDisabled">
                  <el-upload
                    :show-file-list="false"
                    :before-upload="beforeUpload"
                    accept="image/*"
                  >
                    <div class="upload-area">
                      <el-icon size="24"><Plus /></el-icon>
                      <div>上传照片</div>
                    </div>
                  </el-upload>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="footer">
      <div class="header-actions" v-if="!isView">
        <el-button @click="handleCancel" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="handlePublish" :loading="loading">
          {{ isEdit ? '更新' : '发布' }}
        </el-button>
      </div>
      <div class="header-actions" v-else>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Close, Loading } from '@element-plus/icons-vue'
import { propertiesApi, filesApi } from '@/api/index'
import useStore from '@/store/index'
import * as tags from "@/constant/tags"

const router = useRouter()
const route = useRoute()
const store = useStore()

// 页面状态
const isEdit = ref(false)
const isView = ref(false)
const loading = ref(false)

// 检查用户角色
const isAdmin = computed(() => {
  const role = store.getUserRole
  return role === '管理员'
})

const isSeller = computed(() => {
  const role = store.getUserRole
  return role === '卖家'
})

// 根据用户角色过滤可用的状态选项
const availableStatusTags = computed(() => {
  if (isAdmin.value) {
    // 管理员可以看到所有状态
    return tags.statusTags
  } else if (isSeller.value) {
    // 卖家只能选择"下架"（不能选择其他状态）
    return tags.statusTags.filter(item => item.value === '下架')
  } else {
    // 其他角色（买家等）不应该编辑房源，但为了安全起见，只显示在售
    return tags.statusTags.filter(item => item.value === '在售')
  }
})

// 判断是否应该禁用表单字段（待审核状态的房源，卖家不能编辑除状态外的其他字段）
const isFormFieldDisabled = computed(() => {
  return isView.value || (isSeller.value && isEdit.value && form.value.status === '待审核')
})

// 表单引用
const formRef = ref(null)

// 表单数据 - 按照API文档格式调整
const form = ref({
  // 基础信息
  title: '',                    // 房源标题
  description: '',              // 房源描述（对应原来的产品简介）
  price: 0,                     // 价格（使用displayPrice）
  area: 0,                      // 面积（从houseSize转换）
  layout: '',                   // 户型（从houseType转换）
  orientation: '',              // 房屋朝向
  floor: '',                    // 所在楼层
  decoration: '',               // 装修情况
  buildingType: '',             // 建筑类型
  buildYear: '',                // 建筑年代
  elevatorRatio: '',            // 梯户比例
  address: '',                  // 房源地址（对应原来的location）
  status: '待审核',             // 状态，新建房源默认待审核
  tagIds: [],
  images: [],                  // 图片
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入房源标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请输入面积', trigger: 'blur' }
  ],
  layout: [
    { required: true, message: '请选着户型', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'blur' }
  ]
}

// 初始化页面
onMounted(() => {
  const { mode, id } = route.query

  if (mode === 'edit') {
    isEdit.value = true
    loadHouseData(id)
  } else if (mode === 'view') {
    isView.value = true
    loadHouseData(id)
  } else {
    // 新增模式，初始化空表单
    initEmptyForm()
  }
})

// 初始化空表单
const initEmptyForm = () => {
  form.value = {
    // API字段
    title: '',
    description: '',
    price: 0,
    area: 0,
    layout: '',
    orientation: '',
    floor: '',
    decoration: '',
    buildingType: '',
    buildYear: '',
    elevatorRatio: '',
    address: '',
    status: '待审核', // 新建房源默认状态为"待审核"
    images: [],
    tagIds: [],
  }
}

// 加载房源数据
const loadHouseData = async (id) => {
  try {
    loading.value = true
    const response = await propertiesApi.getPropertyById(id)

    if (response && response.success) {
      const propertyData = response.data

      // 检查卖家是否尝试编辑待审核状态的房源
      if (isEdit.value && isSeller.value && propertyData.status === '待审核') {
        ElMessage.warning('待审核状态的房源不能编辑')
        // 跳转回列表页
        router.push('/house/list')
        return
      }

      // 将API数据映射到表单
      // 处理图片列表
      let images = []
      if (propertyData.photoList && propertyData.photoList.length > 0) {
        images = propertyData.photoList.map((uri, index) => ({
          id: 'loaded_' + index + '_' + Date.now(), // 为已加载的图片添加id
          url: filesApi.getFileUrl(uri),
          name: '房源图片',
          uri: uri,
          uploading: false // 已加载的图片不需要显示加载状态
        }))
      }

      form.value = {
        // API字段
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        area: propertyData.area,
        layout: propertyData.layout,
        orientation: propertyData.orientation || '',
        floor: propertyData.floor || '',
        decoration: propertyData.decoration || '',
        buildingType: propertyData.buildingType || '',
        buildYear: propertyData.buildYear || '',
        elevatorRatio: propertyData.elevatorRatio || '',
        address: propertyData.address,
        status: propertyData.status,
        // 界面字段（模拟数据或从API字段转换）
        houseNumber: id,
        tagIds: propertyData.tagIds || [],
        images: images,
      }
    } else {
      ElMessage.error('获取房源信息失败')
    }
  } catch (error) {
    console.error('加载房源数据失败:', error)
    ElMessage.error('加载房源数据失败')
  } finally {
    loading.value = false
  }
}

// 图片上传前的处理
const beforeUpload = async (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }

  // 创建唯一标识符
  const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9)

  // 创建预览URL
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      // 先显示预览
      const previewUrl = e.target.result
      const imageItem = {
        id: fileId, // 唯一标识符
        url: previewUrl,
        name: file.name,
        file: file,
        uri: null, // 上传后会有URI
        uploading: true
      }
      form.value.images.push(imageItem)

      // 上传文件获取URI
      const uploadResponse = await filesApi.uploadFile(file)
      if (uploadResponse && uploadResponse.success) {
        // 通过id查找并更新数组项，确保Vue能够检测到变化
        const index = form.value.images.findIndex(img => img.id === fileId)
        if (index > -1) {
          // 使用对象展开运算符创建新对象，触发响应式更新
          form.value.images[index] = {
            ...form.value.images[index],
            uri: uploadResponse.data.uri,
            uploading: false,
            url: filesApi.getFileUrl(uploadResponse.data.uri)
          }
        }
      } else {
        // 上传失败，移除该项
        const index = form.value.images.findIndex(img => img.id === fileId)
        if (index > -1) {
          form.value.images.splice(index, 1)
        }
        ElMessage.error(uploadResponse?.errorMsg || '图片上传失败')
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      ElMessage.error('图片上传失败，请重试')
      // 移除预览项
      const index = form.value.images.findIndex(img => img.id === fileId)
      if (index > -1) {
        form.value.images.splice(index, 1)
      }
    }
  }
  reader.readAsDataURL(file)

  return false // 阻止自动上传
}

// 删除图片
const removeImage = (index) => {
  form.value.images.splice(index, 1)
}

// 发布房源
const handlePublish = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true

        // 准备API数据
        const apiData = prepareApiData()

        let response
        if (isEdit.value) {
          // 编辑模式
          const propertyId = route.query.id
          response = await propertiesApi.updateProperty(propertyId, apiData)
        } else {
          // 新增模式
          response = await propertiesApi.createProperty(apiData)
        }

        if (response && response.success) {
          ElMessage.success(isEdit.value ? '更新成功' : '发布成功')
          router.push('/house/list')
        } else {
          ElMessage.error(response?.errorMsg || '操作失败')
        }
      } catch (error) {
        console.error('发布失败:', error)
        ElMessage.error('发布失败：' + (error.message || '网络错误'))
      } finally {
        loading.value = false
      }
    }
  })
}

const prepareApiData = () => {
  // 处理价格：移除可能的单位符号，确保是有效数字
  let priceValue = form.value.price
  if (typeof priceValue === 'string') {
    priceValue = priceValue.replace(/[^\d.]/g, '') // 只保留数字和小数点
  }
  const price = parseFloat(priceValue) || 0
  
  // 处理面积：移除可能的单位符号（如㎡），确保是有效数字
  let areaValue = form.value.area
  if (typeof areaValue === 'string') {
    areaValue = areaValue.replace(/[^\d.]/g, '') // 只保留数字和小数点
  }
  let area = parseFloat(areaValue) || 0
  
  // 验证面积值是否有效（不能是 NaN 或 Infinity，且应该在合理范围内）
  if (isNaN(area) || !isFinite(area) || area < 0) {
    area = 0
  }
  // 限制面积最大值（数据库 Area 字段为 DECIMAL(5,2)，最大值为 999.99 平方米）
  if (area > 999.99) {
    area = 999.99
    ElMessage.warning('面积值超过最大限制，已自动调整为 999.99 平方米')
  }
  
  const layout = form.value.layout || '住宅'
  const address = form.value.address
  const description = form.value.description

  // 处理标签ID列表，确保不为 null
  const tagIds = form.value.tagIds || []
  
  // 提取图片URI列表（只包含已上传成功的图片）
  const photoList = form.value.images
    .filter(img => img.uri) // 只包含已上传成功的图片
    .map(img => img.uri)

  const apiData = {
    title: form.value.title,
    description: description,
    price: price,
    area: area,
    layout: layout,
    orientation: form.value.orientation || '',
    floor: form.value.floor || '',
    decoration: form.value.decoration || '',
    buildingType: form.value.buildingType || '',
    buildYear: form.value.buildYear || '',
    elevatorRatio: form.value.elevatorRatio || '',
    address: address,
    publishdate: new Date().toISOString().split('T')[0], // 当前日期 YYYY-MM-DD
    status: form.value.status || '待审核', // 新建房源默认状态为"待审核"
    sellerid: store.getUserInfo?.userid || 1, // 从store获取当前用户ID
    photoList: photoList // 图片URI列表
  }
  
  // 只有当 tagIds 不为空时才添加到请求数据中
  if (tagIds.length > 0) {
    apiData.tagIds = tagIds
  }

  return apiData
}

// 取消
const handleCancel = () => {
  router.push('/house/list')
}

// 返回
const handleBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.house-add {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-radius: 4px;

    h2 {
      margin: 0;
      color: #333;
      font-size: 20px;
      font-weight: 600;
    }

    .header-actions {
      .el-button {
        margin-left: 10px;
      }
    }
  }

  .form-content {
    margin-top: 20px;
    .upload-section {
      .uploaded-images {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;

        .image-item {
          position: relative;
          width: 120px;
          height: 80px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          overflow: hidden;
          transition: all 0.3s;

          &.view-mode {
            width: 180px;
            height: 120px;
            cursor: pointer;

            &:hover {
              transform: scale(1.05);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .view-image {
            width: 100%;
            height: 100%;
            cursor: pointer;
          }

          .image-actions {
            position: absolute;
            top: 5px;
            right: 5px;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 2;
          }

          &:hover .image-actions {
            opacity: 1;
          }

          .uploading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;

            .el-icon {
              font-size: 24px;
              color: #fff;
            }
          }
        }
      }

      .no-images-tip {
        padding: 20px;
        text-align: center;
      }

      .upload-trigger {
        .upload-area {
          width: 120px;
          height: 80px;
          border: 2px dashed #dcdfe6;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.3s;
          color: #999;

          &:hover {
            border-color: #409eff;
            color: #409eff;
          }

          div {
            font-size: 12px;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .footer {
    text-align: right;
  }
}
</style>
