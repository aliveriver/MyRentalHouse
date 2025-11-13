<template>
  <div class="house-detail-container">
    <!-- 房源图片轮播 - 只在有图片时显示 -->
    <div class="house-gallery" v-if="houseData.images && houseData.images.length > 0">
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
              <el-button
                type="warning"
                :icon="Document"
                @click="showContractDialog"
                :loading="contractLoading"
                class="contract-btn"
              >
                申请签署合同
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
        <div
          class="mini-map"
          id="mini-map-container"
          v-loading="mapLoading"
        ></div>

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

    <!-- 卖家信息 -->
    <div class="contact-section">
      <div class="seller-info">
        <div class="seller-avatar">
          <el-avatar :size="60" :src="sellerInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
        </div>
        <div class="seller-details">
          <div class="seller-name">卖家ID：{{ sellerInfo.userid || houseData.sellerid || '未知' }}</div>
          <div class="seller-username">用户名：{{ sellerInfo.username || '未知' }}</div>
          <div class="seller-phone" v-if="sellerInfo.phonenumber || sellerInfo.phoneNumber">
            <el-icon><Phone /></el-icon>
            联系电话：{{ sellerInfo.phonenumber || sellerInfo.phoneNumber }}
          </div>
        </div>
        <div class="contact-actions">
          <el-button size="large" @click="viewSellerPhone" v-if="sellerInfo.phonenumber || sellerInfo.phoneNumber"> 查看电话 </el-button>
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

    <!-- 申请签署合同对话框 -->
    <el-dialog
      v-model="contractDialogVisible"
      title="申请签署合同"
      width="600px"
      :close-on-click-modal="false"
      class="contract-dialog"
    >
      <el-form
        ref="contractFormRef"
        :model="contractForm"
        :rules="contractRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="房源信息" prop="propertyId">
          <el-input v-model="houseData.title" disabled />
        </el-form-item>
        <el-form-item label="合同文件" prop="contractFile">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleContractFileChange"
            :on-remove="handleContractFileRemove"
            :limit="1"
            accept=".pdf,.doc,.docx,.txt"
            :file-list="contractFileList"
          >
            <el-button type="primary">选择合同文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传PDF、Word或TXT格式的合同文件，文件大小不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="contractDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitContractApplication"
            :loading="contractSubmitting"
          >
            提交申请
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 费用说明与支付弹窗 -->
    <PaymentDialog
      v-model="paymentDialogVisible"
      :property-price="houseData.totalPrice || 0"
      :service-fee="calculateServiceFee"
      :contract-id="pendingContractId"
      contract-type="apply"
      @confirm="handlePaymentConfirm"
      @cancel="handlePaymentCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, Guide, Phone, Star, StarFilled, Calendar, Document } from '@element-plus/icons-vue'
import AMapLoader from "@amap/amap-jsapi-loader"
import { propertiesApi, favoritesApi, viewingAppointmentsApi, filesApi, contractsApi, userManagementApi } from "@/api/index"
import PaymentDialog from '@/components/PaymentDialog.vue'
import { key_web_js } from "@/components/map/config.js"
import { all, houseTags, orientationTags, afitmentTags, typeTags, buildYearTags, elevatorRatioTags, floorTags } from "@/constant/tags"

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
  longitude: null,  // 经度
  latitude: null,   // 纬度
  province: '',     // 省份
  city: '',         // 城市
  street: '',       // 街道
  tags: ['地铁房', '精装修', '南北通透', '满两年', '随时看房'],
  description: '此房为三居室，客厅朝南，主卧朝南，次卧朝北，南北通透，采光充足。房屋精装修，保养良好，拎包即可入住。小区环境优美，物业管理完善，交通便利，紧邻地铁站，生活配套齐全。业主诚心出售，价格可议。',
  images: [], // 图片列表，从后端获取
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
  sellerid: null
})

// 卖家信息
const sellerInfo = ref({
  userid: null,
  username: '',
  phonenumber: '',
  phoneNumber: '', // 兼容两种字段名
  avatar: ''
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

// 合同相关状态
const contractDialogVisible = ref(false)
const contractLoading = ref(false)
const contractSubmitting = ref(false)
const contractFormRef = ref()
const uploadRef = ref()
const contractFileList = ref([])
const selectedContractFile = ref(null)
const paymentDialogVisible = ref(false)
const pendingContractId = ref(null)
const pendingContractData = ref(null)

// 合同表单数据
const contractForm = ref({
  propertyId: null,
  contractFile: null
})

// 合同表单验证规则
const contractRules = {
  contractFile: [
    {
      validator: (rule, value, callback) => {
        if (!selectedContractFile.value) {
          callback(new Error('请上传合同文件'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 计算服务费（0.5%房价，单位：元）
// 注意：totalPrice 已经是元单位，不需要转换
const calculateServiceFee = computed(() => {
  const priceInYuan = houseData.value.totalPrice || 0 // 价格已经是元单位
  return Math.round(priceInYuan * 0.005) // 0.5%服务费，四舍五入到整数
})

// 随机打乱数组的辅助函数
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const getHouseList = () => {
  const currentHouseId = houseData.value.id
  propertiesApi.getAllProperties().then(response => {
    if (response.success) {
      // 排除当前正在查看的房源
      let availableHouses = response.data.filter(item => item.propertyid !== currentHouseId)
      
      // 随机打乱数组
      availableHouses = shuffleArray(availableHouses)
      
      // 取前3个
      const data = availableHouses.slice(0, 3)
      
      recommendedHouses.value = data.map(item => {
        // 获取第一张图片，如果没有则使用默认图片
        let imageUrl = 'https://www.dmoe.cc/random.php?id=' + Math.random()
        if (item.photoList && item.photoList.length > 0 && item.photoList[0]) {
          imageUrl = filesApi.getFileUrl(item.photoList[0])
        }
        return {
          id: item.propertyid,
          title: item.title,
          rooms: item.layout,
          area: item.area + "m²",
          location: item.address,
          totalPrice: item.price,
          image: imageUrl
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

// 获取卖家信息
const getSellerInfo = async (sellerId) => {
  if (!sellerId) {
    return
  }
  try {
    const response = await userManagementApi.getUserById(sellerId)
    if (response.success && response.data) {
      // 兼容两种字段名：phonenumber 和 phoneNumber
      const phone = response.data.phonenumber || response.data.phoneNumber || ''
      sellerInfo.value = {
        userid: response.data.userid,
        username: response.data.username || '未知',
        phonenumber: phone,
        phoneNumber: phone, // 兼容两种字段名
        avatar: response.data.avatar || ''
      }
    } else {
      console.warn('获取卖家信息失败:', response.errorMsg)
    }
  } catch (error) {
    console.error('获取卖家信息失败:', error)
  }
}


const viewSellerPhone = () => {
  const phone = sellerInfo.value.phonenumber || sellerInfo.value.phoneNumber
  if (phone) {
    ElMessage.info(`卖家电话：${phone}`)
  } else {
    ElMessage.warning('卖家未提供联系方式')
  }
}

const goToHouse = (houseId) => {
  router.push(`/house/detail/${houseId}`)
  setTimeout(() => {
    getTargetHouseDetail()
  }, 16)
}

const mapLoading = ref(true);
// 初始化小地图
const initMiniMap = async () => {
  try {
    mapLoading.value = true
    AMap = await AMapLoader.load({
      key: key_web_js,
      version: "2.0",
      plugins: ["AMap.Geocoder"]
    })

    miniMap = new AMap.Map("mini-map-container", {
      zoom: 15,
      center: [116.418757, 39.917544] // 默认坐标，稍后会根据地址更新
    })

    // 创建地理编码对象
    const geocoder = new AMap.Geocoder({
      radius: 1000,
      extensions: "all"
    })

    // 优先使用经纬度坐标定位（最准确）
    if (houseData.value.longitude && houseData.value.latitude) {
      mapLoading.value = false
      const lnglat = [houseData.value.longitude, houseData.value.latitude]
      miniMap.setCenter(lnglat)
      miniMap.setZoom(15)

      // 添加标记点
      const marker = new AMap.Marker({
        position: lnglat,
        title: houseData.value.title,
        anchor: 'bottom-center'
      })
      miniMap.add(marker)

      // 格式化价格（添加千分位分隔符）
      const formatPrice = (price) => {
        if (!price) return '价格面议'
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
      
      // 创建信息窗口
      const infoWindow = new AMap.InfoWindow({
        content: `
          <div style="padding: 10px; font-size: 14px;">
            <strong>${(houseData.value.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong><br/>
            <div style="margin-top: 5px; color: #666;">
              ${(houseData.value.address || houseData.value.district || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}<br/>
              价格：<span style="color: #f56c6c; font-weight: 600;">${formatPrice(houseData.value.totalPrice)}元</span>
            </div>
          </div>
        `,
        offset: new AMap.Pixel(0, -30)
      })

      // 点击标记显示信息窗口
      marker.on('click', () => {
        infoWindow.open(miniMap, lnglat)
      })

      console.log(`使用坐标定位成功:`, lnglat)
      return
    }

    // 如果没有坐标，使用地址进行地理编码定位
    // 优先使用完整的地址信息，如果地址不完整则添加城市前缀提高定位准确性
    const originalAddress = houseData.value.address || houseData.value.district || ''
    if (originalAddress) {
      // 格式化价格（添加千分位分隔符）
      const formatPrice = (price) => {
        if (!price) return '价格面议'
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
      
      // 创建标记和信息窗口的函数
      const createMarkerAndInfoWindow = (lnglat, displayAddress) => {
        // 设置地图中心点
        miniMap.setCenter(lnglat)
        miniMap.setZoom(15)

        // 添加标记点
        const marker = new AMap.Marker({
          position: lnglat,
          title: houseData.value.title,
          anchor: 'bottom-center'
        })
        miniMap.add(marker)

        // 创建信息窗口
        const infoWindow = new AMap.InfoWindow({
          content: `
            <div style="padding: 10px; font-size: 14px;">
              <strong>${(houseData.value.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong><br/>
              <div style="margin-top: 5px; color: #666;">
                ${(displayAddress || originalAddress).replace(/</g, '&lt;').replace(/>/g, '&gt;')}<br/>
                价格：<span style="color: #f56c6c; font-weight: 600;">${formatPrice(houseData.value.totalPrice)}元</span>
              </div>
            </div>
          `,
          offset: new AMap.Pixel(0, -30)
        })

        // 点击标记显示信息窗口
        marker.on('click', () => {
          infoWindow.open(miniMap, lnglat)
        })
        
        return { marker, lnglat }
      }
      
      // 尝试地理编码的函数
      const tryGeocode = (addressToTry, isRetry = false) => {
        geocoder.getLocation(addressToTry, (status, result) => {
          if (status === 'complete' && result.geocodes && result.geocodes.length > 0) {
            const location = result.geocodes[0].location
            if (location && location.lng && location.lat) {
              const lnglat = [location.lng, location.lat]
              mapLoading.value = false
              createMarkerAndInfoWindow(lnglat, originalAddress)
              console.log(`房源地址 "${addressToTry}" 定位成功:`, lnglat)
              return
            }
          }
          
          // 如果第一次尝试失败，且地址中没有包含"市"或"省"，尝试添加"北京市"前缀
          if (!isRetry && !originalAddress.includes('市') && !originalAddress.includes('省')) {
            console.log(`地址 "${addressToTry}" 地理编码失败，尝试添加城市前缀...`)
            tryGeocode('北京市' + originalAddress, true)
          } else {
            // 两次尝试都失败，使用默认位置
            mapLoading.value = false
            console.warn(`地址 "${addressToTry}" 地理编码失败，使用默认位置:`, result)
            ElMessage.warning('房源地址定位失败，显示默认位置')
            const defaultLocation = [116.418757, 39.917544]
            createMarkerAndInfoWindow(defaultLocation, originalAddress)
          }
        })
      }
      
      // 开始地理编码
      tryGeocode(originalAddress)
    } else {
      mapLoading.value = false
      console.warn('房源地址信息为空，使用默认位置')

      // 没有地址信息时使用默认位置
      const defaultLocation = [116.418757, 39.917544]
      miniMap.setCenter(defaultLocation)
      miniMap.setZoom(15)
      const marker = new AMap.Marker({
        position: defaultLocation,
        title: houseData.value.title,
        anchor: 'bottom-center'
      })
      miniMap.add(marker)
    }

  } catch (error) {
    mapLoading.value = false
    console.error('地图加载失败:', error)
    ElMessage.error('地图加载失败')
  }
}

const getTargetHouseDetail = () => {
  const houseId = route.params.id
  propertiesApi.getPropertyById(houseId).then(response => {
    if (response.success) {
      const data = response.data;
      houseData.value.sellerid = data.sellerid
      houseData.value.id = data.propertyid
      houseData.value.address = data.address // 完整地址
      houseData.value.district = data.address || data.district || '' // 用于显示的地址
      houseData.value.title = data.title
      houseData.value.totalPrice = data.price
      // 定位信息
      houseData.value.longitude = data.longitude
      houseData.value.latitude = data.latitude
      houseData.value.province = data.province
      houseData.value.city = data.city
      houseData.value.district = data.district || data.address
      houseData.value.street = data.street
      houseData.value.area = data.area + "m²"
      houseData.value.unitPrice = (data.price / data.area).toFixed(2)
      houseData.value.rooms = data.layout
      houseData.value.description = data.description
      houseData.value.tags = data.tagIds.map(t => all.find(item => item.id === t)?.value || '未知标签')
      // 优先使用数据库字段，如果为空则从标签中获取（向后兼容）
      houseData.value.direction = data.orientation || (() => {
        const id = data.tagIds?.filter(t => {
          return orientationTags.some(h => h.id === t)
        })[0]
        return id ? orientationTags.find(h => h.id === id).value : '未知方向'
      })();
      
      houseData.value.floor = data.floor || (() => {
        const id = data.tagIds?.filter(t => {
          return floorTags.some(h => h.id === t)
        })[0]
        return id ? floorTags.find(h => h.id === id).value : '未知楼层'
      })();
      
      houseData.value.decoration = data.decoration || (() => {
        const id = data.tagIds?.filter(t => {
          return afitmentTags.some(h => h.id === t)
        })[0]
        return id ? afitmentTags.find(h => h.id === id).value : '未知装修'
      })();
      
      houseData.value.buildingType = data.buildingType || (() => {
        const id = data.tagIds?.filter(t => {
          return typeTags.some(h => h.id === t)
        })[0]
        return id ? typeTags.find(h => h.id === id).value : '未知类型'
      })();
      
      houseData.value.buildYear = data.buildYear || '未知年代'
      houseData.value.elevatorRatio = data.elevatorRatio || '未知'

      // 处理图片列表：从 photoList 转换为完整URL数组
      if (data.photoList && data.photoList.length > 0) {
        houseData.value.images = data.photoList.map(uri => filesApi.getFileUrl(uri))
      } else {
        // 如果没有图片，设置为空数组，轮播图将不显示
        houseData.value.images = []
      }

      // 获取卖家信息
      if (data.sellerid) {
        getSellerInfo(data.sellerid)
      }

      // 数据更新后初始化地图
      nextTick(() => {
        initMiniMap()
      })

      // 检查收藏状态
      checkFavoriteStatus()
      
      // 获取推荐房源（在获取房源详情后，确保有当前房源ID）
      getHouseList()
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

// 显示申请签署合同对话框
const showContractDialog = () => {
  contractDialogVisible.value = true
  contractForm.value.propertyId = houseData.value.id
  contractForm.value.contractFile = null
  contractFileList.value = []
  selectedContractFile.value = null
  // 清除表单验证状态
  nextTick(() => {
    if (contractFormRef.value) {
      contractFormRef.value.clearValidate()
    }
  })
}

// 处理合同文件选择
const handleContractFileChange = (file) => {
  if (!file || !file.raw) {
    return
  }
  
  // 检查文件大小（10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.raw.size > maxSize) {
    ElMessage.error('文件大小不能超过10MB')
    contractFileList.value = []
    selectedContractFile.value = null
    // 触发表单验证
    if (contractFormRef.value) {
      contractFormRef.value.validateField('contractFile')
    }
    return
  }
  
  // 检查文件类型（支持PDF、Word和TXT格式）
  const fileName = file.raw.name || ''
  const fileType = file.raw.type || ''
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
  
  const isValidType = allowedMimeTypes.includes(fileType) || 
    allowedExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  
  if (!isValidType) {
    ElMessage.error('请上传PDF、Word或TXT格式的合同文件')
    contractFileList.value = []
    selectedContractFile.value = null
    // 触发表单验证
    if (contractFormRef.value) {
      contractFormRef.value.validateField('contractFile')
    }
    return
  }
  
  selectedContractFile.value = file.raw
  // 更新表单数据以触发表单验证
  contractForm.value.contractFile = file.raw.name
  // 触发表单验证
  if (contractFormRef.value) {
    contractFormRef.value.validateField('contractFile')
  }
}

// 处理合同文件移除
const handleContractFileRemove = () => {
  selectedContractFile.value = null
  contractForm.value.contractFile = null
  // 触发表单验证
  if (contractFormRef.value) {
    contractFormRef.value.validateField('contractFile')
  }
}

// 提交合同申请
const submitContractApplication = async () => {
  // 先检查文件是否已选择
  if (!selectedContractFile.value) {
    ElMessage.warning('请选择合同文件')
    // 触发表单验证以显示错误
    if (contractFormRef.value) {
      contractFormRef.value.validateField('contractFile')
    }
    return
  }

  // 验证表单
  if (!contractFormRef.value) {
    return
  }

  try {
    await contractFormRef.value.validate()
  } catch (error) {
    // 表单验证失败
    console.log('表单验证失败:', error)
    return
  }

  contractSubmitting.value = true

  try {
    // 先上传合同文件
    const uploadResponse = await contractsApi.uploadContractFile(selectedContractFile.value)
    
    if (!uploadResponse.success) {
      ElMessage.error(uploadResponse.errorMsg || '合同文件上传失败')
      contractSubmitting.value = false
      return
    }

    // 获取文件URI，可能是 response.data 或 response.data.uri
    const contractFileUri = uploadResponse.data?.uri || uploadResponse.data

    if (!contractFileUri) {
      ElMessage.error('获取文件URI失败，请重试')
      contractSubmitting.value = false
      return
    }

    // 保存待提交的合同数据
    pendingContractData.value = {
      propertyId: houseData.value.id,
      contractFileUri: contractFileUri
    }

    contractSubmitting.value = false

    // 关闭合同申请对话框
    contractDialogVisible.value = false

    // 显示费用说明与支付弹窗
    paymentDialogVisible.value = true
  } catch (error) {
    console.error('合同申请失败:', error)
    ElMessage.error('合同申请失败，请稍后再试')
    contractSubmitting.value = false
  }
}

// 处理支付确认（用户点击支付按钮后）
const handlePaymentConfirm = async (paymentParams) => {
  // 将待提交的合同数据保存到 sessionStorage，供支付页面使用
  if (pendingContractData.value) {
    sessionStorage.setItem('pendingContractData', JSON.stringify(pendingContractData.value))
  }
  paymentDialogVisible.value = false
}

// 处理支付取消
const handlePaymentCancel = async () => {
  // 用户取消支付，必须支付服务费才能申请合同
  ElMessage.warning('必须支付服务费才能申请合同')
  // 清理待提交的合同数据
  pendingContractData.value = null
  // 关闭支付对话框
  paymentDialogVisible.value = false
  // 可以选择重新打开合同申请对话框
  contractDialogVisible.value = true
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

    .seller-info {
      display: flex;
      align-items: center;
      gap: 20px;

      .seller-details {
        flex: 1;

        .seller-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .seller-username {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .seller-phone {
          font-size: 14px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 5px;
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

/* 合同申请对话框样式 */
:deep(.contract-dialog) {
  .el-dialog__body {
    padding: 20px 20px 0;
  }

  .el-dialog__footer {
    padding: 20px;
    text-align: right;
  }

  .el-upload__tip {
    color: #999;
    font-size: 12px;
    margin-top: 5px;
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
