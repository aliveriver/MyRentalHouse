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
            <el-form-item label="房源编号" prop="houseNumber">
              <el-input
                v-model="form.houseNumber"
                placeholder="请输入编号"
                :readonly="isView"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房源类型" prop="houseType">
              <el-select
                v-model="form.houseType"
                placeholder="请选择类型"
                style="width: 100%"
                :disabled="isView"
              >
                <el-option label="住宅" value="住宅" />
                <el-option label="公寓" value="公寓" />
                <el-option label="别墅" value="别墅" />
                <el-option label="商铺" value="商铺" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产产地" prop="productionPlace">
              <el-select
                v-model="form.productionPlace"
                placeholder="选择产地"
                style="width: 100%"
                :disabled="isView"
              >
                <el-option label="北京" value="北京" />
                <el-option label="上海" value="上海" />
                <el-option label="广州" value="广州" />
                <el-option label="深圳" value="深圳" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="对应位置" prop="location">
              <el-select
                v-model="form.location"
                placeholder="请选择房源所处位置"
                style="width: 100%"
                :disabled="isView"
              >
                <el-option label="市中心" value="市中心" />
                <el-option label="城东" value="城东" />
                <el-option label="城西" value="城西" />
                <el-option label="城南" value="城南" />
                <el-option label="城北" value="城北" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房源大小" prop="houseSize">
              <el-input
                v-model="form.houseSize"
                placeholder="请输入面积"
                :readonly="isView"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="展示价格" prop="displayPrice">
              <el-input
                v-model="form.displayPrice"
                placeholder="请输入价格(元)"
                :readonly="isView"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="市场价格" prop="marketPrice">
              <el-input
                v-model="form.marketPrice"
                placeholder="请输入价格(元)"
                :readonly="isView"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="关键词" prop="keywords">
              <el-input
                v-model="form.keywords"
                placeholder="以逗号分开,最多5个"
                :readonly="isView"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="产品简介" prop="description">
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

        <el-row>
          <el-col :span="24">
            <el-form-item label="详细内容" prop="detailedContent">
              <el-input
                type="textarea"
                v-model="form.detailedContent"
                placeholder="最少输入10个字符"
                :rows="6"
                :readonly="isView"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="footer">
      <div class="header-actions" v-if="!isView">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
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

const router = useRouter()
const route = useRoute()

// 页面状态
const isEdit = ref(false)
const isView = ref(false)

// 表单引用
const formRef = ref(null)

// 表单数据
const form = ref({
  title: '',
  houseNumber: '',
  houseType: '',
  productionPlace: '',
  location: '',
  houseSize: '',
  displayPrice: '',
  marketPrice: '',
  keywords: '',
  description: '',
  images: [],
  detailedContent: ''
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入房源标题', trigger: 'blur' }
  ],
  houseNumber: [
    { required: true, message: '请输入房源编号', trigger: 'blur' }
  ],
  houseType: [
    { required: true, message: '请选择房源类型', trigger: 'change' }
  ],
  productionPlace: [
    { required: true, message: '请选择生产产地', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请选择对应位置', trigger: 'change' }
  ],
  houseSize: [
    { required: true, message: '请输入房源大小', trigger: 'blur' }
  ],
  displayPrice: [
    { required: true, message: '请输入展示价格', trigger: 'blur' }
  ],
  marketPrice: [
    { required: true, message: '请输入市场价格', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入产品简介', trigger: 'blur' },
    { min: 10, message: '最少输入10个字符', trigger: 'blur' }
  ],
  detailedContent: [
    { required: true, message: '请输入详细内容', trigger: 'blur' },
    { min: 10, message: '最少输入10个字符', trigger: 'blur' }
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
    title: '',
    houseNumber: '',
    houseType: '',
    productionPlace: '',
    location: '',
    houseSize: '',
    displayPrice: '',
    marketPrice: '',
    keywords: '',
    description: '',
    images: [],
    detailedContent: ''
  }
}

// 加载房源数据
const loadHouseData = (id) => {
  // 模拟从服务器加载数据
  // 实际项目中这里应该是API调用
  const mockData = {
    title: '朝阳门精装修三居室',
    houseNumber: '987767',
    houseType: '住宅',
    productionPlace: '北京',
    location: '市中心',
    houseSize: '128㎡',
    displayPrice: '7959',
    marketPrice: '9999',
    keywords: '地铁房,精装修,南北通透',
    description: '位于朝阳门核心地段，精装修三居室，南北通透，采光极佳。紧邻地铁站，交通便利。周边配套设施齐全，生活便利。',
    images: [
      { url: 'https://via.placeholder.com/150x100?text=房源图片1', name: '房源图片1' },
      { url: 'https://via.placeholder.com/150x100?text=房源图片2', name: '房源图片2' },
      { url: 'https://via.placeholder.com/150x100?text=房源图片3', name: '房源图片3' }
    ],
    detailedContent: '房源详细描述：这是一套位于朝阳门的精装修三居室，总面积128平方米，南北通透，采光极佳。房屋配备了现代化的家电设施，拎包即可入住。小区环境优美，配套设施完善，周边有多所知名学校和医院，交通便利，地铁2号线和6号线直达。房屋朝向南北，客厅朝南，主卧朝南，次卧朝北，厨房朝北。装修风格现代简约，家具家电齐全。'
  }

  form.value = { ...mockData }
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

// 发布
const handlePublish = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('发布成功')
      router.push('/house/list')
    }
  })
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
