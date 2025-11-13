<template>
  <div class="dashboard">
    <!-- 卖家不能访问数据概览 -->
    <div v-if="isSeller" class="no-access">
      <el-result
        icon="warning"
        title="无访问权限"
        sub-title="卖家无法访问数据概览页面，请使用其他功能"
      >
        <template #extra>
          <el-button type="primary" @click="goToHouseList">前往房源列表</el-button>
        </template>
      </el-result>
    </div>

    <!-- 管理员可以看到数据概览 -->
    <template v-else>
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
              <span class="data-label">已取消预约</span>
              <span class="data-value">{{ appointmentStats.cancelled }} 份</span>
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
              <span class="data-label">待审核</span>
              <span class="data-value">{{ contractStats.pending }} 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">已取消</span>
              <span class="data-value">{{ contractStats.cancelled }} 份</span>
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
              <el-icon><User /></el-icon>
              <span>活跃用户统计</span>
            </div>
          </template>
          <div class="data-list">
            <div class="data-item">
              <span class="data-label">总活跃用户</span>
              <span class="data-value">{{ activeUserStats.totalActiveUsers }} 人</span>
            </div>
            <div class="data-item">
              <span class="data-label">今日活跃</span>
              <span class="data-value">{{ activeUserStats.todayActiveUsers }} 人</span>
            </div>
            <div class="data-item">
              <span class="data-label">本周活跃</span>
              <span class="data-value">{{ activeUserStats.thisWeekActiveUsers }} 人</span>
            </div>
            <div class="data-item">
              <span class="data-label">本月活跃</span>
              <span class="data-value">{{ activeUserStats.thisMonthActiveUsers }} 人</span>
            </div>
            <div class="data-item">
              <span class="data-label">说明</span>
              <span class="data-value" style="font-size: 12px; color: #999;">基于用户操作统计</span>
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
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import {
  User,
  House,
  Calendar,
  Document,
  Star
} from '@element-plus/icons-vue'
import { dashboardApi } from '@/api/index'
import { ElMessage } from 'element-plus'
import useStore from '@/store/index'
import { useRouter } from 'vue-router'

const chartRef = ref(null)
const store = useStore()
const router = useRouter()

// 获取用户角色
const userRole = computed(() => store.userInfo?.role || '买家')

// 检查是否为管理员
const isAdmin = computed(() => userRole.value === '管理员')

// 检查是否为卖家
const isSeller = computed(() => userRole.value === '卖家')

// 加载状态
const statsLoading = ref(false)
const detailStatsLoading = ref(false)
const chartLoading = ref(false)

// 登录信息
const loginIP = ref('获取中...')

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
  cancelled: 0,
  thisMonth: 0
})

const propertyStats = ref({
  total: 0,
  available: 0,
  sold: 0,
  inactive: 0,
  pending: 0,
  rejected: 0,
  thisMonth: 0
})

const contractStats = ref({
  total: 0,
  pending: 0,
  signed: 0,
  cancelled: 0,
  thisMonth: 0
})

const favoriteStats = ref({
  total: 0,
  today: 0,
  thisWeek: 0,
  thisMonth: 0,
  hotProperty: ''
})

const activeUserStats = ref({
  totalActiveUsers: 0,
  todayActiveUsers: 0,
  thisWeekActiveUsers: 0,
  thisMonthActiveUsers: 0
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

// 加载所有统计数据
const loadAllStats = async () => {
  statsLoading.value = true
  detailStatsLoading.value = true
  chartLoading.value = true
  
  try {
    // 仅管理员可访问dashboard API
    if (userRole.value !== '管理员') {
      ElMessage.warning('仅管理员可访问数据概览')
      return
    }

    // 调用dashboard API获取所有统计数据
    const response = await dashboardApi.getDashboardStats()
    
    if (response.success && response.data) {
      const data = response.data
      
      // 1. 总体统计数据
      statsData.value = {
        totalUsers: data.totalUsers || 0,
        totalProperties: data.totalProperties || 0,
        totalAppointments: data.totalAppointments || 0,
        totalContracts: data.totalContracts || 0
      }

      // 2. 房源统计
      if (data.propertyStats) {
        propertyStats.value = {
          total: data.propertyStats.total || 0,
          available: data.propertyStats.available || 0,
          sold: data.propertyStats.sold || 0,
          inactive: data.propertyStats.inactive || 0,
          pending: data.propertyStats.pending || 0,
          rejected: data.propertyStats.rejected || 0,
          thisMonth: data.propertyStats.thisMonth || 0
        }
      }

      // 3. 预约统计
      if (data.appointmentStats) {
        appointmentStats.value = {
          pending: data.appointmentStats.pending || 0,
          approved: data.appointmentStats.approved || 0,
          cancelled: data.appointmentStats.cancelled || 0,
          thisMonth: data.appointmentStats.thisMonth || 0
        }
      }

      // 4. 合同统计
      if (data.contractStats) {
        contractStats.value = {
          total: data.contractStats.total || 0,
          pending: data.contractStats.pending || 0,
          signed: data.contractStats.signed || 0,
          cancelled: data.contractStats.cancelled || 0,
          thisMonth: data.contractStats.thisMonth || 0
        }
      }

      // 5. 收藏统计
      if (data.favoriteStats) {
        favoriteStats.value = {
          total: data.favoriteStats.total || 0,
          today: data.favoriteStats.today || 0,
          thisWeek: data.favoriteStats.thisWeek || 0,
          thisMonth: data.favoriteStats.thisMonth || 0,
          hotProperty: data.favoriteStats.hotProperty || '暂无'
        }
      }

      // 6. 活跃用户统计
      if (data.activeUserStats) {
        activeUserStats.value = {
          totalActiveUsers: data.activeUserStats.totalActiveUsers || 0,
          todayActiveUsers: data.activeUserStats.todayActiveUsers || 0,
          thisWeekActiveUsers: data.activeUserStats.thisWeekActiveUsers || 0,
          thisMonthActiveUsers: data.activeUserStats.thisMonthActiveUsers || 0
        }
      }

      // 7. 月度统计数据
      if (data.monthlyStats) {
        monthlyData.value = {
          days: data.monthlyStats.days || [],
          currentMonth: data.monthlyStats.currentMonth || [],
          lastMonth: data.monthlyStats.lastMonth || []
        }
      }

      // 8. 客户端IP地址
      if (data.clientIP) {
        loginIP.value = data.clientIP
      }

      // 加载完成后初始化图表
      setTimeout(() => {
        initChart()
      }, 100)
    } else {
      ElMessage.error(response.errorMsg || '获取统计数据失败')
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败: ' + (error.message || '未知错误'))
  } finally {
    statsLoading.value = false
    detailStatsLoading.value = false
    chartLoading.value = false
  }
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  const chart = echarts.init(chartRef.value)

  // 计算Y轴最大值
  const currentMonthData = monthlyData.value.currentMonth || []
  const lastMonthData = monthlyData.value.lastMonth || []
  const allData = [...currentMonthData, ...lastMonthData]
  const maxValue = allData.length > 0 ? Math.max(...allData, 10) : 10
  const yMax = Math.ceil(maxValue / 10) * 10 || 50

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
      data: monthlyData.value.days || [],
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
      max: yMax,
      interval: Math.ceil(yMax / 5),
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
        data: monthlyData.value.currentMonth || [],
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
        data: monthlyData.value.lastMonth || [],
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

  // 响应式处理
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 跳转到房源列表
const goToHouseList = () => {
  router.push('/house/list')
}

onMounted(async () => {
  // 如果是卖家，不加载数据概览
  if (isSeller.value) {
    return
  }
  
  // 加载所有统计数据
  await loadAllStats()
})
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100vh;

  .no-access {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }

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
