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
            <span class="value"
              >{{ selectedLocation.province }} {{ selectedLocation.city }}
              {{ selectedLocation.district }}</span
            >
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
import { ref, watch, nextTick, onUnmounted } from 'vue'
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
let geolocation = null
let isMapInitialized = false
const isManualLocation = ref(false)

// 监听 dialogVisible 变化
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && !isMapInitialized) {
    nextTick(() => {
      initMap()
    })
  } else if (val && isMapInitialized && map) {
    // 地图已存在，只需要重置状态
    mapLoading.value = false
    if (props.defaultLocation.longitude && props.defaultLocation.latitude) {
      const lnglat = [props.defaultLocation.longitude, props.defaultLocation.latitude]
      map.setCenter(lnglat)
      if (marker) {
        marker.setPosition(lnglat)
      } else {
        addMarker(lnglat, props.defaultLocation.address)
      }
    }
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
      plugins: ['AMap.Geocoder', 'AMap.Geolocation']
    })

    // 创建地图实例
    map = new AMap.Map('location-picker-map', {
      zoom: 12,
      // 不设置初始center,让定位控制中心点
      center: props.defaultLocation.longitude && props.defaultLocation.latitude
        ? [props.defaultLocation.longitude, props.defaultLocation.latitude]
        : undefined,
      resizeEnable: true,
      viewMode: '2D',
      showLabel: true,
      showIndoorMap: false,
      mapStyle: 'amap://styles/normal',
      features: ['bg', 'road', 'building', 'point'], // 添加 point 以显示POI标注
      labelzIndex: 110,
      pitch: 0, // 2D模式，倾斜角度为0
      skyColor: '#ffffff' // 设置天空颜色
    })

    // 创建地理编码实例
    geocoder = new AMap.Geocoder({
      radius: 1000,
      extensions: 'all'
    })

    // 创建地点搜索实例（使用地理编码方式，不需要额外的API权限）
    // 注意：使用 Geocoder 的 getLocation 方法进行地址搜索
    placeSearch = {
      search: (keyword, callback) => {
        // 使用地理编码进行地址查询
        geocoder.getLocation(keyword, (status, result) => {
          if (status === 'complete' && result.geocodes && result.geocodes.length > 0) {
            // 转换为 PlaceSearch 格式
            callback('complete', {
              poiList: {
                pois: result.geocodes.map((item, index) => ({
                  name: item.formattedAddress || keyword,
                  address: item.formattedAddress || '',
                  location: item.location,
                  district: item.addressComponent?.district || '',
                  adcode: item.adcode || ''
                }))
              }
            })
          } else {
            callback('error', { info: status })
          }
        })
      }
    }

    // 添加定位控件
    geolocation = new AMap.Geolocation({
      enableHighAccuracy: true, // 是否使用高精度定位
      timeout: 10000, // 超过10秒后停止定位
      maximumAge: 0, // 定位结果缓存0毫秒
      convert: true, // 自动偏移坐标为高德坐标
      showButton: true, // 显示定位按钮
      buttonPosition: 'RB', // 定位按钮停靠位置：右下角
      buttonOffset: new AMap.Pixel(10, 20), // 定位按钮偏移量
      showMarker: false, // 不显示定位标记（我们会用自己的marker）
      showCircle: false, // 不显示定位精度圆圈
      panToLocation: true, // 定位成功后将定位到的位置作为地图中心点
      zoomToAccuracy: false, // 不自动调整视野
      extensions: 'all', // 返回地址信息
      noIpLocate: 0 // 启用IP定位作为备用
    })

    map.addControl(geolocation)

    // 监听定位按钮点击事件（通过 DOM 事件监听）
    setTimeout(() => {
      const buttonDom = document.querySelector('.amap-geolocation-con')
      if (buttonDom) {
        buttonDom.addEventListener('click', () => {
          console.log('LocationPicker 手动点击定位按钮')
          isManualLocation.value = true
        })
      }
    }, 1000)

    // 监听定位成功事件
    geolocation.on('complete', async (result) => {
      console.log('LocationPicker 定位成功:', result)
      const position = result.position
      const lnglat = [position.lng, position.lat]

      // 使用 await 确保顺序执行
      await addMarker(lnglat)
      await reverseGeocode(lnglat)

      map.setCenter(lnglat)
      setTimeout(() => {
        if (map) {
          map.setZoom(16)
        }
      }, 100)

      // 只有手动触发的定位才显示成功提示
      if (isManualLocation.value) {
        ElMessage.success('定位成功')
        isManualLocation.value = false
      }
    })

    // 监听定位失败事件
    geolocation.on('error', (error) => {
      console.warn('LocationPicker 定位失败:', error)

      // 只有手动触发的定位才显示错误提示
      if (isManualLocation.value) {
        ElMessage.error('定位失败：' + (error.message || '请检查定位权限'))
        isManualLocation.value = false
      }

      // 定位失败时,如果有默认位置就使用默认位置,否则设置为北京
      if (props.defaultLocation.longitude && props.defaultLocation.latitude) {
        const lnglat = [props.defaultLocation.longitude, props.defaultLocation.latitude]
        map.setCenter(lnglat)
        addMarker(lnglat, props.defaultLocation.address)
      } else {
        const defaultCenter = [116.397428, 39.90923]
        map.setCenter(defaultCenter)
      }

      setTimeout(() => {
        if (map) {
          map.setZoom(12)
        }
      }, 100)
    })

    // 如果已有默认位置，添加标记
    if (props.defaultLocation.longitude && props.defaultLocation.latitude) {
      addMarker(
        [props.defaultLocation.longitude, props.defaultLocation.latitude],
        props.defaultLocation.address
      )
    } else {
      // 没有默认位置时，触发自动定位
      setTimeout(() => {
        if (geolocation) {
          geolocation.getCurrentPosition()
        }
      }, 500)
    }

    // 地图点击事件
    map.on('click', handleMapClick)

    mapLoading.value = false
    isMapInitialized = true
    console.log('LocationPicker 地图初始化完成')
  } catch (error) {
    console.error('地图初始化失败:', error)
    ElMessage.error('地图加载失败，请刷新页面重试')
    mapLoading.value = false
    isMapInitialized = false
  }
}

// 地图点击事件
const handleMapClick = async (e) => {
  console.log('LocationPicker 地图点击:', e.lnglat)
  const lnglat = [e.lnglat.lng, e.lnglat.lat]

  try {
    await addMarker(lnglat)
    await reverseGeocode(lnglat)
  } catch (error) {
    console.error('LocationPicker 地图点击处理失败:', error)
  }
}

// 添加标记
const addMarker = (lnglat, title = '') => {
  return new Promise((resolve) => {
    console.log('LocationPicker addMarker:', { lnglat, title })

    if (marker) {
      marker.setPosition(lnglat)
      if (title) {
        marker.setTitle(title)
      }
      resolve()
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
        console.log('LocationPicker 标记拖动结束:', lnglat)
        try {
          await reverseGeocode(lnglat)
        } catch (error) {
          console.error('LocationPicker 标记拖动逆地理编码失败:', error)
        }
      })

      resolve()
    }
  })
}

// 逆地理编码：根据坐标获取地址
const reverseGeocode = (lnglat) => {
  return new Promise((resolve, reject) => {
    if (!geocoder) {
      console.error('LocationPicker geocoder 未初始化')
      ElMessage.warning('地图组件未就绪，请稍候再试')
      reject(new Error('geocoder 未初始化'))
      return
    }

    console.log('LocationPicker 开始逆地理编码:', lnglat)

    try {
      geocoder.getAddress(lnglat, (status, result) => {
        console.log('LocationPicker 逆地理编码结果:', { status, result })

        if (status === 'complete' && result.regeocode) {
          const regeocode = result.regeocode
          const addressComponent = regeocode.addressComponent
          console.log('LocationPicker 地址组件:', addressComponent)

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

          console.log('LocationPicker 位置信息已更新:', selectedLocation.value)
          resolve(selectedLocation.value)
        } else {
          console.warn('LocationPicker 逆地理编码失败:', status, result)
          ElMessage.warning('获取地址信息失败，请重试')
          reject(new Error('逆地理编码失败: ' + status))
        }
      })
    } catch (error) {
      console.error('LocationPicker 逆地理编码异常:', error)
      ElMessage.error('获取地址信息失败: ' + error.message)
      reject(error)
    }
  })
}

// 地址搜索
const handleAddressSearch = () => {
  const keyword = searchAddress.value.trim()
  if (!keyword) {
    searchResults.value = []
    return
  }

  if (!placeSearch) {
    ElMessage.warning('地图未初始化完成，请稍候再试')
    return
  }

  placeSearch.search(keyword, (status, result) => {
    console.log('搜索结果:', status, result)
    if (status === 'complete' && result.poiList && result.poiList.pois) {
      searchResults.value = result.poiList.pois.map((poi, index) => ({
        id: index,
        name: poi.name,
        address: poi.address || poi.district || '',
        location: poi.location,
        district: poi.district || '',
        adcode: poi.adcode || ''
      }))

      if (searchResults.value.length === 0) {
        ElMessage.info('未找到相关位置，请尝试更具体的地址')
      } else {
        console.log(`找到 ${searchResults.value.length} 个位置`)
      }
    } else {
      searchResults.value = []
      // 不显示错误提示，因为用户可能还在输入
      console.log('搜索状态:', status)
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

  // 只清理标记，保留地图实例以便复用
  if (marker && map) {
    map.remove(marker)
    marker = null
  }

  // 注意：不再销毁地图，而是复用它以减少重复加载
  // 地图会在组件卸载时统一清理
}

// 组件卸载时清理资源
onUnmounted(() => {
  try {
    if (marker && map) {
      map.remove(marker)
    }
    if (map) {
      map.destroy()
    }
  } catch (error) {
    console.error('清理地图资源失败:', error)
  } finally {
    marker = null
    map = null
    geocoder = null
    placeSearch = null
    AMap = null
    isMapInitialized = false
  }
})
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
