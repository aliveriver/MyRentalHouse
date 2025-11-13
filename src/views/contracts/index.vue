<template>
  <div class="contracts-management">
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="合同状态">
          <el-select
            v-model="searchForm.contractstatus"
            placeholder="请选择合同状态"
            clearable
            style="width: 200px"
          >
            <el-option label="待审核" value="待审核" />
            <el-option label="已签订" value="已签订" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="签订日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-section">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span class="title">合同列表</span>
            <div class="header-actions">
              <el-button
                v-if="isAdmin"
                type="danger"
                :disabled="selectedContracts.length === 0"
                @click="handleBatchDelete"
              >
                <el-icon><Delete /></el-icon>
                批量删除 ({{ selectedContracts.length }})
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          :data="paginatedContracts"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          empty-text="暂无合同数据"
          stripe
          height="600"
        >
          <el-table-column 
            type="selection" 
            width="55"
            :selectable="(row) => row.contractstatus !== '已签订'"
          />
          <el-table-column prop="contractid" label="合同ID" width="100" />

          <el-table-column label="房源信息" min-width="200">
            <template #default="scope">
              <div class="house-info">
                <div class="house-title">
                  {{ scope.row.houseTitle || '未知房源' }}
                </div>
                <div class="house-address">
                  {{ scope.row.houseAddress || '地址未知' }}
                </div>
                <div class="house-price">
                  ¥{{ scope.row.housePrice || 0 }}万
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="买家信息" min-width="120">
            <template #default="scope">
              <div class="buyer-info">
                <div class="buyer-name">
                  {{ scope.row.buyerName || '未知买家' }}
                </div>
                <div class="buyer-contact">
                  {{ scope.row.buyerPhone || '无联系方式' }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="signingdate" label="签订日期" width="120">
            <template #default="scope">
              {{ formatDate(scope.row.signingdate) }}
            </template>
          </el-table-column>

          <el-table-column prop="contractstatus" label="合同状态" width="100">
            <template #default="scope">
              <el-tag
                :type="getStatusTagType(scope.row.contractstatus)"
                size="small"
              >
                {{ scope.row.contractstatus }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="small"
                  @click="viewContract(scope.row)"
                >
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
                <el-button
                  v-if="scope.row.contractstatus === '待审核'"
                  type="success"
                  size="small"
                  @click="signContract(scope.row)"
                  :loading="scope.row.signing"
                >
                  <el-icon><EditPen /></el-icon>
                  签订
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  @click="editContract(scope.row)"
                  :disabled="scope.row.contractstatus === '已签订'"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  v-if="isAdmin"
                  type="danger"
                  size="small"
                  @click="deleteContract(scope.row)"
                  :loading="scope.row.deleting"
                  :disabled="scope.row.contractstatus === '已签订'"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <div class="pagination-info">
            第{{ pagination.page }}页 共{{ Math.ceil(pagination.total / pagination.size)

            }}页，共{{ pagination.total }}条
          </div>
          <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.size"
            :total="pagination.total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
            :pager-count="5"
            size="small"
          />
        </div>
      </el-card>
    </div>

    <!-- 合同详情对话框 -->
    <el-dialog
      v-model="contractDetailVisible"
      title="合同详情"
      width="80%"
      max-width="1200px"
      draggable
    >
      <div v-if="currentContract" class="contract-detail">
        <!-- 合同基本信息 -->
        <el-card shadow="never" class="contract-info-card">
          <template #header>
            <div class="card-header">
              <span>合同基本信息</span>
            </div>
          </template>
          <el-descriptions border :column="2">
            <el-descriptions-item label="合同ID">
              {{ currentContract.contractid }}
            </el-descriptions-item>
            <el-descriptions-item label="合同状态">
              <el-tag :type="getStatusTagType(currentContract.contractstatus)">
                {{ currentContract.contractstatus }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="房源ID">
              {{ currentContract.propertyid }}
            </el-descriptions-item>
            <el-descriptions-item label="房源标题">
              {{ currentContract.houseTitle || '未知房源' }}
            </el-descriptions-item>
            <el-descriptions-item label="房源地址" span="2">
              {{ currentContract.houseAddress || '地址未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="房源价格">
              ¥{{ currentContract.housePrice || 0 }}元
            </el-descriptions-item>
            <el-descriptions-item label="买家ID">
              {{ currentContract.buyerid }}
            </el-descriptions-item>
            <el-descriptions-item label="买家姓名">
              {{ currentContract.buyerName || '未知买家' }}
            </el-descriptions-item>
            <el-descriptions-item label="买家联系方式">
              {{ currentContract.buyerPhone || '无联系方式' }}
            </el-descriptions-item>
            <el-descriptions-item label="签订日期">
              {{ formatDate(currentContract.signingdate) }}
            </el-descriptions-item>
            <el-descriptions-item label="合同文件" span="2">
              <el-button
                v-if="currentContract.contractfile"
                type="primary"
                size="small"
                :icon="Download"
                @click="downloadContractFile(currentContract.contractfile)"
              >
                下载合同文件
              </el-button>
              <span v-else class="no-file-text">暂无合同文件</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 合同模板预览 -->
        <el-card
          v-if="currentContract.contractfile"
          shadow="never"
          class="contract-template-card"
        >
          <template #header>
            <div class="card-header">
              <span>合同模板预览</span>
              <div class="header-actions">
                <el-button
                  text
                  :icon="Download"
                  @click="downloadContractFile(currentContract.contractfile)"
                >
                  下载
                </el-button>
              </div>
            </div>
          </template>
          <div class="contract-template-viewer" v-loading="contractFileLoading">
            <!-- PDF预览 -->
            <iframe
              v-if="isPdfFile(currentContract.contractfile)"
              :src="getContractFileUrl(currentContract.contractfile)"
              class="contract-iframe"
              frameborder="0"
            />
            <!-- 文本文件预览 -->
            <div
              v-else-if="isTextFile(currentContract.contractfile)"
              class="contract-text-viewer"
            >
              <pre v-if="contractFileContent" class="contract-text-content">{{
                contractFileContent
              }}</pre>
              <div v-else class="text-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                加载中...
              </div>
            </div>
            <!-- 其他格式文件（DOC等） -->
            <div v-else class="contract-other-file">
              <el-empty description="该文件格式不支持在线预览">
                <template #image>
                  <el-icon :size="100" color="#c0c4cc"><Document /></el-icon>
                </template>
                <el-button
                  type="primary"
                  :icon="Download"
                  @click="downloadContractFile(currentContract.contractfile)"
                >
                  下载文件查看
                </el-button>
              </el-empty>
            </div>
          </div>
        </el-card>
        <el-card
          v-else
          shadow="never"
          class="contract-template-card"
        >
          <el-empty description="暂无合同模板文件" />
        </el-card>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="contractDetailVisible = false">关闭</el-button>
          <el-button
            v-if="currentContract && currentContract.contractstatus !== '已签订'"
            type="warning"
            @click="editContract(currentContract)"
          >
            编辑合同
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑合同对话框 -->
    <el-dialog
      v-model="editContractVisible"
      title="编辑合同"
      width="50%"
      max-width="600px"
      draggable
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="120px"
      >
        <el-form-item label="合同ID" prop="contractid">
          <el-input v-model="editForm.contractid" disabled />
        </el-form-item>
        <el-form-item label="房源ID" prop="propertyid">
          <el-input v-model="editForm.propertyid" disabled />
        </el-form-item>
        <el-form-item label="买家ID" prop="buyerid">
          <el-input v-model="editForm.buyerid" disabled />
        </el-form-item>
        <el-form-item label="签订日期" prop="signingdate">
          <el-date-picker
            v-model="editForm.signingdate"
            type="date"
            placeholder="选择签订日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="合同状态" prop="contractstatus">
          <el-select
            v-model="editForm.contractstatus"
            placeholder="请选择合同状态"
            style="width: 100%"
          >
            <el-option label="待审核" value="待审核" />
            <el-option label="已签订" value="已签订" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editContractVisible = false">取消</el-button>
          <el-button type="primary" @click="updateContract" :loading="updating">
            确认更新
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 费用说明与支付弹窗 -->
    <PaymentDialog
      v-model="paymentDialogVisible"
      :property-price="pendingContract?.housePrice || 0"
      :service-fee="calculateServiceFee"
      :contract-id="pendingContract?.contractid"
      contract-type="sign"
      @confirm="handlePaymentConfirm"
      @cancel="handlePaymentCancel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Search, RefreshLeft, Delete, View, Edit, Download, Document, Loading, EditPen
} from '@element-plus/icons-vue'
import { contractsApi, propertiesApi, usersApi } from '../../api/index'
import filesApi from '../../api/files'
import PaymentDialog from '@/components/PaymentDialog.vue'
import { isBuyerRole as checkBuyerRole, isAdminRole } from '@/utils/userRole'
import useStore from '@/store/index'

const store = useStore()
const loading = ref(false)
const updating = ref(false)
const contractsList = ref([])
const selectedContracts = ref([])
const contractDetailVisible = ref(false)
const editContractVisible = ref(false)
const currentContract = ref(null)
const editFormRef = ref(null)
const contractFileLoading = ref(false)
const contractFileContent = ref('')
const paymentDialogVisible = ref(false)
const pendingContract = ref(null)

// 检查是否为买家角色
const isBuyerRole = computed(() => {
  const userRole = store.userInfo?.role || ''
  return checkBuyerRole(userRole)
})

// 检查是否为管理员角色
const isAdmin = computed(() => {
  const userRole = store.userInfo?.role || ''
  return isAdminRole(userRole)
})

// 搜索表单
const searchForm = reactive({
  contractstatus: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 编辑表单
const editForm = reactive({
  contractid: '',
  propertyid: '',
  buyerid: '',
  signingdate: '',
  contractstatus: ''
})

// 编辑表单验证规则
const editRules = {
  signingdate: [
    { required: true, message: '请选择签订日期', trigger: 'change' }
  ],
  contractstatus: [
    { required: true, message: '请选择合同状态', trigger: 'change' }
  ]
}

// 计算服务费（0.5%房价，单位：元）
const calculateServiceFee = computed(() => {
  const priceInYuan = pendingContract.value?.housePrice || 0 // 价格已经是元单位
  return Math.round(priceInYuan * 0.005) // 0.5%服务费，四舍五入到整数
})

// 过滤后的合同列表
const filteredContracts = computed(() => {
  let filtered = [...contractsList.value]

  // 状态过滤
  if (searchForm.contractstatus) {
    filtered = filtered.filter(contract =>
      contract.contractstatus === searchForm.contractstatus
    )
  }

  // 日期范围过滤
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.dateRange
    filtered = filtered.filter(contract => {
      const signingDate = contract.signingdate
      return signingDate >= startDate && signingDate <= endDate
    })
  }

  return filtered
})

// 分页后的合同列表（用于显示）
const paginatedContracts = computed(() => {
  const start = (pagination.page - 1) * pagination.size
  const end = start + pagination.size
  const result = filteredContracts.value.slice(start, end)
  pagination.total = filteredContracts.value.length
  return result
})

const route = useRoute()
const router = useRouter()

onMounted(() => {
  loadContracts()
  
  // 检查是否从支付页面返回
  if (route.query.fromPayment === 'true') {
    // 延迟一下确保页面已加载
    setTimeout(() => {
      loadContracts()
      // 清除查询参数
      router.replace({ path: route.path, query: {} })
    }, 100)
  }
})

// 监听路由变化，当从支付页面返回时刷新合同列表
watch(() => route.query.fromPayment, (newVal) => {
  if (newVal === 'true') {
    loadContracts()
    // 清除查询参数
    router.replace({ path: route.path, query: {} })
  }
})

// 加载合同列表
const loadContracts = async () => {
  loading.value = true
  try {
    const [contractsResponse, propertiesResponse, usersResponse] = await Promise.all([
      contractsApi.getAllContracts(),
      propertiesApi.getAllProperties(),
      usersApi.getAllUsers()
    ])

    if (contractsResponse.success) {
      // 关联房源和用户信息
      contractsList.value = contractsResponse.data.map(contract => {
        const house = propertiesResponse.success ?
          propertiesResponse.data.find(h => h.propertyid === contract.propertyid) : null
        const buyer = usersResponse.success ?
          usersResponse.data.find(u => u.userid === contract.buyerid) : null

        return {
          ...contract,
          houseTitle: house?.title || '未知房源',
          houseAddress: house?.address || '地址未知',
          housePrice: house?.price || 0,
          buyerName: buyer?.username || '未知买家',
          buyerPhone: buyer?.phonenumber || '无联系方式',
          deleting: false
        }
      })
    } else {
      ElMessage.error(contractsResponse.errorMsg || '获取合同列表失败')
    }
  } catch (error) {
    console.error('获取合同列表失败:', error)
    ElMessage.error('获取合同列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 刷新合同列表
const refreshContracts = () => {
  loadContracts()
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
}

// 重置搜索
const resetSearch = () => {
  searchForm.contractstatus = ''
  searchForm.dateRange = []
  pagination.page = 1
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedContracts.value = selection
}

// 处理分页变化
const handlePageChange = (page) => {
  pagination.page = page
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
}

// 查看合同详情
const viewContract = (contract) => {
  currentContract.value = contract
  contractDetailVisible.value = true
  // 如果合同有文件，加载文件内容（文本文件）
  if (contract.contractfile && isTextFile(contract.contractfile)) {
    loadContractFileContent(contract.contractfile)
  } else {
    contractFileContent.value = ''
  }
}

// 监听合同详情对话框关闭，清理文件内容
watch(contractDetailVisible, (visible) => {
  if (!visible) {
    contractFileContent.value = ''
  }
})

// 获取合同文件URL
const getContractFileUrl = (contractFileUri) => {
  if (!contractFileUri) return ''
  return filesApi.getFileUrl(contractFileUri)
}

// 判断是否为PDF文件
const isPdfFile = (filename) => {
  if (!filename) return false
  const lowerFilename = filename.toLowerCase()
  return lowerFilename.endsWith('.pdf')
}

// 判断是否为文本文件
const isTextFile = (filename) => {
  if (!filename) return false
  const lowerFilename = filename.toLowerCase()
  return lowerFilename.endsWith('.txt')
}

// 加载合同文件内容（文本文件）
const loadContractFileContent = async (contractFileUri) => {
  if (!contractFileUri) return
  contractFileLoading.value = true
  try {
    const fileUrl = getContractFileUrl(contractFileUri)
    const response = await fetch(fileUrl)
    if (response.ok) {
      const text = await response.text()
      contractFileContent.value = text
    } else {
      ElMessage.error('加载合同文件失败')
    }
  } catch (error) {
    console.error('加载合同文件内容失败:', error)
    ElMessage.error('加载合同文件失败')
  } finally {
    contractFileLoading.value = false
  }
}

// 下载合同文件
const downloadContractFile = async (contractFileUri) => {
  if (!contractFileUri) {
    ElMessage.warning('合同文件不存在')
    return
  }
  try {
    const fileUrl = getContractFileUrl(contractFileUri)
    // 创建临时链接并下载
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = contractFileUri.split('/').pop() || 'contract.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('开始下载合同文件')
  } catch (error) {
    console.error('下载合同文件失败:', error)
    ElMessage.error('下载合同文件失败')
  }
}

// 编辑合同
const editContract = (contract) => {
  currentContract.value = contract
  editForm.contractid = contract.contractid
  editForm.propertyid = contract.propertyid
  editForm.buyerid = contract.buyerid
  editForm.signingdate = contract.signingdate
  editForm.contractstatus = contract.contractstatus

  contractDetailVisible.value = false
  editContractVisible.value = true
}

// 更新合同
const updateContract = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
  } catch (error) {
    ElMessage.warning('请填写完整的合同信息')
    return
  }

  try {
    await ElMessageBox.confirm('确认要更新此合同吗？', '确认更新', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    updating.value = true

    const updateData = {
      propertyid: editForm.propertyid,
      buyerid: editForm.buyerid,
      signingdate: editForm.signingdate,
      contractstatus: editForm.contractstatus
    }

    const response = await contractsApi.updateContract(editForm.contractid, updateData)

    if (response.success) {
      ElMessage.success('合同更新成功')
      editContractVisible.value = false
      loadContracts()
    } else {
      ElMessage.error(response.errorMsg || '合同更新失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('更新合同失败:', error)
    ElMessage.error('更新合同失败，请稍后再试')
  } finally {
    updating.value = false
  }
}

// 签订合同
const signContract = async (contract) => {
  try {
    await ElMessageBox.confirm(
      '确认要签订此合同吗？签订后合同将正式生效。',
      '确认签订',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 保存待签订的合同信息
    pendingContract.value = contract

    // 显示费用说明与支付弹窗
    paymentDialogVisible.value = true
  } catch (error) {
    if (error === 'cancel') {
      return // 用户取消操作
    }
  }
}

// 处理支付确认（用户点击支付按钮后）
const handlePaymentConfirm = async (paymentParams) => {
  // 支付页面会处理实际的支付逻辑
  paymentDialogVisible.value = false
}

// 处理支付取消
const handlePaymentCancel = async () => {
  // 用户取消支付，可以选择是否继续签订合同
  try {
    await ElMessageBox.confirm(
      '取消支付后，合同将不会签订。是否继续签订合同？',
      '确认操作',
      {
        confirmButtonText: '继续签订',
        cancelButtonText: '取消签订',
        type: 'warning'
      }
    )

    // 用户选择继续签订，直接签订合同（不支付）
    if (pendingContract.value) {
      const contract = pendingContract.value
      contract.signing = true

      try {
        const response = await contractsApi.signContract(contract.contractid)

        if (response.success) {
          ElMessage.success('合同签订成功')
          loadContracts()
        } else {
          ElMessage.error(response.errorMsg || '合同签订失败')
        }
      } catch (error) {
        console.error('签订合同失败:', error)
        ElMessage.error('签订合同失败，请稍后再试')
      } finally {
        contract.signing = false
        pendingContract.value = null
      }
    }
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消签订
      pendingContract.value = null
    }
  }
}

// 删除合同
const deleteContract = async (contract) => {
  try {
    await ElMessageBox.confirm(
      `确认要删除合同 ${contract.contractid} 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    contract.deleting = true

    const response = await contractsApi.deleteContract(contract.contractid)
    if (response.success) {
      ElMessage.success('合同删除成功')
      loadContracts()
    } else {
      ElMessage.error(response.errorMsg || '合同删除失败')
      contract.deleting = false
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('删除合同失败:', error)
    ElMessage.error('删除合同失败，请稍后再试')
    contract.deleting = false
  }
}

// 批量删除合同
const handleBatchDelete = async () => {
  if (selectedContracts.value.length === 0) {
    ElMessage.warning('请先选择要删除的合同')
    return
  }

  // 过滤掉已签订的合同
  const deletableContracts = selectedContracts.value.filter(
    contract => contract.contractstatus !== '已签订'
  )

  if (deletableContracts.length === 0) {
    ElMessage.warning('选中的合同均为已签订状态，不能删除')
    return
  }

  if (deletableContracts.length < selectedContracts.value.length) {
    const signedCount = selectedContracts.value.length - deletableContracts.length
    ElMessage.warning(`已自动排除 ${signedCount} 个已签订的合同`)
  }

  try {
    await ElMessageBox.confirm(
      `确认要删除选中的 ${deletableContracts.length} 个合同吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    const deletePromises = deletableContracts.map(contract =>
      contractsApi.deleteContract(contract.contractid)
    )

    const results = await Promise.allSettled(deletePromises)

    let successCount = 0
    let failCount = 0

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successCount++
      } else {
        failCount++
      }
    })

    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 个合同`)
    }
    if (failCount > 0) {
      ElMessage.error(`${failCount} 个合同删除失败`)
    }

    loadContracts()
    selectedContracts.value = []
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('批量删除合同失败:', error)
    ElMessage.error('批量删除失败，请稍后再试')
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知日期'
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN')
  } catch (error) {
    return '日期格式错误'
  }
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '未知时间'
  try {
    return new Date(dateTimeStr).toLocaleString('zh-CN')
  } catch (error) {
    return '时间格式错误'
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case '已签订':
      return 'success'
    case '待审核':
      return 'warning'
    case '待签订':
      return 'warning'
    case '已取消':
      return 'danger'
    case '已完成':
      return 'info'
    default:
      return 'info'
  }
}
</script>

<style lang="scss" scoped>
.contracts-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .search-section {
    margin-bottom: 20px;

    .search-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .table-section {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }

    .house-info {
      .house-title {
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .house-address {
        color: #909399;
        font-size: 12px;
        margin-bottom: 4px;
      }

      .house-price {
        color: #e74c3c;
        font-weight: 600;
        font-size: 14px;
      }
    }

    .buyer-info {
      .buyer-name {
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .buyer-contact {
        color: #909399;
        font-size: 12px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;

      .el-button {
        margin: 0;
        padding: 5px 8px;
      }
    }


    .pagination-wrapper {
      background: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      margin-top: 20px;
      border-top: 1px solid #e4e7ed;

      .pagination-info {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .contract-detail {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .contract-info-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .contract-template-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-actions {
          display: flex;
          gap: 10px;
        }
      }

      .contract-template-viewer {
        min-height: 600px;
        max-height: 80vh;
        overflow: auto;

        .contract-iframe {
          width: 100%;
          min-height: 600px;
          height: 80vh;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
        }

        .contract-text-viewer {
          .contract-text-content {
            padding: 20px;
            background: #f5f7fa;
            border-radius: 4px;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            color: #303133;
            max-height: 80vh;
            overflow: auto;
          }

          .text-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            color: #909399;
          }
        }

        .contract-other-file {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }
      }
    }

    .no-file-text {
      color: #909399;
      font-size: 14px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .contracts-management {
    padding: 10px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .search-form {
      .el-form-item {
        width: 100%;
        margin-bottom: 15px;
      }
    }

    .action-buttons {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
