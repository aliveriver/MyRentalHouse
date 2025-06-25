<template>
  <div class="dashboard">
    <!-- 头部信息栏 -->
    <div class="header-info">
      <el-alert
        title="欢迎使用后台管理系统（V1.2）"
        description="您本次登录时间为xxxx年x月x日xx时xx分，登录IP:192.168.1.x"
        show-icon
        :closable="false"
        type="success"
      />
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#1890ff">
                <User />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">34,522</div>
              <div class="stat-label">商城用户(个)</div>
              <div class="stat-date">更新日期: 2024-07-01</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#1890ff">
                <Document />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">1,440</div>
              <div class="stat-label">分销记录(笔)</div>
              <div class="stat-date">更新日期: 2024-07-01</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#1890ff">
                <Folder />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">3,665</div>
              <div class="stat-label">商城订单(份)</div>
              <div class="stat-date">更新日期: 2024-07-01</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#1890ff">
                <Money />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">¥ 101,440.00</div>
              <div class="stat-label">交易金额(累计)</div>
              <div class="stat-date">更新日期: 2024-07-01</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据统计区域 -->
    <el-row :gutter="20" class="data-section">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Edit /></el-icon>
              <span>订单统计信息</span>
            </div>
          </template>
          <div class="data-list">
            <div class="data-item">
              <span class="data-label">未处理订单</span>
              <span class="data-value">0 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">待发货订单</span>
              <span class="data-value">10 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">待确认订单</span>
              <span class="data-value">13 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">已成交订单数</span>
              <span class="data-value">24 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">交易失败</span>
              <span class="data-value">30 份</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Shop /></el-icon>
              <span>房源统计信息</span>
            </div>
          </template>
          <div class="data-list">
            <div class="data-item">
              <span class="data-label">商品总数</span>
              <span class="data-value">4,760 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">回收站商品</span>
              <span class="data-value">56 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">上架商品</span>
              <span class="data-value">4,678 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">下架商品</span>
              <span class="data-value">26 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">商品评论</span>
              <span class="data-value">6,785 条</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><UserFilled /></el-icon>
              <span>会员登录统计信息</span>
            </div>
          </template>
          <div class="data-list">
            <div class="data-item">
              <span class="data-label">注册会员登录</span>
              <span class="data-value">3,665 次</span>
            </div>
            <div class="data-item">
              <span class="data-label">微信登录</span>
              <span class="data-value">9,198 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">支付宝登录</span>
              <span class="data-value">6,678 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">QQ登录</span>
              <span class="data-value">4,326 份</span>
            </div>
            <div class="data-item">
              <span class="data-label">新浪微博登录</span>
              <span class="data-value">1,785 份</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><UserFilled /></el-icon>
              <span>最新消息</span>
            </div>
          </template>
          <div class="data-list">
            <div class="data-item">
              <span class="data-label">新功能上线</span>
              <span class="data-value">智能推荐系统全面升级！</span>
            </div>
            <div class="data-item">
              <span class="data-label">版本更新通知</span>
              <span class="data-value">全性和稳定性提升</span>
            </div>
            <div class="data-item">
              <span class="data-label">活动策划利器</span>
              <span class="data-value">全新营销活动模板上线</span>
            </div>
            <div class="data-item">
              <span class="data-label">数据分析再升级</span>
              <span class="data-value">新BI报表功能强势来</span>
            </div>
            <div class="data-item">
              <span class="data-label">用户反馈响应</span>
              <span class="data-value">新一轮功能优化即将上线</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表和最新消息区域 -->
    <el-row :gutter="20" class="bottom-section">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>销售目标月比统计</span>
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

const chartRef = ref(null)

const initChart = () => {
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
      data: ['01', '03', '05', '07', '09', '11', '13'],
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
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '本月',
        type: 'line',
        data: [15, 23, 32, 20, 27, 33, 45],
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
        data: [20, 32, 27, 34, 32, 28, 36],
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

onMounted(() => {
  initChart()
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

      .el-icon {
        margin-right: 8px;
        color: #1890ff;
      }
    }

    .chart-container {
      height: 300px;
      width: 100%;
    }

    .news-list {
      .news-item {
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .news-text {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }
      }
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
}
</style>
