<template>
  <div class="dashboard">
    <!-- 头部信息栏 -->
    <div class="header-info">
      <el-alert
        title="欢迎使用二手房管理平台"
        :description="`您本次登录时间为${formatCurrentTime()}，登录IP:${loginIP}`"
        show-icon
        :closable="false"
        type="success"
      />
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stats-cards" v-loading="statsLoading">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#1890ff">
                <User />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ statsData.totalUsers }}</div>
              <div class="stat-label">平台用户(个)</div>
              <div class="stat-date">
                更新日期: {{ formatDate(new Date()) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#52c41a">
                <House />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ statsData.totalProperties }}</div>
              <div class="stat-label">房源数量(套)</div>
              <div class="stat-date">
                更新日期: {{ formatDate(new Date()) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#fa8c16">
                <Calendar />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ statsData.totalAppointments }}</div>
              <div class="stat-label">预约记录(笔)</div>
              <div class="stat-date">
                更新日期: {{ formatDate(new Date()) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#722ed1">
                <Document />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ statsData.totalContracts }}</div>
              <div class="stat-label">合同数量(份)</div>
              <div class="stat-date">
                更新日期: {{ formatDate(new Date()) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据统计区域 -->
    <el-row :gutter="20" class="data-section" v-loading="detailStatsLoading">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Calendar /></el-icon>
              <span>预约统计信息</span>
            </div>
          </template>
          <div class="data-list">
            <div class="data-item">
              <span class="data-label">待审核预约</span>
              <span class="data-value">{{ appointmentStats.pending }} 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">已通过预约</span>
              <span class="data-value">{{ appointmentStats.approved }} 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">已拒绝预约</span>
              <span class="data-value">{{ appointmentStats.rejected }} 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">已完成预约</span>
              <span class="data-value"
                >{{ appointmentStats.completed }} 份</span
              >
            </div>
            <div class="data-item">
              <span class="data-label">本月新增</span>
              <span class="data-value"
                >{{ appointmentStats.thisMonth }} 份</span
              >
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><House /></el-icon>
              <span>房源统计信息</span>
            </div>
          </template>
          <div class="data-list">
            <div class="data-item">
              <span class="data-label">房源总数</span>
              <span class="data-value">{{ propertyStats.total }} 套</span>
            </div>
            <div class="data-item">
              <span class="data-label">在售房源</span>
              <span class="data-value">{{ propertyStats.available }} 套</span>
            </div>
            <div class="data-item">
              <span class="data-label">已售房源</span>
              <span class="data-value">{{ propertyStats.sold }} 套</span>
            </div>
            <div class="data-item">
              <span class="data-label">下架房源</span>
              <span class="data-value">{{ propertyStats.inactive }} 套</span>
            </div>
            <div class="data-item">
              <span class="data-label">本月新增</span>
              <span class="data-value">{{ propertyStats.thisMonth }} 套</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>合同统计信息</span>
            </div>
          </template>
          <div class="data-list">
            <div class="data-item">
              <span class="data-label">合同总数</span>
              <span class="data-value">{{ contractStats.total }} 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">已签署</span>
              <span class="data-value">{{ contractStats.signed }} 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">执行中</span>
              <span class="data-value">{{ contractStats.active }} 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">已完成</span>
              <span class="data-value">{{ contractStats.completed }} 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">本月新增</span>
              <span class="data-value">{{ contractStats.thisMonth }} 份</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Star /></el-icon>
              <span>收藏统计信息</span>
            </div>
          </template>
          <div class="data-list">
            <div class="data-item">
              <span class="data-label">总收藏数</span>
              <span class="data-value">{{ favoriteStats.total }} 次</span>
            </div>
            <div class="data-item">
              <span class="data-label">今日新增</span>
              <span class="data-value">{{ favoriteStats.today }} 次</span>
            </div>
            <div class="data-item">
              <span class="data-label">本周新增</span>
              <span class="data-value">{{ favoriteStats.thisWeek }} 次</span>
            </div>
            <div class="data-item">
              <span class="data-label">本月新增</span>
              <span class="data-value">{{ favoriteStats.thisMonth }} 次</span>
            </div>
            <div class="data-item">
              <span class="data-label">热门房源</span>
              <span
                class="data-value"
                >{{ favoriteStats.hotProperty || '暂无' }}</span
              >
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="bottom-section">
      <el-col :span="24">
        <el-card v-loading="chartLoading">
          <template #header>
            <div class="card-header">
              <span>平台活跃度月比统计</span>
              <div class="chart-legend">
                <span class="legend-item">
                  <span
                    class="legend-dot"
                    style="background-color: #1890ff;"
                  ></span>
                  本月
                </span>
                <span class="legend-item">
                  <span
                    class="legend-dot"
                    style="background-color: #52c41a;"
                  ></span>
                  上月
                </span>
              </div>
            </div>
          </template>
          <div ref="chartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import {
  User,
  House,
  Calendar,
  Document,
  Star
} from '@element-plus/icons-vue'
import {
  dashboardApi,
  propertiesApi,
  viewingAppointmentsApi,
  contractsApi,
  favoritesApi,
  usersApi
} from '@/api/index'
import { ElMessage } from 'element-plus'

const chartRef = ref(null)

// 加载状态
const statsLoading = ref(false)
const detailStatsLoading = ref(false)
const chartLoading = ref(false)

// 登录信息
const loginIP = ref('192.168.1.100')

// 总体统计数据
const statsData = ref({
  totalUsers: 0,
  totalProperties: 0,
  totalAppointments: 0,
  totalContracts: 0
})

// 详细统计数据
const appointmentStats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  completed: 0,
  thisMonth: 0
})

const propertyStats = ref({
  total: 0,
  available: 0,
  sold: 0,
  inactive: 0,
  thisMonth: 0
})

const contractStats = ref({
  total: 0,
  signed: 0,
  active: 0,
  completed: 0,
  thisMonth: 0
})

const favoriteStats = ref({
  total: 0,
  today: 0,
  thisWeek: 0,
  thisMonth: 0,
  hotProperty: ''
})

// 月度统计数据
const monthlyData = ref({
  currentMonth: [],
  lastMonth: [],
  days: []
})

// 格式化当前时间
const formatCurrentTime = () => {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期
const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取总体统计数据
const loadStatsData = async () => {
  statsLoading.value = true
  try {
    // 获取用户总数
    const usersResponse = await usersApi.getAllUsers()
    if (usersResponse.success) {
      statsData.value.totalUsers = usersResponse.data.length
    }

    // 获取房源总数
    const propertiesResponse = await propertiesApi.getAllProperties()
    if (propertiesResponse.success) {
      statsData.value.totalProperties = propertiesResponse.data.length
    }

    // 获取预约总数
    const appointmentsResponse = await viewingAppointmentsApi.getAllAppointments()
    if (appointmentsResponse.success) {
      statsData.value.totalAppointments = appointmentsResponse.data.length
    }

    // 获取合同总数
    const contractsResponse = await contractsApi.getAllContracts()
    if (contractsResponse.success) {
      statsData.value.totalContracts = contractsResponse.data.length
    }

  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    statsLoading.value = false
  }
}

// 获取详细统计数据
const loadDetailStats = async () => {
  detailStatsLoading.value = true
  try {
    // 预约统计
    const appointmentsResponse = await viewingAppointmentsApi.getAllAppointments()
    if (appointmentsResponse.success) {
      const appointments = appointmentsResponse.data
      appointmentStats.value = {
        pending: appointments.filter(a => a.status === 'PENDING').length,
        approved: appointments.filter(a => a.status === 'APPROVED').length,
        rejected: appointments.filter(a => a.status === 'REJECTED').length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        thisMonth: appointments.filter(a => {
          const appointmentDate = new Date(a.appointmenttime)
          const now = new Date()
          return appointmentDate.getFullYear() === now.getFullYear() &&
                 appointmentDate.getMonth() === now.getMonth()
        }).length
      }
    }

    // 房源统计（模拟数据，实际需要后端支持状态字段）
    const propertiesResponse = await propertiesApi.getAllProperties()
    if (propertiesResponse.success) {
      const properties = propertiesResponse.data
      propertyStats.value = {
        total: properties.length,
        available: Math.floor(properties.length * 0.8), // 假设80%在售
        sold: Math.floor(properties.length * 0.15), // 假设15%已售
        inactive: Math.floor(properties.length * 0.05), // 假设5%下架
        thisMonth: Math.floor(properties.length * 0.1) // 假设10%是本月新增
      }
    }

    // 合同统计（模拟数据，实际需要后端支持状态字段）
    const contractsResponse = await contractsApi.getAllContracts()
    if (contractsResponse.success) {
      const contracts = contractsResponse.data
      contractStats.value = {
        total: contracts.length,
        signed: Math.floor(contracts.length * 0.6),
        active: Math.floor(contracts.length * 0.3),
        completed: Math.floor(contracts.length * 0.1),
        thisMonth: Math.floor(contracts.length * 0.2)
      }
    }

    // 收藏统计（模拟数据）
    favoriteStats.value = {
      total: Math.floor(Math.random() * 1000) + 500,
      today: Math.floor(Math.random() * 20) + 5,
      thisWeek: Math.floor(Math.random() * 100) + 30,
      thisMonth: Math.floor(Math.random() * 300) + 100,
      hotProperty: '朝阳门精装修三居室'
    }

  } catch (error) {
    console.error('加载详细统计数据失败:', error)
    ElMessage.error('加载详细统计数据失败')
  } finally {
    detailStatsLoading.value = false
  }
}

// 获取月度统计数据（模拟数据）
const loadMonthlyData = () => {
  // 生成过去30天的数据
  const days = []
  const currentMonth = []
  const lastMonth = []

  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.getDate().toString().padStart(2, '0'))

    // 模拟当月数据（预约数量）
    currentMonth.push(Math.floor(Math.random() * 30) + 10)
    // 模拟上月数据
    lastMonth.push(Math.floor(Math.random() * 25) + 8)
  }

  monthlyData.value = {
    days: days.slice(-7), // 只显示最近7天
    currentMonth: currentMonth.slice(-7),
    lastMonth: lastMonth.slice(-7)
  }
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartLoading.value = true

  const chart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: monthlyData.value.days,
      axisLine: {
        lineStyle: {
          color: '#e6e6e6'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 50,
      interval: 10,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      },
      axisLabel: {
        color: '#666',
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '本月',
        type: 'line',
        data: monthlyData.value.currentMonth,
        smooth: true,
        lineStyle: {
          color: '#1890ff',
          width: 3
        },
        itemStyle: {
          color: '#1890ff'
        },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '上月',
        type: 'line',
        data: monthlyData.value.lastMonth,
        smooth: true,
        lineStyle: {
          color: '#52c41a',
          width: 3
        },
        itemStyle: {
          color: '#52c41a'
        },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  }

  chart.setOption(option)
  chartLoading.value = false

  // 响应式处理
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

onMounted(async () => {
  await loadStatsData()
  await loadDetailStats()
  loadMonthlyData()

  // 确保DOM更新后再初始化图表
  setTimeout(() => {
    initChart()
  }, 100)
})
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100vh;

  .header-info {
    margin-bottom: 20px;
  }

  .stats-cards {
    margin: 20px 0;

    .stat-card {
      height: 120px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      :deep(.el-card__body) {
        padding: 0;
        height: 100%;
      }

      .stat-content {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 20px;

        .stat-icon {
          margin-right: 15px;
        }

        .stat-info {
          flex: 1;

          .stat-number {
            font-size: 24px;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
          }

          .stat-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 3px;
          }

          .stat-date {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }

  .data-section {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #333;

      .el-icon {
        margin-right: 8px;
        color: #1890ff;
      }
    }

    .data-list {
      .data-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .data-label {
          color: #666;
          font-size: 14px;
        }

        .data-value {
          color: #333;
          font-weight: 500;
          font-size: 14px;
        }
      }
    }
  }

  .bottom-section {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: #333;

      .chart-legend {
        display: flex;
        gap: 20px;

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #666;

          .legend-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 6px;
          }
        }
      }
    }

    .chart-container {
      height: 300px;
      width: 100%;
    }
  }

  :deep(.el-card) {
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .el-card__header {
      border-bottom: 1px solid #f0f0f0;
      background-color: #fafafa;
    }
  }

  // 加载状态样式
  :deep(.el-loading-mask) {
    background-color: rgba(255, 255, 255, 0.8);
  }
}
</style>
