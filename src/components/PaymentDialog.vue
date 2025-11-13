<template>
  <el-dialog
    v-model="visible"
    title="费用说明与支付"
    width="600px"
    :close-on-click-modal="false"
    class="payment-dialog"
  >
    <div class="payment-content">
      <!-- 费用说明 -->
      <el-card shadow="never" class="fee-info-card">
        <template #header>
          <div class="card-header">
            <el-icon><Money /></el-icon>
            <span>费用明细</span>
          </div>
        </template>
        <div class="fee-details">
          <div class="fee-item">
            <span class="fee-label">房源价格：</span>
            <span class="fee-value">¥{{ propertyPrice }}元</span>
          </div>
          <div class="fee-item">
            <span class="fee-label">服务费（0.5%）：</span>
            <span class="fee-value">¥{{ serviceFee }}元</span>
          </div>
          <div class="fee-item total">
            <span class="fee-label">应付总额：</span>
            <span class="fee-value total-value">¥{{ totalAmount }}元</span>
          </div>
        </div>
      </el-card>

      <!-- 费用说明文字 -->
      <el-alert
        title="费用说明"
        type="info"
        :closable="false"
        show-icon
        class="fee-notice"
      >
        <template #default>
          <ul class="notice-list">
            <li>房源价格：根据合同约定的房源价格计算</li>
            <li>服务费：平台收取的交易服务费（房价的0.5%），用于保障交易安全</li>
            <li>支付完成后，合同申请/签订将正式生效</li>
            <li>如有疑问，请联系客服</li>
          </ul>
        </template>
      </el-alert>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          @click="handlePay"
          :loading="paying"
          size="large"
        >
          <el-icon><CreditCard /></el-icon>
          立即支付
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Money, CreditCard } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  propertyPrice: {
    type: Number,
    default: 0
  },
  serviceFee: {
    type: Number,
    default: 500 // 默认服务费500元
  },
  contractId: {
    type: Number,
    default: null
  },
  contractType: {
    type: String,
    default: 'apply' // 'apply' 申请合同, 'sign' 签订合同
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const router = useRouter()
const paying = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 计算总金额（仅服务费，不包含房价）
// 注意：申请合同时只支付服务费，不支付房价
const totalAmount = computed(() => {
  // 如果是申请合同，只支付服务费
  if (props.contractType === 'apply') {
    return props.serviceFee
  }
  // 如果是签订合同，也只支付服务费
  if (props.contractType === 'sign') {
    return props.serviceFee
  }
  // 默认只支付服务费
  return props.serviceFee
})

// 处理支付
const handlePay = () => {
  paying.value = true
  
  // 跳转到支付页面，传递相关参数
  const paymentParams = {
    contractId: props.contractId,
    contractType: props.contractType,
    propertyPrice: props.propertyPrice,
    serviceFee: props.serviceFee,
    totalAmount: totalAmount.value
  }
  
  // 将参数编码后传递
  const queryString = new URLSearchParams({
    contractId: paymentParams.contractId || '',
    contractType: paymentParams.contractType,
    propertyPrice: paymentParams.propertyPrice.toString(),
    serviceFee: paymentParams.serviceFee.toString(),
    totalAmount: paymentParams.totalAmount.toString()
  }).toString()
  
  router.push(`/payment?${queryString}`)
  
  // 关闭弹窗
  visible.value = false
  emit('confirm', paymentParams)
  
  paying.value = false
}

// 处理取消
const handleCancel = () => {
  visible.value = false
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.payment-dialog {
  .payment-content {
    .fee-info-card {
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

      .fee-details {
        .fee-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .fee-label {
            font-size: 14px;
            color: #606266;
          }

          .fee-value {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }

          &.total {
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #e4e7ed;

            .fee-label {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
            }

            .total-value {
              font-size: 24px;
              color: #e74c3c;
            }
          }
        }
      }
    }

    .fee-notice {
      margin-top: 20px;

      .notice-list {
        margin: 10px 0 0 20px;
        padding: 0;
        line-height: 1.8;

        li {
          margin-bottom: 8px;
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      min-width: 100px;
    }
  }
}
</style>

