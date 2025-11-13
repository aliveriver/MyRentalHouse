<template>
  <div class="payment-page">
    <el-card class="payment-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h2>支付页面</h2>
        </div>
      </template>

      <div class="payment-content" v-loading="processing">
        <!-- 订单信息 -->
        <el-card shadow="never" class="order-info-card">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>订单信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="合同类型">
              {{ contractType === 'apply' ? '申请合同' : '签订合同' }}
            </el-descriptions-item>
            <el-descriptions-item label="合同ID">
              {{ contractId || '待生成' }}
            </el-descriptions-item>
            <el-descriptions-item label="房源价格">
              ¥{{ propertyPrice }}元
            </el-descriptions-item>
            <el-descriptions-item label="服务费（0.5%）">
              ¥{{ serviceFee }}元
            </el-descriptions-item>
            <el-descriptions-item label="应付总额" :span="2">
              <span class="total-amount">¥{{ totalAmount }}元</span>
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
            <el-radio value="alipay" size="large">
              <div class="payment-option">
                <el-icon :size="30"><CreditCard /></el-icon>
                <span>支付宝</span>
              </div>
            </el-radio>
            <el-radio value="wechat" size="large">
              <div class="payment-option">
                <el-icon :size="30"><CreditCard /></el-icon>
                <span>微信支付</span>
              </div>
            </el-radio>
            <el-radio value="bank" size="large">
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
          >
            <el-icon><Money /></el-icon>
            确认支付 ¥{{ totalAmount }}元
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
import { contractsApi } from '@/api/index'
import { billsApi } from '@/api/bills'

const route = useRoute()
const router = useRouter()

const processing = ref(false)
const paymentMethod = ref('alipay')

// 从路由参数获取支付信息
const contractId = ref(route.query.contractId || null)
const contractType = ref(route.query.contractType || 'apply')
const propertyPrice = ref(parseFloat(route.query.propertyPrice || 0))
const serviceFee = ref(parseFloat(route.query.serviceFee || 500))
// 计算总金额（仅服务费，不包含房价）
// 注意：申请合同时只支付服务费，不支付房价
const totalAmount = computed(() => {
  // 如果是申请合同或签订合同，只支付服务费
  if (contractType.value === 'apply' || contractType.value === 'sign') {
    return serviceFee.value
  }
  // 默认只支付服务费
  return serviceFee.value
})

onMounted(() => {
  // 检查必要参数
  if (!contractType.value || !propertyPrice.value) {
    ElMessage.warning('支付参数不完整，正在返回...')
    setTimeout(() => {
      router.back()
    }, 2000)
  }
})

// 处理支付
const handlePay = async () => {
  if (!paymentMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认使用${getPaymentMethodName(paymentMethod.value)}支付 ¥${totalAmount.value}元吗？`,
      '确认支付',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    processing.value = true

    // 模拟支付过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    let finalContractId = contractId.value

    // 生成支付交易号（模拟）
    const paymentTransactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const paymentMethodName = getPaymentMethodName(paymentMethod.value)

    // 根据合同类型执行相应操作
    if (contractType.value === 'apply') {
      // 申请合同：支付成功后提交合同申请，并传入支付信息
      const pendingContractDataStr = sessionStorage.getItem('pendingContractData')
      if (pendingContractDataStr) {
        try {
          const contractData = JSON.parse(pendingContractDataStr)
          // 添加支付信息：标记已支付服务费，并传入支付方式和交易号
          contractData.paidServiceFee = true
          contractData.paymentMethod = paymentMethodName
          contractData.paymentTransactionId = paymentTransactionId
          
          const response = await contractsApi.applyContract(contractData)
          if (response.success) {
            // 从响应中获取合同ID（如果有）
            if (response.data && response.data.contractid) {
              finalContractId = response.data.contractid
            }
            sessionStorage.removeItem('pendingContractData')
          } else {
            ElMessage.error(response.errorMsg || '合同申请提交失败')
            return
          }
        } catch (error) {
          console.error('提交合同申请失败:', error)
          ElMessage.error('合同申请提交失败，请稍后再试')
          return
        }
      }
    } else if (contractType.value === 'sign') {
      // 签订合同：调用签订接口
      if (contractId.value) {
        const response = await contractsApi.signContract(parseInt(contractId.value))
        if (!response.success) {
          ElMessage.error(response.errorMsg || '合同签订失败')
          return
        }
      }
      
      // 签订合同时，如果有账单需要支付，更新账单状态
      try {
        // 获取买家的待支付账单列表
        const billsResponse = await billsApi.getPendingBillsByBuyer()
        if (billsResponse && billsResponse.success && billsResponse.data) {
          let bill = null
          
          if (finalContractId) {
            // 如果有合同ID，通过合同ID查找账单
            bill = billsResponse.data.find(b => 
              b.contractid === parseInt(finalContractId) && 
              b.billstatus === '待支付'
            )
          }
          
          // 如果通过合同ID找不到，尝试找最新的待支付账单
          if (!bill && billsResponse.data.length > 0) {
            // 按创建时间排序，取最新的
            const sortedBills = [...billsResponse.data].sort((a, b) => {
              const timeA = new Date(a.createdate || a.createdat).getTime()
              const timeB = new Date(b.createdate || b.createdat).getTime()
              return timeB - timeA
            })
            bill = sortedBills[0]
          }
          
          if (bill) {
            // 调用账单支付API
            const payBillResponse = await billsApi.payBill(bill.billid, {
              paymentMethod: paymentMethodName,
              paymentTransactionId: paymentTransactionId
            })
            
            if (!payBillResponse || !payBillResponse.success) {
              console.warn('账单状态更新失败:', payBillResponse?.errorMsg)
              // 即使账单状态更新失败，也不影响支付流程
            }
          }
        }
      } catch (error) {
        console.error('更新账单状态失败:', error)
        // 即使账单状态更新失败，也不影响支付流程
      }
    }

    // 显示成功消息
    if (contractType.value === 'apply') {
      ElMessage.success('支付成功！合同申请已提交，请等待卖家审核')
    } else {
      ElMessage.success('支付成功！合同已签订')
    }

    // 支付成功后跳转
    setTimeout(() => {
      if (contractType.value === 'apply') {
        router.push('/house/info')
      } else {
        // 跳转到合同管理页面，并添加查询参数以触发刷新
        router.push({
          path: '/contracts',
          query: { fromPayment: 'true' }
        })
      }
    }, 1500)
  } catch (error) {
    if (error === 'cancel') {
      return // 用户取消支付
    }
    console.error('支付失败:', error)
    ElMessage.error('支付失败，请稍后再试')
  } finally {
    processing.value = false
  }
}

// 获取支付方式名称
const getPaymentMethodName = (method) => {
  const methods = {
    alipay: '支付宝',
    wechat: '微信支付',
    bank: '银行卡'
  }
  return methods[method] || '未知'
}

// 处理取消
const handleCancel = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.payment-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  .payment-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }
    }

    .payment-content {
      .order-info-card,
      .payment-method-card {
        margin-bottom: 20px;

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;

          .el-icon {
            color: #409eff;
          }
        }
      }

      .order-info-card {
        .total-amount {
          font-size: 24px;
          font-weight: 700;
          color: #e74c3c;
        }
      }

      .payment-method-card {
        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 15px;
          width: 100%;

          .el-radio {
            width: 100%;
            margin: 0;
            height: auto;
            padding: 15px;
            border: 2px solid #e4e7ed;
            border-radius: 8px;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
            }

            &.is-checked {
              border-color: #409eff;
              background-color: #ecf5ff;
            }

            .payment-option {
              display: flex;
              align-items: center;
              gap: 10px;
              width: 100%;

              span {
                font-size: 16px;
                font-weight: 500;
              }
            }
          }
        }
      }

      .payment-actions {
        display: flex;
        justify-content: flex-end;
        gap: 15px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e4e7ed;

        .el-button {
          min-width: 150px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .payment-page {
    padding: 10px;

    .payment-card {
      .payment-content {
        .payment-method-card {
          .payment-methods {
            .el-radio {
              padding: 12px;
            }
          }
        }

        .payment-actions {
          flex-direction: column;

          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>

