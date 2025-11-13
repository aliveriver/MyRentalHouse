<template>
  <div class="bill-pay-page">
    <el-card class="pay-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h2>账单支付</h2>
        </div>
      </template>

      <div class="pay-content" v-loading="loading">
        <!-- 账单信息 -->
        <el-card shadow="never" class="bill-info-card" v-if="bill">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>账单信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="账单编号">
              {{ bill.billid }}
            </el-descriptions-item>
            <el-descriptions-item label="合同编号">
              {{ bill.contractid }}
            </el-descriptions-item>
            <el-descriptions-item label="房源价格" :span="2">
              <span class="property-price">¥{{ formatPrice(bill.propertyprice) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="服务费（1%）" :span="2">
              <span class="service-fee">¥{{ formatPrice(bill.servicefee) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="应付总额" :span="2">
              <span class="total-amount">¥{{ formatPrice(bill.servicefee) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 支付方式 -->
        <el-card shadow="never" class="payment-method-card">
          <template #header>
            <div class="card-header">
              <el-icon><CreditCard /></el-icon>
              <span>选择支付方式</span>
            </div>
          </template>
          <el-radio-group v-model="paymentMethod" class="payment-methods">
            <el-radio value="支付宝" size="large">
              <div class="payment-option">
                <el-icon :size="30"><CreditCard /></el-icon>
                <span>支付宝</span>
              </div>
            </el-radio>
            <el-radio value="微信支付" size="large">
              <div class="payment-option">
                <el-icon :size="30"><CreditCard /></el-icon>
                <span>微信支付</span>
              </div>
            </el-radio>
            <el-radio value="银行卡" size="large">
              <div class="payment-option">
                <el-icon :size="30"><CreditCard /></el-icon>
                <span>银行卡</span>
              </div>
            </el-radio>
          </el-radio-group>
        </el-card>

        <!-- 支付按钮 -->
        <div class="payment-actions">
          <el-button @click="handleCancel" size="large">取消支付</el-button>
          <el-button
            type="primary"
            @click="handlePay"
            :loading="processing"
            size="large"
            :disabled="!paymentMethod || !bill"
          >
            <el-icon><Money /></el-icon>
            确认支付 ¥{{ bill ? formatPrice(bill.servicefee) : '0.00' }}
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, CreditCard, Money } from '@element-plus/icons-vue'
import { billsApi } from '@/api/index'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const processing = ref(false)
const paymentMethod = ref('')
const bill = ref(null)

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 获取支付方式名称
const getPaymentMethodName = (method) => {
  const methods = {
    '支付宝': '支付宝',
    '微信支付': '微信支付',
    '银行卡': '银行卡'
  }
  return methods[method] || method
}

// 获取账单详情
const getBillDetail = async () => {
  const billId = route.query.billId
  if (!billId) {
    ElMessage.warning('账单ID不能为空')
    router.back()
    return
  }

  try {
    loading.value = true
    const response = await billsApi.getBillById(billId)
    if (response && response.success) {
      bill.value = response.data
      // 检查账单状态
      if (bill.value.billstatus !== '待支付') {
        ElMessage.warning('该账单不是待支付状态，无法支付')
        router.back()
      }
    } else {
      ElMessage.error(response?.errorMsg || '获取账单详情失败')
      router.back()
    }
  } catch (error) {
    console.error('获取账单详情失败:', error)
    ElMessage.error('获取账单详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 处理支付
const handlePay = async () => {
  if (!paymentMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  if (!bill.value) {
    ElMessage.error('账单信息不存在')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认使用${getPaymentMethodName(paymentMethod.value)}支付 ¥${formatPrice(bill.value.servicefee)}元吗？`,
      '确认支付',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    processing.value = true

    // 生成支付交易号（模拟）
    const paymentTransactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // 调用支付接口
    const response = await billsApi.payBill(bill.value.billid, {
      paymentMethod: paymentMethod.value,
      paymentTransactionId: paymentTransactionId
    })

    if (response && response.success) {
      ElMessage.success('支付成功！')
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push('/bills')
      }, 1500)
    } else {
      ElMessage.error(response?.errorMsg || '支付失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('支付失败:', error)
      ElMessage.error('支付失败')
    }
  } finally {
    processing.value = false
  }
}

// 取消支付
const handleCancel = () => {
  router.back()
}

// 页面挂载时获取账单详情
onMounted(() => {
  getBillDetail()
})
</script>

<style lang="scss" scoped>
.bill-pay-page {
  padding: 20px;

  .pay-card {
    max-width: 800px;
    margin: 0 auto;

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;

      .el-icon {
        color: #409eff;
      }
    }

    .pay-content {
      .bill-info-card {
        margin-bottom: 20px;

        .property-price {
          font-size: 16px;
          font-weight: 600;
          color: #606266;
        }

        .service-fee {
          font-size: 18px;
          font-weight: 600;
          color: #409eff;
        }

        .total-amount {
          font-size: 24px;
          font-weight: 700;
          color: #f56c6c;
        }
      }

      .payment-method-card {
        margin-bottom: 30px;

        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 15px;

          .payment-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
          }
        }
      }

      .payment-actions {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 30px;
      }
    }
  }
}
</style>

