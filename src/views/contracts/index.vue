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
          <el-table-column type="selection" width="55" />
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
                  type="warning"
                  size="small"
                  @click="editContract(scope.row)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteContract(scope.row)"
                  :loading="scope.row.deleting"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 合同详情对话框 -->
    <el-dialog
      v-model="contractDetailVisible"
      title="合同详情"
      width="60%"
      max-width="800px"
      draggable
    >
      <div v-if="currentContract" class="contract-detail">
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
          <el-descriptions-item label=" "> </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="contractDetailVisible = false">关闭</el-button>
          <el-button type="warning" @click="editContract(currentContract)">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Search, RefreshLeft, Delete, View, Edit
} from '@element-plus/icons-vue'
import { contractsApi, propertiesApi, usersApi } from '../../api/index'

const loading = ref(false)
const updating = ref(false)
const contractsList = ref([])
const selectedContracts = ref([])
const contractDetailVisible = ref(false)
const editContractVisible = ref(false)
const currentContract = ref(null)
const editFormRef = ref(null)

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

onMounted(() => {
  loadContracts()
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

  try {
    await ElMessageBox.confirm(
      `确认要删除选中的 ${selectedContracts.value.length} 个合同吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    const deletePromises = selectedContracts.value.map(contract =>
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
      margin-top: 20px;
    }
  }

  .contract-detail {
    .el-descriptions {
      margin-top: 20px;
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
