<template>
  <div class="bills-management">
    <div class="header-section">
      <h2>我的账单</h2>
      <div class="filter-tabs">
        <el-radio-group v-model="activeTab" @change="handleTabChange">
          <el-radio-button value="pending">待支付</el-radio-button>
          <el-radio-button value="all">全部账单</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="table-section">
      <el-card shadow="never">
        <el-table
          :data="paginatedBills"
          v-loading="loading"
          empty-text="暂无账单数据"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="billid" label="账单编号" width="120" />

          <el-table-column label="房源信息" min-width="200">
            <template #default="scope">
              <div class="property-info">
                <div class="property-title">
                  {{ scope.row.propertyTitle || '未知房源' }}
                </div>
                <div class="property-address">
                  {{ scope.row.propertyAddress || '地址未知' }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="账单金额" min-width="150">
            <template #default="scope">
              <div class="amount-info">
                <div class="service-fee">
                  服务费：<span class="fee"
                    >¥{{ formatPrice(scope.row.servicefee) }}</span
                  >
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="billstatus"
            label="账单状态"
            width="120"
            align="center"
          >
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.billstatus)">
                {{ scope.row.billstatus }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="createdate"
            label="创建时间"
            width="180"
            align="center"
          >
            <template #default="scope">
              {{ formatDate(scope.row.createdate) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="paydate"
            label="支付时间"
            width="180"
            align="center"
          >
            <template #default="scope">
              {{ scope.row.paydate ? formatDate(scope.row.paydate) : '-' }}
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="250"
            align="center"
            fixed="right"
          >
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                link
                @click="handleViewDetail(scope.row)"
              >
                查看详情
              </el-button>
              <el-button
                v-if="scope.row.billstatus === '待支付'"
                type="success"
                size="small"
                link
                @click="handlePay(scope.row)"
              >
                立即支付
              </el-button>
              <!-- 撤回按钮：只对买家的服务费账单显示（已支付或待支付状态） -->
              <el-button
                v-if="canWithdrawBill(scope.row)"
                type="warning"
                size="small"
                link
                @click="handleWithdraw(scope.row)"
              >
                撤回账单
              </el-button>
              <el-button
                v-if="scope.row.billstatus === '待支付'"
                type="danger"
                size="small"
                link
                @click="handleCancel(scope.row)"
              >
                取消账单
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredBills.length"
        layout="prev, pager, next, total"
        @current-change="handlePageChange"
        :pager-count="5"
      />
    </div>

    <!-- 账单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="账单详情" width="600px">
      <div v-if="currentBill" class="bill-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="账单编号">
            {{ currentBill.billid }}
          </el-descriptions-item>
          <el-descriptions-item label="合同编号">
            {{ currentBill.contractid }}
          </el-descriptions-item>
          <el-descriptions-item label="房源价格（参考）" :span="2">
            <span class="price"
              >¥{{ formatPrice(currentBill.propertyprice) }}</span
            >
          </el-descriptions-item>
          <el-descriptions-item label="服务费（账单金额）" :span="2">
            <span class="fee">¥{{ formatPrice(currentBill.servicefee) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="账单状态">
            <el-tag :type="getStatusTagType(currentBill.billstatus)">
              {{ currentBill.billstatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentBill.createdate) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentBill.paydate" label="支付时间">
            {{ formatDate(currentBill.paydate) }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="currentBill.paymentmethod"
            label="支付方式"
          >
            {{ currentBill.paymentmethod }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="currentBill.paymenttransactionid"
            label="交易号"
            :span="2"
          >
            {{ currentBill.paymenttransactionid }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="currentBill.remark"
            label="备注"
            :span="2"
          >
            {{ currentBill.remark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentBill && currentBill.billstatus === '待支付'"
          type="primary"
          @click="handlePayFromDetail"
        >
          立即支付
        </el-button>
        <el-button
          v-if="currentBill && canWithdrawBill(currentBill)"
          type="warning"
          @click="handleWithdrawFromDetail"
        >
          撤回账单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { billsApi, propertiesApi } from '@/api/index'

const router = useRouter()

// 数据
const bills = ref([])
const loading = ref(false)
const activeTab = ref('pending')
const currentPage = ref(1)
const pageSize = ref(10)
const detailDialogVisible = ref(false)
const currentBill = ref(null)

// 筛选后的账单列表
const filteredBills = computed(() => {
  if (activeTab.value === 'pending') {
    return bills.value.filter(bill => bill.billstatus === '待支付')
  }
  return bills.value
})

// 分页后的账单列表
const paginatedBills = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredBills.value.slice(start, end)
})

// 获取账单列表
const getBills = async () => {
  try {
    loading.value = true
    const response = activeTab.value === 'pending'
      ? await billsApi.getPendingBillsByBuyer()
      : await billsApi.getAllBillsByBuyer()

    if (response && response.success) {
      // 在账单页面需要看到所有状态的房源，包括已出售的
      const propsResponse = await propertiesApi.getAllProperties({ includeAllStatus: true })
      const propertiesList = propsResponse && propsResponse.success ? propsResponse.data : []

      bills.value = (response.data || []).map(bill => {
        // 有些接口可能返回不同字段名，尝试兼容
        const propId = bill.propertyid || bill.propertyId || bill.propertyIdStr || null
        const prop = propertiesList.find(p => p.propertyid === propId) || propertiesList.find(p => p.id === propId) || null

        return {
          ...bill,
          propertyTitle: bill.propertyTitle || bill.propertytitle || prop?.title || prop?.name || '',
          propertyAddress: bill.propertyAddress || bill.propertyaddress || prop?.address || '',
          propertyStatus: prop?.status || '' // 保存房源状态，用于判断是否可以撤回
        }
      })
    } else {
      ElMessage.error(response?.errorMsg || '获取账单列表失败')
    }
  } catch (error) {
    console.error('获取账单列表失败:', error)
    ElMessage.error('获取账单列表失败')
  } finally {
    loading.value = false
  }
}

// Tab切换
const handleTabChange = () => {
  currentPage.value = 1
  getBills()
}

// 查看详情
const handleViewDetail = (row) => {
  currentBill.value = row
  detailDialogVisible.value = true
}

// 支付
const handlePay = (row) => {
  router.push({
    path: '/bills/pay',
    query: {
      billId: row.billid
    }
  })
}

// 从详情页支付
const handlePayFromDetail = () => {
  if (currentBill.value) {
    handlePay(currentBill.value)
    detailDialogVisible.value = false
  }
}

// 从详情页撤回
const handleWithdrawFromDetail = async () => {
  if (currentBill.value) {
    await handleWithdraw(currentBill.value)
    detailDialogVisible.value = false
  }
}

// 取消账单
const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该账单吗？',
      '取消确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await billsApi.cancelBill(row.billid)
    if (response && response.success) {
      ElMessage.success('账单取消成功')
      await getBills()
    } else {
      ElMessage.error(response?.errorMsg || '账单取消失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消账单失败:', error)
      ElMessage.error('取消账单失败')
    }
  }
}

// 判断是否可以撤回账单
const canWithdrawBill = (bill) => {
  // 只能撤回买家的服务费账单
  if (!bill.remark || !bill.remark.includes('买家服务费账单')) {
    return false
  }

  // 不能撤回房价账单
  if (bill.remark && bill.remark.includes('房款账单')) {
    return false
  }

  // 如果房源已售出，不能撤回（兼容"已售"和"已售出"两种状态值）
  if (bill.propertyStatus === '已售出' || bill.propertyStatus === '已售') {
    return false
  }

  // 只能撤回"已支付"或"待支付"状态的服务费账单
  return bill.billstatus === '已支付' || bill.billstatus === '待支付'
}

// 撤回账单
const handleWithdraw = async (row) => {
  try {
    await ElMessageBox.confirm(
      '撤回服务费账单将同时删除对应的合同记录，此操作不可恢复。确定要撤回吗？',
      '撤回确认',
      {
        confirmButtonText: '确定撤回',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await billsApi.withdrawBill(row.billid)
    if (response && response.success) {
      ElMessage.success('账单撤回成功，合同已删除')
      await getBills()
    } else {
      ElMessage.error(response?.errorMsg || '账单撤回失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('撤回账单失败:', error)
      ElMessage.error('撤回账单失败')
    }
  }
}

// 分页
const handlePageChange = (page) => {
  currentPage.value = page
}

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case '待支付':
      return 'warning'
    case '已支付':
      return 'success'
    case '已取消':
      return 'info'
    case '已退款':
      return 'danger'
    default:
      return ''
  }
}

// 页面挂载时获取数据
onMounted(() => {
  getBills()
})
</script>

<style lang="scss" scoped>
.bills-management {
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      color: #303133;
    }

    .filter-tabs {
      .el-radio-group {
        .el-radio-button {
          margin-left: 10px;
        }
      }
    }
  }

  .table-section {
    background: #fff;
    border-radius: 4px;
    margin-bottom: 20px;

    .property-info {
      .property-title {
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .property-address {
        font-size: 12px;
        color: #909399;
      }
    }

    .amount-info {
      .service-fee {
        margin-bottom: 4px;
        font-size: 14px;
        color: #606266;

        .fee {
          font-weight: 600;
          color: #409eff;
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .bill-detail {
    .price {
      font-size: 16px;
      font-weight: 600;
      color: #606266;
    }

    .fee {
      font-size: 18px;
      font-weight: 600;
      color: #409eff;
    }
  }
}
</style>
