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
                :readonly="isView"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="户型" prop="layout">
              <el-select
                v-model="form.layout"
                placeholder="请选择户型"
                style="width: 100%"
                :disabled="isView"
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
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="房源地址" prop="address">
              <el-input
                v-model="form.address"
                placeholder="请输入房源地址"
                :readonly="isView"
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
                :disabled="isView"
              >
                <el-option
                  :label="item.value"
                  :value="item.value"
                  v-for="item in tags.statusTags"
                  :key="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签" prop="tagIds">
              <el-select
                v-model="form.tagIds"
                placeholder="请选择标签"
                style="width: 100%"
                :disabled="isView"
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
                :readonly="isView"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房源价格" prop="price">
              <el-input
                v-model="form.price"
                placeholder="请输入房源价格(元)"
                :readonly="isView"
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
                :readonly="isView"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="图片上传"
              prop="images"
              v-if="!isView || form.images.length > 0"
            >
              <div class="upload-section">
                <div class="uploaded-images" v-if="form.images.length > 0">
                  <div
                    v-for="(image, index) in form.images"
                    :key="index"
                    class="image-item"
                  >
                    <img :src="image.url" :alt="image.name" />
                    <div class="image-actions" v-if="!isView">
                      <el-button
                        type="danger"
                        size="small"
                        circle
                        @click="removeImage(index)"
                      >
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
                <div class="upload-trigger" v-if="!isView">
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import { propertiesApi } from '@/api/index'
import useStore from '@/store/index'
import * as tags from "@/constant/tags"

const router = useRouter()
const route = useRoute()
const store = useStore()

// 页面状态
const isEdit = ref(false)
const isView = ref(false)
const loading = ref(false)

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
  address: '',                  // 房源地址（对应原来的location）
  status: '在售',               // 状态，默认在售
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
    address: '',
    status: '在售',
    images: [],
  }
}

// 加载房源数据
const loadHouseData = async (id) => {
  try {
    loading.value = true
    const response = await propertiesApi.getPropertyById(id)

    if (response && response.success) {
      const propertyData = response.data

      // 将API数据映射到表单
      form.value = {
        // API字段
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        area: propertyData.area,
        layout: propertyData.layout,
        address: propertyData.address,
        status: propertyData.status,
        // 界面字段（模拟数据或从API字段转换）
        houseNumber: id,
        tagIds: propertyData.tagIds || [],
        images: [
          { url: 'https://via.placeholder.com/150x100?text=房源图片1', name: '房源图片1' },
          { url: 'https://via.placeholder.com/150x100?text=房源图片2', name: '房源图片2' }
        ],
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
const beforeUpload = (file) => {
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

  // 创建预览URL
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.images.push({
      url: e.target.result,
      name: file.name,
      file: file
    })
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
  const price = parseFloat(form.value.price) || 0
  const area = parseFloat(form.value.area) || 0
  const layout = form.value.layout || '住宅'
  const address = form.value.address
  const description = form.value.description

  const tagIds = form.value.tagIds
  return {
    title: form.value.title,
    description: description,
    price: price,
    area: area,
    layout: layout,
    address: address,
    publishdate: new Date().toISOString().split('T')[0], // 当前日期 YYYY-MM-DD
    status: form.value.status || '在售',
    sellerid: store.getUserInfo?.userid || 1, // 从store获取当前用户ID
    tagIds: tagIds
  }
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

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-actions {
            position: absolute;
            top: 5px;
            right: 5px;
            opacity: 0;
            transition: opacity 0.3s;
          }

          &:hover .image-actions {
            opacity: 1;
          }
        }
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
