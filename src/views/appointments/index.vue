<template>
  <div class="admin-appointments-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">预约管理</h1>
      <div class="header-actions">
        <el-button
          @click="refreshAppointments"
          :loading="loading"
          type="primary"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="never">
        <div class="stat-content">
          <div class="stat-number">{{ totalAppointments }}</div>
          <div class="stat-label">总预约数</div>
        </div>
        <el-icon class="stat-icon total"><Calendar /></el-icon>
      </el-card>

      <el-card class="stat-card pending" shadow="never">
        <div class="stat-content">
          <div class="stat-number">{{ pendingAppointments }}</div>
          <div class="stat-label">待审批</div>
        </div>
        <el-icon class="stat-icon"><Clock /></el-icon>
      </el-card>

      <el-card class="stat-card approved" shadow="never">
        <div class="stat-content">
          <div class="stat-number">{{ approvedAppointments }}</div>
          <div class="stat-label">已预约</div>
        </div>
        <el-icon class="stat-icon"><SuccessFilled /></el-icon>
      </el-card>

      <el-card class="stat-card cancelled" shadow="never">
        <div class="stat-content">
          <div class="stat-number">{{ cancelledAppointments }}</div>
          <div class="stat-label">已取消</div>
        </div>
        <el-icon class="stat-icon"><CircleCloseFilled /></el-icon>
      </el-card>
    </div>

    <!-- 预约列表 -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <h3>预约列表</h3>
        <div class="table-actions">
          <el-button
            type="success"
            @click="batchApprove"
            :disabled="selectedAppointments.length === 0"
          >
            批量通过
          </el-button>
          <el-button
            type="danger"
            @click="batchReject"
            :disabled="selectedAppointments.length === 0"
          >
            批量拒绝
          </el-button>
        </div>
      </div>

      <el-table
        :data="appointmentsList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        stripe
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="appointmentid" label="预约ID" width="80" />

        <el-table-column label="房源信息" min-width="280">
          <template #default="scope">
            <div class="house-info">
              <div
                class="house-title"
                @click="viewHouseDetail(scope.row.propertyid)"
              >
                {{ scope.row.houseTitle || '房源标题' }}
              </div>
              <div class="house-address">
                {{ scope.row.houseAddress || '房源地址' }}
              </div>
              <div class="house-price">
                ¥{{ scope.row.housePrice || '未知' }}万
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="用户信息" width="120">
          <template #default="scope">
            <div class="user-info">
              <div class="user-id">用户ID: {{ scope.row.buyerid }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="appointmenttime" label="预约时间" width="180">
          <template #default="scope">
            <div class="appointment-time">
              {{ formatDateTime(scope.row.appointmenttime) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="default">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                v-if="scope.row.status === '待审批'"
                type="success"
                size="small"
                @click="approveAppointment(scope.row.appointmentid)"
                :loading="scope.row.approving"
              >
                通过
              </el-button>

              <el-button
                v-if="scope.row.status === '待审批'"
                type="danger"
                size="small"
                @click="rejectAppointment(scope.row.appointmentid)"
                :loading="scope.row.rejecting"
              >
                拒绝
              </el-button>

              <el-button
                v-if="scope.row.status === '已预约'"
                type="warning"
                size="small"
                @click="cancelAppointment(scope.row.appointmentid)"
                :loading="scope.row.cancelling"
              >
                取消
              </el-button>

              <el-button
                type="info"
                size="small"
                @click="viewAppointmentDetail(scope.row)"
              >
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          第{{ currentPage }}页 共{{ Math.ceil(totalCount / pageSize)


          }}页，共{{ totalCount }}条
        </div>
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="totalCount"
          layout="prev, pager, next"
          @current-change="handleCurrentChange"
          :pager-count="5"
          size="small"
        />
      </div>
    </el-card>

    <!-- 预约详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="预约详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="appointment-detail" v-if="selectedAppointment">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预约ID">
            {{ selectedAppointment.appointmentid }}
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTagType(selectedAppointment.status)">
              {{ selectedAppointment.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="房源ID">
            {{ selectedAppointment.propertyid }}
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ selectedAppointment.buyerid }}
          </el-descriptions-item>
          <el-descriptions-item label="房源标题" :span="2">
            {{ selectedAppointment.houseTitle || '未知房源' }}
          </el-descriptions-item>
          <el-descriptions-item label="房源地址" :span="2">
            {{ selectedAppointment.houseAddress || '未知地址' }}
          </el-descriptions-item>
          <el-descriptions-item label="房源价格">
            ¥{{ selectedAppointment.housePrice || '未知' }}万
          </el-descriptions-item>
          <el-descriptions-item label="预约时间">
            {{ formatDateTime(selectedAppointment.appointmenttime) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="selectedAppointment && selectedAppointment.status === '待审批'"
            type="success"
            @click="approveAppointment(selectedAppointment.appointmentid)"
          >
            通过预约
          </el-button>
          <el-button
            v-if="selectedAppointment && selectedAppointment.status === '待审批'"
            type="danger"
            @click="rejectAppointment(selectedAppointment.appointmentid)"
          >
            拒绝预约
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar,
  Clock,
  SuccessFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import { viewingAppointmentsApi, propertiesApi } from '@/api/index'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const appointmentsList = ref([])
const selectedAppointments = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)

// 筛选相关
const statusFilter = ref('')
const dateRange = ref([])

// 对话框
const detailDialogVisible = ref(false)
const selectedAppointment = ref(null)

// 统计数据
const totalAppointments = computed(() => appointmentsList.value.length)
const pendingAppointments = computed(() =>
  appointmentsList.value.filter(a => a.status === '待审批').length
)
const approvedAppointments = computed(() =>
  appointmentsList.value.filter(a => a.status === '已预约').length
)
const cancelledAppointments = computed(() =>
  appointmentsList.value.filter(a => a.status === '已取消').length
)

// 加载预约列表
const loadAppointments = async () => {
  loading.value = true
  try {
    const response = await viewingAppointmentsApi.getAllAppointments()
    if (response.success) {
      // 获取房源信息来丰富预约数据
      const houseResponse = await propertiesApi.getAllProperties()
      if (houseResponse.success) {
        appointmentsList.value = response.data.map(appointment => {
          const house = houseResponse.data.find(h => h.propertyid === appointment.propertyid)
          return {
            ...appointment,
            houseTitle: house?.title || '未知房源',
            houseAddress: house?.address || '未知地址',
            housePrice: house?.price || 0,
            approving: false,
            rejecting: false,
            cancelling: false
          }
        })
      } else {
        appointmentsList.value = response.data.map(appointment => ({
          ...appointment,
          approving: false,
          rejecting: false,
          cancelling: false
        }))
      }
    } else {
      ElMessage.error(response.errorMsg || '获取预约列表失败')
    }
  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error('获取预约列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 刷新预约列表
const refreshAppointments = () => {
  loadAppointments()
}

// 审批预约
const approveAppointment = async (appointmentId) => {
  try {
    const appointment = appointmentsList.value.find(a => a.appointmentid === appointmentId)
    if (appointment) appointment.approving = true

    const response = await viewingAppointmentsApi.approveAppointment(appointmentId, '已预约')
    if (response.success) {
      ElMessage.success('预约审批通过')
      loadAppointments()
      if (detailDialogVisible.value) {
        detailDialogVisible.value = false
      }
    } else {
      ElMessage.error(response.errorMsg || '审批失败')
    }
  } catch (error) {
    console.error('审批预约失败:', error)
    ElMessage.error('审批失败，请稍后再试')
  } finally {
    const appointment = appointmentsList.value.find(a => a.appointmentid === appointmentId)
    if (appointment) appointment.approving = false
  }
}

// 拒绝预约
const rejectAppointment = async (appointmentId) => {
  try {
    await ElMessageBox.confirm('确定要拒绝这个预约吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const appointment = appointmentsList.value.find(a => a.appointmentid === appointmentId)
    if (appointment) appointment.rejecting = true

    const response = await viewingAppointmentsApi.approveAppointment(appointmentId, '已取消')
    if (response.success) {
      ElMessage.success('预约已拒绝')
      loadAppointments()
      if (detailDialogVisible.value) {
        detailDialogVisible.value = false
      }
    } else {
      ElMessage.error(response.errorMsg || '操作失败')
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('拒绝预约失败:', error)
    ElMessage.error('操作失败，请稍后再试')
  } finally {
    const appointment = appointmentsList.value.find(a => a.appointmentid === appointmentId)
    if (appointment) appointment.rejecting = false
  }
}

// 取消预约
const cancelAppointment = async (appointmentId) => {
  try {
    await ElMessageBox.confirm('确定要取消这个预约吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const appointment = appointmentsList.value.find(a => a.appointmentid === appointmentId)
    if (appointment) appointment.cancelling = true

    const response = await viewingAppointmentsApi.approveAppointment(appointmentId, '已取消')
    if (response.success) {
      ElMessage.success('预约已取消')
      loadAppointments()
    } else {
      ElMessage.error(response.errorMsg || '操作失败')
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('取消预约失败:', error)
    ElMessage.error('操作失败，请稍后再试')
  } finally {
    const appointment = appointmentsList.value.find(a => a.appointmentid === appointmentId)
    if (appointment) appointment.cancelling = false
  }
}

// 批量审批通过
const batchApprove = async () => {
  if (selectedAppointments.value.length === 0) return

  try {
    await ElMessageBox.confirm(`确定要通过选中的 ${selectedAppointments.value.length} 个预约吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })

    const promises = selectedAppointments.value.map(appointment =>
      viewingAppointmentsApi.approveAppointment(appointment.appointmentid, '已预约')
    )

    await Promise.all(promises)
    ElMessage.success('批量审批完成')
    loadAppointments()
  } catch (error) {
    if (error === 'cancel') return
    console.error('批量审批失败:', error)
    ElMessage.error('批量审批失败，请稍后再试')
  }
}

// 批量拒绝
const batchReject = async () => {
  if (selectedAppointments.value.length === 0) return

  try {
    await ElMessageBox.confirm(`确定要拒绝选中的 ${selectedAppointments.value.length} 个预约吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const promises = selectedAppointments.value.map(appointment =>
      viewingAppointmentsApi.approveAppointment(appointment.appointmentid, '已取消')
    )

    await Promise.all(promises)
    ElMessage.success('批量拒绝完成')
    loadAppointments()
  } catch (error) {
    if (error === 'cancel') return
    console.error('批量拒绝失败:', error)
    ElMessage.error('批量拒绝失败，请稍后再试')
  }
}

// 查看预约详情
const viewAppointmentDetail = (appointment) => {
  selectedAppointment.value = appointment
  detailDialogVisible.value = true
}

// 查看房源详情
const viewHouseDetail = (propertyId) => {
  router.push(`/house/detail/${propertyId}`)
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedAppointments.value = selection.filter(item => item.status === '待审批')
}

// 应用筛选
const applyFilters = () => {
  currentPage.value = 1
}

// 清除筛选
const clearFilters = () => {
  statusFilter.value = ''
  dateRange.value = []
  currentPage.value = 1
}

// 分页处理
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '未知时间'
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return '格式错误'
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case '待审批':
      return 'warning'
    case '已预约':
      return 'success'
    case '已取消':
      return 'danger'
    default:
      return 'info'
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadAppointments()
})
</script>

<style lang="scss">
.admin-appointments-container {

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    background: white;
    border-radius: 8px;

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .stat-card {
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &.pending {
        border-left: 4px solid #e6a23c;
      }

      &.approved {
        border-left: 4px solid #67c23a;
      }

      &.cancelled {
        border-left: 4px solid #f56c6c;
      }

      .el-card__body {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
      }

      .stat-content {
        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #303133;
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }

      .stat-icon {
        font-size: 40px;
        opacity: 0.8;

        &.total {
          color: #409eff;
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;

    .filter-row {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 8px;

        label {
          font-weight: 500;
          color: #606266;
          white-space: nowrap;
        }
      }
    }
  }

  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e4e7ed;

      h3 {
        margin: 0;
        color: #303133;
      }

      .table-actions {
        display: flex;
        gap: 12px;
      }
    }

    .house-info {
      .house-title {
        font-size: 14px;
        font-weight: 600;
        color: #409eff;
        cursor: pointer;
        margin-bottom: 4px;
        line-height: 1.4;

        &:hover {
          text-decoration: underline;
        }
      }

      .house-address {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
        line-height: 1.3;
      }

      .house-price {
        font-size: 14px;
        color: #f56c6c;
        font-weight: 600;
      }
    }

    .user-info {
      .user-id {
        font-size: 12px;
        color: #606266;
      }
    }

    .appointment-time {
      font-size: 12px;
      color: #606266;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
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

  .appointment-detail {
    .el-descriptions {
      margin-top: 20px;
    }
  }

  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .admin-appointments-container {
    padding: 10px;

    .page-header {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }

    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .filter-row {
      flex-direction: column;
      align-items: flex-start;

      .filter-item {
        width: 100%;
        justify-content: space-between;
      }
    }

    .table-header {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }
  }
}
</style>
