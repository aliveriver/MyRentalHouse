<template>
  <div class="contract-sign-page">
    <div class="page-header">
      <p>申请签署购房合同</p>
    </div>

    <div class="contract-content" v-loading="loading">
      <!-- 房源信息展示 -->
      <el-card class="house-info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>房源信息</span>
          </div>
        </template>
        <div v-if="houseInfo" class="house-info">
          <div class="house-image">
            <img
              :src="houseInfo.image || defaultHouseImage"
              :alt="houseInfo.title"
            />
          </div>
          <div class="house-details">
            <h3 class="house-title">{{ houseInfo.title }}</h3>
            <div class="house-meta">
              <div class="meta-item">
                <el-icon><Location /></el-icon>
                <span>{{ houseInfo.address }}</span>
              </div>
              <div class="meta-item">
                <el-icon><House /></el-icon>
                <span>{{ houseInfo.layout }} | {{ houseInfo.area }}m²</span>
              </div>
              <div class="meta-item price">
                <span class="price-label">售价：</span>
                <span class="price-value">¥{{ houseInfo.price }}元</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 合同签署表单 -->
      <el-card class="contract-form-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>申请签署购房合同</span>
          </div>
        </template>

        <el-form
          ref="contractFormRef"
          :model="contractForm"
          :rules="contractRules"
          label-width="120px"
          class="contract-form"
        >
          <el-form-item label="房源名称" prop="propertyTitle">
            <el-input v-model="contractForm.propertyTitle" disabled />
          </el-form-item>

          <el-form-item label="房源ID" prop="propertyid">
            <el-input v-model="contractForm.propertyid" disabled />
          </el-form-item>

          <el-form-item label="买家ID" prop="buyerid">
            <el-input v-model="contractForm.buyerid" disabled />
          </el-form-item>


          <el-form-item label="合同文件" prop="contractFile">
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :on-change="handleContractFileChange"
              :on-remove="handleContractFileRemove"
              :limit="1"
              accept=".pdf,.doc,.docx,.txt"
              :file-list="contractFileList"
            >
              <el-button type="primary">选择合同文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  请上传PDF、Word或TXT格式的合同文件，文件大小不超过10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button @click="goBack" size="large">取消</el-button>
              <el-button
                type="primary"
                @click="submitContract"
                :loading="submitting"
                size="large"
              >
                提交申请
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 合同条款说明 -->
      <el-card class="terms-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>重要提示</span>
          </div>
        </template>
        <div class="terms-content">
          <el-alert
            title="合同签署须知"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <ul class="terms-list">
                <li>请仔细核对房源信息和合同价格，确保无误后再提交申请</li>
                <li>请上传PDF、Word或TXT格式的合同文件，文件大小不超过10MB</li>
                <li>提交申请后，请等待卖家审核，审核通过后合同即生效</li>
                <li>如有疑问，请联系客服或法务部门</li>
                <li>提交前请确保您已充分了解房源状况和相关法律风险</li>
              </ul>
            </template>
          </el-alert>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, House } from '@element-plus/icons-vue'
import { contractsApi, propertiesApi } from '@/api/index'
import useStore from '@/store/index'

const route = useRoute()
const router = useRouter()
const store = useStore()

const loading = ref(false)
const submitting = ref(false)
const contractFormRef = ref(null)
const uploadRef = ref(null)
const houseInfo = ref(null)
const contractFileList = ref([])
const selectedContractFile = ref(null)

// 默认房源图片
const defaultHouseImage = 'https://img.zx123.cn/Resources/zx123cn/uploadfile/2020/0507/6bf211145acaf9038e4278f6de6a50eb.jpg'

// 合同表单数据
const contractForm = reactive({
  propertyid: '',
  propertyTitle: '',
  buyerid: '',
  signingdate: '',
  contractFile: null
})

// 表单验证规则
const contractRules = {
  contractFile: [
    {
      validator: (rule, value, callback) => {
        if (!selectedContractFile.value) {
          callback(new Error('请上传合同文件'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}


// 获取路由参数
const propertyId = computed(() => route.params.propertyId || route.query.propertyId)
const appointmentId = computed(() => route.params.appointmentId || route.query.appointmentId)

// 初始化页面数据
onMounted(() => {
  if (!store.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  initializeForm()
  loadHouseInfo()
})

// 初始化表单
const initializeForm = () => {
  contractForm.propertyid = propertyId.value
  // 兼容不同的用户ID字段名
  contractForm.buyerid = store.userInfo?.id || store.userInfo?.userid || ''

  // 设置默认签约时间为当前时间
  const now = new Date()
  contractForm.signingdate = now.toISOString().slice(0, 10) // 只取日期部分
  
  // 重置文件上传
  contractFileList.value = []
  selectedContractFile.value = null
  contractForm.contractFile = null
}

// 加载房源信息
const loadHouseInfo = async () => {
  if (!propertyId.value) {
    ElMessage.error('房源ID参数缺失')
    goBack()
    return
  }

  loading.value = true
  try {
    const response = await propertiesApi.getAllProperties()
    if (response.success) {
      const house = response.data.find(h => h.propertyid == propertyId.value)
      if (house) {
        houseInfo.value = house
        contractForm.propertyTitle = house.title
        contractForm.propertyid = house.propertyid.toString()
      } else {
        ElMessage.error('房源信息不存在')
        goBack()
      }
    } else {
      ElMessage.error('获取房源信息失败')
      goBack()
    }
  } catch (error) {
    console.error('获取房源信息失败:', error)
    ElMessage.error('获取房源信息失败，请稍后再试')
    goBack()
  } finally {
    loading.value = false
  }
}

// 处理合同文件选择
const handleContractFileChange = (file) => {
  if (!file || !file.raw) {
    return
  }
  
  // 检查文件大小（10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.raw.size > maxSize) {
    ElMessage.error('文件大小不能超过10MB')
    contractFileList.value = []
    selectedContractFile.value = null
    // 触发表单验证
    if (contractFormRef.value) {
      contractFormRef.value.validateField('contractFile')
    }
    return
  }
  
  // 检查文件类型（支持PDF、Word和TXT格式）
  const fileName = file.raw.name || ''
  const fileType = file.raw.type || ''
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
  
  const isValidType = allowedMimeTypes.includes(fileType) || 
    allowedExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  
  if (!isValidType) {
    ElMessage.error('请上传PDF、Word或TXT格式的合同文件')
    contractFileList.value = []
    selectedContractFile.value = null
    // 触发表单验证
    if (contractFormRef.value) {
      contractFormRef.value.validateField('contractFile')
    }
    return
  }
  
  selectedContractFile.value = file.raw
  // 更新表单数据以触发表单验证
  contractForm.contractFile = file.raw.name
  // 触发表单验证
  if (contractFormRef.value) {
    contractFormRef.value.validateField('contractFile')
  }
}

// 处理合同文件移除
const handleContractFileRemove = () => {
  selectedContractFile.value = null
  contractForm.contractFile = null
  // 触发表单验证
  if (contractFormRef.value) {
    contractFormRef.value.validateField('contractFile')
  }
}

// 提交合同
const submitContract = async () => {
  // 先检查文件是否已选择
  if (!selectedContractFile.value) {
    ElMessage.warning('请选择合同文件')
    // 触发表单验证以显示错误
    if (contractFormRef.value) {
      contractFormRef.value.validateField('contractFile')
    }
    return
  }

  if (!contractFormRef.value) return

  try {
    await contractFormRef.value.validate()
  } catch (error) {
    ElMessage.warning('请填写完整的合同信息')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确认要提交此购房合同申请吗？请等待卖家审核。',
      '确认提交申请',
      {
        confirmButtonText: '确认提交',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }
    )

    submitting.value = true

    // 先上传合同文件
    const uploadResponse = await contractsApi.uploadContractFile(selectedContractFile.value)
    
    if (!uploadResponse.success) {
      ElMessage.error(uploadResponse.errorMsg || '合同文件上传失败')
      return
    }

    // 获取文件URI，可能是 response.data 或 response.data.uri
    const contractFileUri = uploadResponse.data?.uri || uploadResponse.data

    if (!contractFileUri) {
      ElMessage.error('获取文件URI失败，请重试')
      return
    }

    // 提交合同申请
    const applicationData = {
      propertyId: parseInt(contractForm.propertyid),
      contractFileUri: contractFileUri
    }

    const response = await contractsApi.applyContract(applicationData)

    if (response.success) {
      ElMessage.success('合同申请提交成功！请等待卖家审核')

      // 可以在这里添加跳转到合同详情页面的逻辑
      setTimeout(() => {
        goBack()
      }, 1500)
    } else {
      ElMessage.error(response.errorMsg || '合同申请失败，请稍后再试')
    }
  } catch (error) {
    if (error === 'cancel') {
      return // 用户取消操作
    }
    console.error('提交合同申请失败:', error)
    ElMessage.error('提交合同申请失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.contract-sign-page {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    font-size: 18px;
  }

  .contract-content {
    max-width: 1000px;
    margin: 0 auto;

    .el-card {
      margin-bottom: 20px;

      .card-header {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .house-info-card {
    .house-info {
      display: flex;
      gap: 20px;

      .house-image {
        flex-shrink: 0;
        width: 200px;
        height: 150px;
        border-radius: 8px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .house-details {
        flex: 1;

        .house-title {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 15px 0;
        }

        .house-meta {
          .meta-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            color: #606266;

            .el-icon {
              margin-right: 8px;
              color: #909399;
            }

            &.price {
              margin-top: 15px;

              .price-label {
                font-weight: 500;
                color: #303133;
              }

              .price-value {
                font-size: 20px;
                font-weight: 600;
                color: #e74c3c;
                margin-left: 5px;
              }
            }
          }
        }
      }
    }
  }

  .contract-form-card {
    .contract-form {
      .form-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 30px;

        .el-button {
          min-width: 120px;
        }
      }

      .el-upload__tip {
        color: #999;
        font-size: 12px;
        margin-top: 5px;
      }
    }
  }

  .terms-card {
    .terms-content {
      .terms-list {
        margin: 10px 0 0 20px;
        padding: 0;

        li {
          margin-bottom: 8px;
          line-height: 1.6;
          color: #606266;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .contract-sign-page {
    padding: 10px;

    .contract-content {
      .house-info-card {
        .house-info {
          flex-direction: column;

          .house-image {
            width: 100%;
            height: 200px;
          }
        }
      }

      .contract-form-card {
        .contract-form {
          .el-form-item {
            margin-bottom: 20px;
          }

          .form-actions {
            flex-direction: column;

            .el-button {
              width: 100%;
            }
          }
        }
      }
    }
  }
}
</style>
