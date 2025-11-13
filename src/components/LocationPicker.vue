<template>
  <div class="location-picker">
    <el-dialog
      v-model="dialogVisible"
      title="选择房源位置"
      width="800px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <div class="picker-content">
        <!-- 地址搜索 -->
        <div class="search-section">
          <el-input
            v-model="searchAddress"
            placeholder="请输入地址或小区名进行搜索"
            clearable
            @input="handleAddressSearch"
            @clear="handleAddressClear"
          >
            <template #append>
              <el-button :icon="Search" @click="handleAddressSearch" />
            </template>
          </el-input>
          <!-- 搜索结果 -->
          <div class="search-results" v-if="searchResults.length > 0">
            <div
              class="result-item"
              v-for="(item, index) in searchResults"
              :key="index"
              @click="selectSearchResult(item)"
            >
              <el-icon><Location /></el-icon>
              <div class="result-info">
                <div class="result-name">{{ item.name }}</div>
                <div class="result-address">{{ item.address }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 地图容器 -->
        <div class="map-section">
          <div
            id="location-picker-map"
            class="map-container"
            v-loading="mapLoading"
            element-loading-text="正在加载地图..."
          ></div>
          <div class="map-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>请在地图上点击选择房源位置</span>
          </div>
        </div>

        <!-- 位置信息显示 -->
        <div class="location-info" v-if="selectedLocation">
          <div class="info-row">
            <span class="label">经度：</span>
            <span class="value">{{ selectedLocation.longitude }}</span>
          </div>
          <div class="info-row">
            <span class="label">纬度：</span>
            <span class="value">{{ selectedLocation.latitude }}</span>
          </div>
          <div class="info-row">
            <span class="label">地址：</span>
            <span class="value">{{ selectedLocation.address }}</span>
          </div>
          <div class="info-row" v-if="selectedLocation.province">
            <span class="label">省市区：</span>
            <span class="value">{{ selectedLocation.province }} {{ selectedLocation.city }} {{ selectedLocation.district }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
            :disabled="!selectedLocation"
          >
            确认选择
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Location, InfoFilled } from '@element-plus/icons-vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { key_web_js } from '@/components/map/config.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  defaultLocation: {
    type: Object,
    default: () => ({
      longitude: 116.397428,
      latitude: 39.90923,
      address: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = ref(props.modelValue)
const mapLoading = ref(true)
const searchAddress = ref('')
const searchResults = ref([])
const selectedLocation = ref(null)

let AMap = null
let map = null
let marker = null
let geocoder = null
let placeSearch = null

// 监听 dialogVisible 变化
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    nextTick(() => {
      initMap()
    })
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 初始化地图
const initMap = async () => {
  try {
    mapLoading.value = true
    AMap = await AMapLoader.load({
      key: key_web_js,
      version: '2.0',
      plugins: ['AMap.Geocoder', 'AMap.PlaceSearch']
    })

    // 创建地图实例
    map = new AMap.Map('location-picker-map', {
      zoom: 15,
      center: props.defaultLocation.longitude && props.defaultLocation.latitude
        ? [props.defaultLocation.longitude, props.defaultLocation.latitude]
        : [116.397428, 39.90923]
    })

    // 创建地理编码实例
    geocoder = new AMap.Geocoder({
      radius: 1000,
      extensions: 'all'
    })

    // 创建地点搜索实例
    placeSearch = new AMap.PlaceSearch({
      city: '北京市',
      citylimit: false,
      extensions: 'all'
    })

    // 如果已有默认位置，添加标记
    if (props.defaultLocation.longitude && props.defaultLocation.latitude) {
      addMarker(
        [props.defaultLocation.longitude, props.defaultLocation.latitude],
        props.defaultLocation.address
      )
    }

    // 地图点击事件
    map.on('click', handleMapClick)

    mapLoading.value = false
  } catch (error) {
    console.error('地图初始化失败:', error)
    ElMessage.error('地图加载失败，请刷新页面重试')
    mapLoading.value = false
  }
}

// 地图点击事件
const handleMapClick = async (e) => {
  const lnglat = [e.lnglat.lng, e.lnglat.lat]
  await addMarker(lnglat)
  await reverseGeocode(lnglat)
}

// 添加标记
const addMarker = (lnglat, title = '') => {
  if (marker) {
    marker.setPosition(lnglat)
    if (title) {
      marker.setTitle(title)
    }
  } else {
    marker = new AMap.Marker({
      position: lnglat,
      title: title,
      draggable: true, // 可拖动
      cursor: 'move'
    })
    map.add(marker)
    map.setCenter(lnglat)

    // 标记拖动事件
    marker.on('dragend', async (e) => {
      const lnglat = [e.lnglat.lng, e.lnglat.lat]
      await reverseGeocode(lnglat)
    })
  }
}

// 逆地理编码：根据坐标获取地址
const reverseGeocode = async (lnglat) => {
  try {
    geocoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete' && result.info === 'OK') {
        const regeocode = result.regeocode
        const addressComponent = regeocode.addressComponent

        selectedLocation.value = {
          longitude: lnglat[0],
          latitude: lnglat[1],
          address: regeocode.formattedAddress,
          province: addressComponent.province || '',
          city: addressComponent.city || addressComponent.province || '',
          district: addressComponent.district || '',
          street: addressComponent.street || '',
          streetNumber: addressComponent.streetNumber || ''
        }
      } else {
        ElMessage.warning('获取地址信息失败')
      }
    })
  } catch (error) {
    console.error('逆地理编码失败:', error)
    ElMessage.error('获取地址信息失败')
  }
}

// 地址搜索
const handleAddressSearch = () => {
  if (!searchAddress.value.trim()) {
    searchResults.value = []
    return
  }

  if (!placeSearch) {
    ElMessage.warning('地图未初始化完成，请稍候再试')
    return
  }

  placeSearch.search(searchAddress.value, (status, result) => {
    if (status === 'complete' && result.poiList) {
      searchResults.value = result.poiList.pois.map((poi, index) => ({
        id: index,
        name: poi.name,
        address: poi.address,
        location: poi.location,
        district: poi.district,
        adcode: poi.adcode
      }))
    } else {
      searchResults.value = []
      if (status !== 'complete') {
        ElMessage.warning('搜索失败，请重试')
      }
    }
  })
}

// 选择搜索结果
const selectSearchResult = async (item) => {
  const lnglat = [item.location.lng, item.location.lat]
  await addMarker(lnglat, item.name)
  await reverseGeocode(lnglat)
  searchResults.value = []
  searchAddress.value = item.name
  map.setCenter(lnglat)
  map.setZoom(16)
}

// 清除搜索
const handleAddressClear = () => {
  searchResults.value = []
}

// 确认选择
const handleConfirm = () => {
  if (!selectedLocation.value) {
    ElMessage.warning('请先选择位置')
    return
  }

  emit('confirm', selectedLocation.value)
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  searchAddress.value = ''
  searchResults.value = []
  selectedLocation.value = null

  // 清理地图资源
  if (marker) {
    map.remove(marker)
    marker = null
  }
  if (map) {
    map.destroy()
    map = null
  }
}
</script>

<style lang="scss" scoped>
.location-picker {
  .picker-content {
    .search-section {
      margin-bottom: 16px;

      .search-results {
        margin-top: 8px;
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        background: #fff;

        .result-item {
          display: flex;
          align-items: center;
          padding: 12px;
          cursor: pointer;
          transition: background-color 0.3s;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #f5f7fa;
          }

          .el-icon {
            margin-right: 8px;
            color: #409eff;
          }

          .result-info {
            flex: 1;

            .result-name {
              font-size: 14px;
              font-weight: 600;
              color: #333;
              margin-bottom: 4px;
            }

            .result-address {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }
    }

    .map-section {
      margin-bottom: 16px;

      .map-container {
        width: 100%;
        height: 400px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        overflow: hidden;
      }

      .map-tips {
        display: flex;
        align-items: center;
        margin-top: 8px;
        padding: 8px;
        background: #f0f9ff;
        border-radius: 4px;
        font-size: 12px;
        color: #409eff;

        .el-icon {
          margin-right: 4px;
        }
      }
    }

    .location-info {
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;

      .info-row {
        display: flex;
        margin-bottom: 8px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-weight: 600;
          color: #666;
          min-width: 80px;
        }

        .value {
          color: #333;
          flex: 1;
        }
      }
    }
  }
}
</style>

