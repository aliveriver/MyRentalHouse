<template>
  <div class="house-detail-container">
    <!-- 房源图片轮播 -->
    <div class="house-gallery">
      <el-carousel :interval="5000" type="card" height="400px">
        <el-carousel-item
          v-for="(image, index) in houseData.images"
          :key="index"
        >
          <img :src="image" :alt="`房源图片${index + 1}`" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="house-content">
      <!-- 房源基本信息 -->
      <div class="house-main-info">
        <div class="house-title-section">
          <div class="title-and-favorite">
            <h1 class="house-title">{{ houseData.title }}</h1>
            <div class="action-buttons">
              <el-button
                :type="isFavorited ? 'danger' : 'primary'"
                :icon="isFavorited ? 'StarFilled' : 'Star'"
                @click="toggleFavorite"
                :loading="favoriteLoading"
                class="favorite-btn"
              >
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
              <el-button
                type="success"
                :icon="Calendar"
                @click="showAppointmentDialog"
                :loading="appointmentLoading"
                class="appointment-btn"
              >
                预约看房
              </el-button>
            </div>
          </div>
          <div class="house-price">
            <span class="total-price">{{ houseData.totalPrice }}</span>
            <span class="price-unit">元</span>
            <span class="unit-price">{{ houseData.unitPrice }}元/平</span>
          </div>
        </div>

        <div class="house-basic-info">
          <div class="info-row">
            <div class="info-item">
              <span class="label">房屋户型</span>
              <span class="value">{{ houseData.rooms }}</span>
            </div>
            <div class="info-item">
              <span class="label">建筑面积</span>
              <span class="value">{{ houseData.area }}</span>
            </div>
            <div class="info-item">
              <span class="label">房屋朝向</span>
              <span class="value">{{ houseData.direction }}</span>
            </div>
            <div class="info-item">
              <span class="label">所在楼层</span>
              <span class="value">{{ houseData.floor }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">装修情况</span>
              <span class="value">{{ houseData.decoration }}</span>
            </div>
            <div class="info-item">
              <span class="label">建筑类型</span>
              <span class="value">{{ houseData.buildingType }}</span>
            </div>
            <div class="info-item">
              <span class="label">建筑年代</span>
              <span class="value">{{ houseData.buildYear }}</span>
            </div>
            <div class="info-item">
              <span class="label">梯户比例</span>
              <span class="value">{{ houseData.elevatorRatio }}</span>
            </div>
          </div>
        </div>

        <div
          class="house-tags-section"
          v-if="houseData.tags && houseData.tags.length"
        >
          <div class="tags-title">房源标签</div>
          <div class="tags-content">
            <el-tag v-for="tag in houseData.tags" :key="tag" class="house-tag">
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <div class="house-description">
          <h3>房源描述</h3>
          <div class="description-content">
            {{ houseData.description }}
          </div>
        </div>
      </div>

      <!-- 位置信息 -->
      <div class="location-info">
        <h3>位置及配套</h3>
        <div class="location-basic">
          <div class="location-item">
            <el-icon><Location /></el-icon>
            <span>{{ houseData.district }}</span>
          </div>
        </div>

        <!-- 小地图 -->
        <div class="mini-map" id="mini-map-container"></div>

        <!-- 周边配套 -->
        <div class="surrounding-facilities">
          <h4>周边配套</h4>
          <div class="facilities-grid">
            <div
              class="facility-category"
              v-for="category in houseData.facilities"
              :key="category.type"
            >
              <div class="category-title">{{ category.type }}</div>
              <div class="facility-list">
                <div
                  class="facility-item"
                  v-for="facility in category.items"
                  :key="facility.name"
                >
                  <span class="facility-name">{{ facility.name }}</span>
                  <span class="facility-distance">{{ facility.distance }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 联系信息 -->
    <div class="contact-section">
      <div class="agent-info">
        <div class="agent-avatar">
          <el-avatar :size="60" :src="houseData.agent.avatar" />
        </div>
        <div class="agent-details">
          <div class="agent-name">{{ houseData.agent.name }}</div>
          <div class="agent-title">{{ houseData.agent.title }}</div>
          <div class="agent-rating">
            <el-rate v-model="houseData.agent.rating" disabled show-score />
          </div>
        </div>
        <div class="contact-actions">
          <el-button type="primary" size="large" @click="contactAgent">
            <el-icon><Phone /></el-icon>
            联系经纪人
          </el-button>
          <el-button size="large" @click="viewPhone"> 查看电话 </el-button>
        </div>
      </div>
    </div>

    <!-- 推荐房源 -->
    <div class="recommended-houses" v-if="recommendedHouses.length">
      <h3>推荐房源</h3>
      <div class="recommended-list">
        <div
          class="recommended-item"
          v-for="house in recommendedHouses"
          :key="house.id"
          @click="goToHouse(house.id)"
        >
          <div class="recommended-image">
            <img :src="house.image" :alt="house.title" />
          </div>
          <div class="recommended-info">
            <div class="recommended-title">{{ house.title }}</div>
            <div class="recommended-basic">
              {{ house.rooms }} | {{ house.area }}
            </div>
            <div class="recommended-location">{{ house.location }}</div>
            <div class="recommended-price">{{ house.totalPrice }}万</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约看房对话框 -->
    <el-dialog
      v-model="appointmentDialogVisible"
      title="预约看房"
      width="500px"
      :close-on-click-modal="false"
      class="appointment-dialog"
    >
      <el-form
        ref="appointmentFormRef"
        :model="appointmentForm"
        :rules="appointmentRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="预约时间" prop="appointmenttime">
          <el-date-picker
            v-model="appointmentForm.appointmenttime"
            type="datetime"
            placeholder="请选择预约时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :disabled-date="disabledDate"
            :disabled-hours="disabledHours"
            :disabled-minutes="disabledMinutes"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="appointmentDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitAppointment"
            :loading="appointmentSubmitting"
          >
            确认预约
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, Guide, Phone, Star, StarFilled, Calendar } from '@element-plus/icons-vue'
import AMapLoader from "@amap/amap-jsapi-loader"
import { propertiesApi, favoritesApi, viewingAppointmentsApi } from "@/api/index"
import { key_web_js } from "@/components/map/config.js"
import { all, houseTags, orientationTags, afitmentTags, typeTags } from "@/constant/tags"

const route = useRoute()
const router = useRouter()

let miniMap = null
let AMap = null

// 房源详细数据
const houseData = ref({
  id: 1,
  title: '朝阳门精装修三居室，南北通透，紧邻地铁',
  totalPrice: 860,
  unitPrice: 67188,
  rooms: '3室2厅1卫',
  area: '128㎡',
  direction: '南北',
  floor: '8/18层',
  decoration: '精装修',
  buildingType: '板楼',
  buildYear: '2008年',
  elevatorRatio: '一梯两户',
  district: '朝阳区',
  location: '朝阳门',
  address: '朝阳区朝阳门南大街xx号',
  tags: ['地铁房', '精装修', '南北通透', '满两年', '随时看房'],
  description: '此房为三居室，客厅朝南，主卧朝南，次卧朝北，南北通透，采光充足。房屋精装修，保养良好，拎包即可入住。小区环境优美，物业管理完善，交通便利，紧邻地铁站，生活配套齐全。业主诚心出售，价格可议。',
  images: [
    'https://img.zx123.cn/Resources/zx123cn/uploadfile/2020/0507/6bf211145acaf9038e4278f6de6a50eb.jpg',
    'https://th.bing.com/th/id/OIP.QyILwLXJ6QFHEm7XrlzAewHaFj?rs=1&pid=ImgDetMain',
    'https://th.bing.com/th/id/R.dd2867b72c2a6e1a2d57ac34af123de5?rik=32I4kAm4igk4cg&riu=http%3a%2f%2fdocs.ebdoor.com%2fImage%2fProductImage%2f0%2f458%2f4581417_1.jpg&ehk=F4yX1W1Gi8IWxhHbzrrYOPyTqn8muWuvLKQ87laSOhQ%3d&risl=&pid=ImgRaw&r=0',
    'https://mofang-renter.oss-cn-shanghai.aliyuncs.com/store/1594622517006.jpg',
    'https://pic.fapai.cn/pic/20250520/17477349301853291.jpeg'
  ],
  facilities: [
    {
      type: '交通',
      items: [
        { name: '朝阳门地铁站', distance: '500米' },
        { name: '公交站', distance: '200米' },
        { name: '首都机场', distance: '25公里' }
      ]
    },
    {
      type: '教育',
      items: [
        { name: '朝阳门小学', distance: '300米' },
        { name: '朝阳区第一中学', distance: '800米' },
        { name: '幼儿园', distance: '400米' }
      ]
    },
    {
      type: '医疗',
      items: [
        { name: '朝阳医院', distance: '1.2公里' },
        { name: '社区卫生站', distance: '600米' }
      ]
    },
    {
      type: '购物',
      items: [
        { name: '朝阳门银座', distance: '600米' },
        { name: '超市', distance: '300米' },
        { name: '菜市场', distance: '400米' }
      ]
    }
  ],
  agent: {
    name: '张经理',
    title: '高级置业顾问',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    rating: 4.8,
    phone: '138****8888'
  }
})

// 推荐房源
const recommendedHouses = ref([])

// 收藏相关状态
const isFavorited = ref(false)
const favoriteLoading = ref(false)

// 预约相关状态
const appointmentDialogVisible = ref(false)
const appointmentLoading = ref(false)
const appointmentSubmitting = ref(false)
const appointmentFormRef = ref()

// 预约表单数据
const appointmentForm = ref({
  propertyid: null,
  appointmenttime: '',
  remark: ''
})

// 预约表单验证规则
const appointmentRules = {
  appointmenttime: [
    { required: true, message: '请选择预约时间', trigger: 'change' }
  ]
}

const getHouseList = () => {
  propertiesApi.getAllProperties().then(response => {
    if (response.success) {
      const data = response.data.splice(0, 3)
      recommendedHouses.value = data.map(item => {
        return {
          id: item.propertyid,
          title: item.title,
          rooms: item.layout,
          area: item.area + "m²",
          location: item.address,
          totalPrice: item.price,
          image: ''
        }
      })
    } else {
      ElMessage.error('获取房源列表失败，请稍后再试。')
    }
  }).catch(error => {
    console.error('获取房源列表失败:', error)
    ElMessage.error('获取房源列表失败，请稍后再试。')
  })
}
getHouseList();

const contactAgent = () => {
  ElMessage.success('已为您转接经纪人，请稍候...')
}

const viewPhone = () => {
  ElMessage.info(`经纪人电话：${houseData.value.agent.phone}`)
}

const goToHouse = (houseId) => {
  router.push(`/house/detail/${houseId}`)
  setTimeout(() => {
    getTargetHouseDetail()
  }, 16)
}

// 初始化小地图
const initMiniMap = async () => {
  try {
    AMap = await AMapLoader.load({
      key: key_web_js,
      version: "2.0",
      plugins: ["AMap.Geocoder"]
    })

    miniMap = new AMap.Map("mini-map-container", {
      zoom: 15,
      center: [116.418757, 39.917544] // 朝阳门坐标
    })

    // 添加标记点
    const marker = new AMap.Marker({
      position: [116.418757, 39.917544],
      title: houseData.value.title
    })
    miniMap.add(marker)

  } catch (error) {
    console.error('地图加载失败:', error)
  }
}

const getTargetHouseDetail = () => {
  const houseId = route.params.id
  propertiesApi.getPropertyById(houseId).then(response => {
    if (response.success) {
      const data = response.data;
      houseData.value.agent.name = "用户：" + response.data.sellerid
      houseData.value.id = data.propertyid
      houseData.value.district = data.address
      houseData.value.title = data.title
      houseData.value.totalPrice = data.price
      houseData.value.area = data.area + "m²"
      houseData.value.unitPrice = (data.price / data.area).toFixed(2)
      houseData.value.rooms = data.layout
      houseData.value.description = data.description
      houseData.value.tags = data.tagIds.map(t => all.find(item => item.id === t)?.value || '未知标签')
      houseData.value.direction = (() => {
        const id = data.tagIds.filter(t => {
          return orientationTags.some(h => h.id === t)
        })[0]
        return id ? orientationTags.find(h => h.id === id).value : '未知方向'
      })();
      houseData.value.decoration = (() => {
        const id = data.tagIds.filter(t => {
          return afitmentTags.some(h => h.id === t)
        })[0]
        return id ? afitmentTags.find(h => h.id === id).value : '未知装修'
      })();
      houseData.value.buildingType = (() => {
        const id = data.tagIds.filter(t => {
          return typeTags.some(h => h.id === t)
        })[0]
        return id ? typeTags.find(h => h.id === id).value : '未知类型'
      })();
      initMiniMap()
      // 检查收藏状态
      checkFavoriteStatus()
    }
  }).catch(error => {
    console.error('获取房源数据失败:', error)
    ElMessage.error('房源信息加载失败，请稍后再试。')
  })
}

// 检查收藏状态
const checkFavoriteStatus = async () => {
  try {
    const response = await favoritesApi.checkFavorite(houseData.value.id)
    if (response.success) {
      isFavorited.value = response.data
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  favoriteLoading.value = true
  try {
    if (isFavorited.value) {
      // 取消收藏
      const response = await favoritesApi.removeFavorite(houseData.value.id)
      if (response.success) {
        isFavorited.value = false
        ElMessage.success('取消收藏成功')
      } else {
        ElMessage.error(response.errorMsg || '取消收藏失败')
      }
    } else {
      // 添加收藏
      const response = await favoritesApi.addFavorite(houseData.value.id)
      if (response.success) {
        isFavorited.value = true
        ElMessage.success('收藏成功')
      } else {
        ElMessage.error(response.errorMsg || '收藏失败')
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败，请稍后再试')
  } finally {
    favoriteLoading.value = false
  }
}

// 显示预约对话框
const showAppointmentDialog = () => {
  appointmentDialogVisible.value = true
  appointmentForm.value.propertyid = houseData.value.id
  appointmentForm.value.appointmenttime = ''
  appointmentForm.value.remark = ''
}

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

// 禁用过去的小时
const disabledHours = () => {
  const hours = []
  const now = new Date()
  const selectedDate = new Date(appointmentForm.value.appointmenttime)

  if (selectedDate.toDateString() === now.toDateString()) {
    for (let i = 0; i < now.getHours(); i++) {
      hours.push(i)
    }
  }

  // 限制工作时间 9:00-18:00
  for (let i = 0; i < 9; i++) {
    hours.push(i)
  }
  for (let i = 19; i < 24; i++) {
    hours.push(i)
  }

  return hours
}

// 禁用过去的分钟
const disabledMinutes = (hour) => {
  const minutes = []
  const now = new Date()
  const selectedDate = new Date(appointmentForm.value.appointmenttime)

  if (selectedDate.toDateString() === now.toDateString() && hour === now.getHours()) {
    for (let i = 0; i <= now.getMinutes(); i++) {
      minutes.push(i)
    }
  }

  return minutes
}

// 提交预约申请
const submitAppointment = async () => {
  try {
    await appointmentFormRef.value.validate()

    appointmentSubmitting.value = true

    const appointmentData = {
      propertyid: appointmentForm.value.propertyid,
      appointmenttime: appointmentForm.value.appointmenttime
    }

    const response = await viewingAppointmentsApi.applyAppointment(appointmentData)

    if (response.success) {
      ElMessage.success('预约申请提交成功！请等待审核')
      appointmentDialogVisible.value = false
    } else {
      ElMessage.error(response.errorMsg || '预约申请失败，请稍后再试')
    }
  } catch (error) {
    if (error === 'validation failed') {
      return // 表单验证失败，不显示错误消息
    }
    console.error('预约申请失败:', error)
    ElMessage.error('预约申请失败，请稍后再试')
  } finally {
    appointmentSubmitting.value = false
  }
}

onMounted(() => {
  // 根据路由参数加载房源数据
  getTargetHouseDetail()
})

onUnmounted(() => {
  if (miniMap) {
    miniMap.destroy()
  }
})
</script>

<style lang="scss" scoped>
.house-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .house-gallery {
    margin-bottom: 30px;

    .el-carousel__item {
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
      }
    }
  }

  .house-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 30px;
    margin-bottom: 30px;

    .house-main-info {
      .house-title-section {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .title-and-favorite {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          flex: 1;
          flex-direction: column;

          .house-title {
            font-size: 24px;
            font-weight: 600;
            color: #333;
            margin: 0;
            line-height: 1.4;
            flex: 1;
          }

          .action-buttons {
            display: flex;
            gap: 12px;
            flex-shrink: 0;

            .favorite-btn,
            .appointment-btn {
              transition: all 0.3s ease;

              &:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              }
            }
          }
        }

        .house-price {
          text-align: right;
          white-space: nowrap;

          .total-price {
            font-size: 32px;
            font-weight: 700;
            color: #f56c6c;
          }

          .price-unit {
            font-size: 18px;
            color: #f56c6c;
            margin-left: 4px;
          }

          .unit-price {
            display: block;
            font-size: 14px;
            color: #999;
            margin-top: 5px;
          }
        }
      }

      .house-basic-info {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;

        .info-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 15px;

          &:last-child {
            margin-bottom: 0;
          }

          .info-item {
            display: flex;
            flex-direction: column;
            gap: 5px;

            .label {
              font-size: 12px;
              color: #999;
            }

            .value {
              font-size: 14px;
              color: #333;
              font-weight: 500;
            }
          }
        }
      }

      .house-tags-section {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;

        .tags-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
        }

        .tags-content {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;

          .house-tag {
            font-size: 12px;
          }
        }
      }

      .house-description {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        h3 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 15px 0;
        }

        .description-content {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }
      }
    }

    .location-info {
      .location-basic {
        margin-bottom: 20px;

        .location-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 14px;
          color: #666;
        }
      }

      .mini-map {
        width: 100%;
        height: 200px;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 20px;
      }

      .surrounding-facilities {
        h4 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 15px 0;
        }

        .facilities-grid {
          display: grid;
          gap: 15px;

          .facility-category {
            .category-title {
              font-size: 14px;
              font-weight: 600;
              color: #333;
              margin-bottom: 8px;
            }

            .facility-list {
              .facility-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px 0;
                font-size: 12px;
                color: #666;
                border-bottom: 1px solid #f0f0f0;

                &:last-child {
                  border-bottom: none;
                }

                .facility-distance {
                  color: #409eff;
                }
              }
            }
          }
        }
      }
    }
  }

  .contact-section {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;

    .agent-info {
      display: flex;
      align-items: center;
      gap: 20px;

      .agent-details {
        flex: 1;

        .agent-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .agent-title {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
      }

      .contact-actions {
        display: flex;
        gap: 10px;
      }
    }
  }

  .recommended-houses {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0 0 20px 0;
    }

    .recommended-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;

      .recommended-item {
        display: flex;
        gap: 15px;
        cursor: pointer;
        padding: 10px;
        border-radius: 8px;
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #f5f7fa;
        }

        .recommended-image {
          width: 120px;
          height: 90px;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
          }
        }

        .recommended-info {
          flex: 1;

          .recommended-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
            line-height: 1.4;
          }

          .recommended-basic {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }

          .recommended-location {
            font-size: 12px;
            color: #999;
            margin-bottom: 8px;
          }

          .recommended-price {
            font-size: 16px;
            font-weight: 600;
            color: #f56c6c;
          }
        }
      }
    }
  }
}

h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

// 响应式布局
@media (max-width: 768px) {
  .house-detail-container {
    padding: 10px;

    .house-content {
      grid-template-columns: 1fr;
      gap: 20px;

      .house-basic-info .info-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .recommended-houses .recommended-list {
      grid-template-columns: 1fr;
    }
  }
}

/* 预约对话框样式 */
:deep(.appointment-dialog) {
  .el-dialog__body {
    padding: 20px 20px 0;
  }

  .el-dialog__footer {
    padding: 20px;
    text-align: right;
  }
}

.house-info {
  background: #f8f9fa;
  padding: 15px 10px;
  border-left: 4px solid #409eff;

  .house-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .house-price {
    font-size: 18px;
    font-weight: 700;
    color: #f56c6c;
  }
}

.dialog-footer {
  .el-button {
    margin-left: 12px;
  }
}
</style>
