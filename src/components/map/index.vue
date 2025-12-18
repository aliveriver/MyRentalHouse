<template>
  <div class="house-map-container">
    <!-- 地图容器 -->
    <div
      class="map-container"
      v-loading="isLoading"
      element-loading-text="正在加载地图..."
    >
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          size="large"
          v-model="inputVal"
          placeholder="请输入小区名、地标、地址"
          class="search-input"
          clearable
          @keydown.enter="inputSearchHandler"
          @clear="inputClearHandler"
        >
          <template #append>
            <el-button :icon="Search" @click="inputSearchHandler" />
          </template>
        </el-input>
        <div class="search-result" v-if="resultList.length">
          <div
            class="search-item"
            v-for="item in resultList"
            @click="clickAddressItem(item)"
            :key="item.id"
          >
            <el-icon><CaretRight /></el-icon>
            <div>
              <p>{{ item.address }}</p>
              <p>{{ item.cityname + item.adname + `（${item.adcode}）` }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 地图主体 -->
      <div id="container" :style="`height: ${mapHW.height}`" ref="mapRef"></div>

      <!-- 底部房源信息栏 -->

      <!-- 房源筛选面板 -->
      <div class="filter-panel">
        <div class="filter-header">
          <span class="filter-title">筛选条件</span>
        </div>
        <div class="filter-row">
          <span class="filter-label">房源总数</span>
          <span class="filter-count">{{ houseCount }}</span>
        </div>
        <div class="filter-row">
          <span class="filter-label">户型</span>
          <div class="filter-buttons">
            <el-button
              size="small"
              :type="filterLayout === '' ? 'primary' : ''"
              @click="handleLayoutFilter('')"
              >全部</el-button
            >
            <el-button
              size="small"
              :type="filterLayout === '一居' ? 'primary' : ''"
              @click="handleLayoutFilter('一居')"
              >一居</el-button
            >
            <el-button
              size="small"
              :type="filterLayout === '二居' ? 'primary' : ''"
              @click="handleLayoutFilter('二居')"
              >二居</el-button
            >
            <el-button
              size="small"
              :type="filterLayout === '三居' ? 'primary' : ''"
              @click="handleLayoutFilter('三居')"
              >三居</el-button
            >
            <el-button
              size="small"
              :type="filterLayout === '四居+' ? 'primary' : ''"
              @click="handleLayoutFilter('四居+')"
              >四居+</el-button
            >
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-label">价格</span>
          <div class="filter-buttons">
            <el-button
              size="small"
              :type="filterPrice === '' ? 'primary' : ''"
              @click="handlePriceFilter('')"
              >全部</el-button
            >
            <el-button
              size="small"
              :type="filterPrice === '100万以下' ? 'primary' : ''"
              @click="handlePriceFilter('100万以下')"
              >100万以下</el-button
            >
            <el-button
              size="small"
              :type="filterPrice === '100-200万' ? 'primary' : ''"
              @click="handlePriceFilter('100-200万')"
              >100-200万</el-button
            >
            <el-button
              size="small"
              :type="filterPrice === '200万以上' ? 'primary' : ''"
              @click="handlePriceFilter('200万以上')"
              >200万以上</el-button
            >
          </div>
        </div>
        <div class="filter-row">
          <el-icon
            class="location-icon"
            title="定位到当前位置"
            @click="handleLocationClick"
          >
            <Location />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { key_web_js } from "./config.js";
import { ElMessage } from "element-plus";
import { Search, CaretRight, Location } from "@element-plus/icons-vue";
import { propertiesApi } from "@/api/index";

const router = useRouter();
const isLoading = ref(false);
const mapRef = ref(null);
const mapHW = reactive({
  width: "100%",
  height: "100%",
});

// 显示地图行政区的深度
const DEPTH = {
  province: 0, // 省
  city: 1, // 市
  country: 2, // 县、区
};

let AMap = null; // 高德地图对象
let map = null; // 地图实例
let geolocation = null; // 定位对象
let geocoder = null; // 地理编码对象（用于地址搜索和逆地理编码）
let houseMarkers = []; // 房源标记数组

const inputVal = ref("");
const resultList = ref([]);
const houseCount = ref(0); // 房源总数
const filterLayout = ref(''); // 户型筛选
const filterPrice = ref(''); // 价格筛选
const allHouses = ref([]); // 所有房源数据
const allMarkers = ref([]); // 所有标记数据
const centerPoint = ref(null); // 地图中心点坐标 [lng, lat]
const searchRadius = 10; // 搜索半径（公里）
let isLoadingMarkers = false; // 标记是否正在加载房源，防止重复调用
let loadMarkersTimer = null; // 防抖定时器
const isManualLocation = ref(false); // 是否为手动触发定位
function inputSearchHandler() {
  const value = inputVal.value.trim();
  if (!value) {
    ElMessage({
      type: "warning",
      message: "请输入搜索内容",
    });
    return;
  }

  if (!geocoder) {
    ElMessage({
      type: "warning",
      message: "地图未初始化完成，请稍候再试",
    });
    return;
  }

  // 使用地理编码进行地址搜索（不需要额外的API权限）
  geocoder.getLocation(value, (status, result) => {
    console.log(status, result, "地理搜索结果");
    if (status === "complete" && result.geocodes && result.geocodes.length > 0) {
      // 转换为搜索结果格式
      resultList.value = result.geocodes.map((item) => ({
        name: item.formattedAddress || value,
        address: item.formattedAddress || '',
        location: item.location,
        cityname: item.addressComponent?.city || item.addressComponent?.province || '',
        adname: item.addressComponent?.district || '',
        adcode: item.adcode || '',
        id: item.adcode || Math.random()
      }));

      if (resultList.value.length === 0) {
        ElMessage({
          type: "info",
          message: "未找到相关位置，请尝试更具体的地址",
        });
      }
    } else {
      ElMessage({
        type: "warning",
        message: "未找到相关位置，请尝试其他关键词",
      });
      resultList.value = [];
    }
  });
}
function inputClearHandler() {
  resultList.value = [];
}
// 点击搜索项
function clickAddressItem(address) {
  const { location } = address;
  console.log('点击的地址信息:', address);

  if (location && location.lng && location.lat) {
    const lnglat = [parseFloat(location.lng), parseFloat(location.lat)];
    console.log('定位坐标:', lnglat);

    // 设置地图中心点和缩放级别
    map.setCenter(lnglat);
    map.setZoom(15); // 设置合适的缩放级别

    // 清除之前的信息窗口
    map.clearInfoWindow();

    // 添加标记点
    const marker = new AMap.Marker({
      position: lnglat,
      title: address.name || address.address
    });
    map.add(marker);

    // 创建自定义 InfoWindow（气泡面板）
    const infoWindow = new AMap.InfoWindow({
      content: `
        <div style="font-size: 14px; padding: 10px;">
          <strong>${address.name || '位置信息'}</strong><br/>
          <div style="margin-top: 5px;">
            地址：${address.address || '暂无地址信息'}<br/>
            ${address.cityname ? `城市：${address.cityname}` : ''}
            ${address.adname ? ` ${address.adname}` : ''}
            ${address.adcode ? `（${address.adcode}）` : ''}
          </div>
        </div>
      `,
      offset: new AMap.Pixel(0, -30),
    });

    infoWindow.open(map, lnglat);
    resultList.value = []; // 清空搜索结果列表
    inputVal.value = ''; // 清空输入框

    // 更新中心点并重新加载附近房源
    centerPoint.value = lnglat;
    console.log('搜索更新中心点:', centerPoint.value);
    if (AMap && map && geocoder) {
      loadHouseMarkers(AMap, map, geocoder);
    }
  } else {
    console.error('位置信息无效:', address);
    ElMessage({
      type: "warning",
      message: "该位置无法定位，请选择其他位置",
    });
  }
}

onMounted(() => {
  const { top } = mapRef.value?.getBoundingClientRect();
  mapHW.height = `calc(100vh - ${top}px - 50px)`;

  // https://lbs.amap.com/api/javascript-api/reference/map
  AMapLoader.load({
    key: key_web_js, // 开发应用的 ID
    version: "2.0", // JSAPI 版本
    plugins: [
      "AMap.Scale", // 比例尺
      "AMap.Geolocation", // 定位插件
      "AMap.Geocoder", // 地理编码（用于地址搜索和逆地理编码）
    ],
  }).then((mapItem) => {
    AMap = mapItem;
    // 创建地图实例
    map = new AMap.Map("container", {
      resizeEnable: true, //是否监控地图容器尺寸变化
      zoom: 10, //初始地图级别
      viewMode: '2D', // 2D模式
      // 性能优化配置
      willReadFrequently: true, // 优化频繁读取canvas的性能
      showLabel: true, // 显示文字标记
      showIndoorMap: false, // 关闭室内地图
      mapStyle: 'amap://styles/normal', // 使用标准样式
      features: ['bg', 'road', 'building', 'point'], // 指定显示的地图要素
      labelzIndex: 110, // 标注层级
      pitch: 0 // 倾斜角度
    });

    // 地理编码器（经纬度与地理名称互换，也用于地址搜索）
    geocoder = new AMap.Geocoder({
      radius: 1000,
      // 返回包括小区/兴趣点信息
      extensions: "all",
    });

    // 等待地图完全加载
    map.on('complete', () => {
      console.log('地图加载完成，开始初始化功能');
      // 初始化用户定位
      useGeolocation(AMap, map);
      // 初始化点击事件
      useMapClick(AMap, map, geocoder);
      // 注意：不在这里加载房源标记，等定位完成后再加载
    });
  });
});

// 地图获取用户定位信息
function useGeolocation(AMap, map) {
  // 创建定位对象
  geolocation = new AMap.Geolocation({
    enableHighAccuracy: true, //是否使用高精度定位，默认:true
    timeout: 10000, //超过10秒后停止定位
    maximumAge: 0, //定位结果缓存0毫秒，默认：0
    convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
    showButton: true, //显示定位按钮，默认：true
    buttonPosition: "LB", //定位按钮停靠位置，默认：'LB'，左下角
    buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
    showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
    showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
    panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
    zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
    extensions: "all", // 返回地址信息，默认：base
  });

  map.addControl(geolocation);

  // 只使用事件监听，避免重复触发
  geolocation.on("complete", (evt) => {
    isLoading.value = false;
    console.log('定位成功:', evt);

    // 更新中心点
    if (evt.position) {
      centerPoint.value = [evt.position.lng, evt.position.lat];
      console.log('当前定位中心点:', centerPoint.value);

      // 设置地图缩放
      setTimeout(() => {
        if (map) {
          map.setZoom(15);
        }
      }, 100);

      // 加载附近房源
      if (AMap && map && geocoder) {
        loadHouseMarkers(AMap, map, geocoder);
      }

      // 只有手动触发的定位才显示成功提示
      if (isManualLocation.value) {
        ElMessage.success('定位成功');
        isManualLocation.value = false;
      }
    }
  });

  geolocation.on("error", (err) => {
    isLoading.value = false;
    console.warn('定位失败:', err);

    // 只有手动触发的定位才显示错误提示
    if (isManualLocation.value) {
      ElMessage.error('定位失败：' + (err.message || '请检查定位权限'));
      isManualLocation.value = false;
    }

    // 设置默认位置（北京）
    const defaultCenter = [116.397428, 39.90923];
    map.setCenter(defaultCenter);
    centerPoint.value = defaultCenter;

    setTimeout(() => {
      if (map) {
        map.setZoom(10);
      }
    }, 100);

    // 加载默认位置附近的房源
    if (AMap && map && geocoder) {
      loadHouseMarkers(AMap, map, geocoder);
    }
  });

  // 触发自动定位
  isLoading.value = true;
  geolocation.getCurrentPosition();
}

// 地图点击事件
function useMapClick(AMap, map, geocoder) {
  // 添加定位标记
  let marker = new AMap.Marker();
  // 点击地图定位
  map.on("click", (e) => {
    console.log('地图点击事件:', e);
    const lnglat = [e.lnglat.lng, e.lnglat.lat];

    // 清除之前的标记
    map.remove(marker);
    // 设置定位标记和位置
    marker = new AMap.Marker({
      position: lnglat,
      title: '点击位置'
    });
    map.add(marker);

    // 逆地理编码
    geocoder.getAddress(lnglat, (status, result) => {
      console.log(status, result, "逆地理编码结果");
      if (status === "complete" && result.regeocode) {
        const addressComponent = result.regeocode.addressComponent;
        const {
          province,
          district,
          street,
          township,
          neighborhood,
          streetNumber,
          adcode,
        } = addressComponent;
        console.log(result, "逆地理地址解析");

        // 构建地址字符串
        const addressParts = [
          province,
          district,
          street,
          township,
          neighborhood,
          streetNumber
        ].filter(part => part && part.trim()); // 过滤空值

        const fullAddress = addressParts.join('') || '未知位置';

        // 创建自定义 InfoWindow（气泡面板）
        const infoWindow = new AMap.InfoWindow({
          content: `
            <div style="font-size: 14px; padding: 10px;">
              <strong>点击位置</strong><br/>
              <div style="margin-top: 5px;">
                地址：${fullAddress}<br/>
                区域代码：${adcode || '未知'}<br/>
                坐标：${lnglat[0].toFixed(6)}, ${lnglat[1].toFixed(6)}
              </div>
            </div>
          `,
          offset: new AMap.Pixel(0, -30),
        });

        infoWindow.open(map, lnglat);
      } else {
        console.warn("获取地址失败", result);
        // 即使逆地理编码失败，也显示基本信息
        const infoWindow = new AMap.InfoWindow({
          content: `
            <div style="font-size: 14px; padding: 10px;">
              <strong>点击位置</strong><br/>
              <div style="margin-top: 5px;">
                坐标：${lnglat[0].toFixed(6)}, ${lnglat[1].toFixed(6)}<br/>
                <span style="color: #999;">地址信息获取失败</span>
              </div>
            </div>
          `,
          offset: new AMap.Pixel(0, -30),
        });
        infoWindow.open(map, lnglat);
      }
    });
  });
}

// 计算两点之间的距离（单位：公里）
function calculateDistance(lng1, lat1, lng2, lat2) {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 加载房源标记
async function loadHouseMarkers(AMap, map, geocoder) {
  // 防抖：清除之前的定时器
  if (loadMarkersTimer) {
    clearTimeout(loadMarkersTimer);
  }

  // 如果正在加载，跳过本次调用
  if (isLoadingMarkers) {
    console.log('⏸️ 房源正在加载中，跳过重复调用');
    return;
  }

  // 设置防抖定时器，500ms 后执行
  loadMarkersTimer = setTimeout(async () => {
    try {
      isLoadingMarkers = true;
      console.log('开始获取房源列表...');
      console.log('地图实例:', map);
      console.log('地理编码器:', geocoder);

      // 检查是否有中心点
      if (!centerPoint.value) {
        console.warn('中心点未设置，等待定位完成...');
        isLoadingMarkers = false;
        return;
      }

    console.log(`当前中心点: [${centerPoint.value[0]}, ${centerPoint.value[1]}]`);
    console.log(`搜索半径: ${searchRadius}公里`);

    // 获取房源列表（买家只能看到"在售"状态的房源）
    const response = await propertiesApi.getAllProperties({
      page: 1,
      size: 10000,  // 获取足够多的房源
      status: '在售'  // 只获取在售状态的房源
    });

    console.log('房源API完整响应:', response);
    console.log('response.success:', response?.success);
    console.log('response.data:', response?.data);
    console.log('response.data类型:', Array.isArray(response?.data));
    console.log('response.data长度:', response?.data?.length);

    // 检查响应格式
    if (!response) {
      console.error('API响应为空');
      ElMessage.error('获取房源数据失败：响应为空');
      return;
    }

    if (!response.success) {
      console.error('API返回失败:', response.errorMsg || response.message);
      ElMessage.error('获取房源数据失败：' + (response.errorMsg || response.message || '未知错误'));
      return;
    }

    // 处理不同的数据格式
    let houses = [];
    if (Array.isArray(response.data)) {
      houses = response.data;
    } else if (response.data && Array.isArray(response.data.list)) {
      houses = response.data.list;
    } else if (response.data && Array.isArray(response.data.data)) {
      houses = response.data.data;
    } else {
      console.error('无法识别的数据格式:', response.data);
      ElMessage.error('房源数据格式错误');
      return;
    }

    console.log(`✅ 获取到 ${houses.length} 个房源`);

    if (houses.length === 0) {
      houseCount.value = 0;
      allHouses.value = [];
      console.log('❌ 没有可显示的房源');
      ElMessage.info('当前没有"在售"状态的房源');
      return;
    }

    // 过滤出距离中心点10公里以内的房源
    const nearbyHouses = [];
    const [centerLng, centerLat] = centerPoint.value;

    for (const house of houses) {
      // 获取房源坐标（兼容不同字段名）
      const getLongitude = (h) => h.longitude !== undefined && h.longitude !== null ? h.longitude : (h.Longitude !== undefined && h.Longitude !== null ? h.Longitude : null);
      const getLatitude = (h) => h.latitude !== undefined && h.latitude !== null ? h.latitude : (h.Latitude !== undefined && h.Latitude !== null ? h.Latitude : null);

      const lon = getLongitude(house);
      const lat = getLatitude(house);
      const lonNum = lon != null ? parseFloat(lon) : NaN;
      const latNum = lat != null ? parseFloat(lat) : NaN;

      // 如果有坐标，计算距离
      if (!isNaN(lonNum) && !isNaN(latNum) && lonNum !== 0 && latNum !== 0) {
        const distance = calculateDistance(centerLng, centerLat, lonNum, latNum);
        if (distance <= searchRadius) {
          nearbyHouses.push(house);
        }
      } else {
        // 如果没有坐标，也加入列表（后续通过地址编码判断）
        nearbyHouses.push(house);
      }
    }

    console.log(`筛选出 ${nearbyHouses.length}/${houses.length} 个在${searchRadius}公里范围内的房源`);

    if (nearbyHouses.length === 0) {
      houseCount.value = 0;
      allHouses.value = [];
      ElMessage.info(`附近${searchRadius}公里内没有在售房源`);
      return;
    }

    // 使用过滤后的房源列表
    houses = nearbyHouses;

    // 打印前几个房源的信息用于调试（包含定位信息）
    console.log('🔍 前3个房源详细信息:', houses.slice(0, 3).map(h => {
      // 兼容多种字段名格式（大小写）
      const lon = h.longitude !== undefined ? h.longitude : (h.Longitude !== undefined ? h.Longitude : null);
      const lat = h.latitude !== undefined ? h.latitude : (h.Latitude !== undefined ? h.Latitude : null);
      return {
        id: h.propertyid,
        title: h.title,
        address: h.address,
        longitude: lon,
        latitude: lat,
        province: h.province || h.Province,
        city: h.city || h.City,
        district: h.district || h.District,
        street: h.street || h.Street,
        status: h.status || h.Status
      };
    }));

    // 统计有坐标的房源数量（兼容多种字段名格式）
    const housesWithCoordinates = houses.filter(h => {
      const lon = h.longitude !== undefined ? h.longitude : (h.Longitude !== undefined ? h.Longitude : null);
      const lat = h.latitude !== undefined ? h.latitude : (h.Latitude !== undefined ? h.Latitude : null);
      const lonNum = lon != null ? parseFloat(lon) : NaN;
      const latNum = lat != null ? parseFloat(lat) : NaN;
      return !isNaN(lonNum) && !isNaN(latNum) && lonNum !== 0 && latNum !== 0;
    });
    console.log(`📊 有坐标的房源数量: ${housesWithCoordinates.length}/${houses.length}`);
    if (housesWithCoordinates.length > 0) {
      console.log('✅ 有坐标的房源列表:', housesWithCoordinates.slice(0, 5).map(h => {
        const lon = h.longitude !== undefined ? h.longitude : (h.Longitude !== undefined ? h.Longitude : null);
        const lat = h.latitude !== undefined ? h.latitude : (h.Latitude !== undefined ? h.Latitude : null);
        return {
          id: h.propertyid,
          title: h.title,
          longitude: parseFloat(lon),
          latitude: parseFloat(lat)
        };
      }));
    } else {
      console.warn('⚠️ 没有找到任何有坐标的房源，所有房源将使用地址编码');
      console.log('📋 房源字段示例（第1个）:', houses.length > 0 ? Object.keys(houses[0]) : []);
    }

    allHouses.value = houses; // 保存所有房源数据
    houseCount.value = houses.length; // 更新房源总数
    console.log(`🚀 开始加载 ${houses.length} 个房源的标记...`);

    // 清除之前的标记
    clearAllMarkers();

    // 批量处理房源地址地理编码（减少并发数，避免API限制）
    const batchSize = 2; // 每批处理2个，避免高德API限流
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < houses.length; i += batchSize) {
      const batch = houses.slice(i, i + batchSize);
      console.log(`📦 处理第 ${i + 1}-${Math.min(i + batchSize, houses.length)} 个房源...`);
      console.log(`  房源列表: ${batch.map(h => h.title).join(', ')}`);

      // 为每个 Promise 添加超时保护（10秒超时）
      const resultsPromises = batch.map((house, index) => {
        const housePromise = addHouseMarker(AMap, map, geocoder, house);
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.warn(`  ⏰ 房源 "${house.title}" 处理超时（10秒）`);
            resolve(false);
          }, 10000);
        });
        return Promise.race([housePromise, timeoutPromise]);
      });

      const results = await Promise.all(resultsPromises);

      const batchSuccess = results.filter(r => r === true).length;
      const batchFail = results.filter(r => r === false).length;
      successCount += batchSuccess;
      failCount += batchFail;

      console.log(`  ✓ 批次完成: 成功 ${batchSuccess}, 失败 ${batchFail}`);
      console.log(`  累计进度: ${successCount + failCount}/${houses.length} (成功: ${successCount}, 失败: ${failCount})`);

      // 每批之间稍作延迟，避免请求过快触发API限流
      if (i + batchSize < houses.length) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 增加到500ms
      }
    }

    console.log(`✅ 标记加载完成: 成功 ${successCount} 个, 失败 ${failCount} 个`);
    console.log(`📍 地图标记数组长度: ${houseMarkers.length}`);

    // 等待一小段时间，确保所有标记都已完全渲染到地图上
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`📊 最终统计: 成功创建 ${houseMarkers.length} 个地图标记`);

    if (houseMarkers.length > 0) {
      // 调整地图视图以显示所有标记
      try {
        console.log(`🗺️ 调整地图视图以包含所有标记...`);

        // 使用 setFitView 方法自动调整视图
        map.setFitView(houseMarkers, false, [80, 80, 80, 80], 16);

        setTimeout(() => {
          const center = map.getCenter();
          const zoom = map.getZoom();
          console.log(`✅ 地图视图已调整`);
          console.log(`  📍 中心点: [${center.lng.toFixed(6)}, ${center.lat.toFixed(6)}]`);
          console.log(`  🔍 缩放级别: ${zoom}`);
        }, 200);

        ElMessage.success(`✅ 已在地图上显示 ${houseMarkers.length} 个房源`);

        // 如果成功数量少于总数，提示用户
        if (successCount < houses.length) {
          setTimeout(() => {
            ElMessage.warning(`⚠️ ${failCount} 个房源因地址信息不完整未能显示`);
          }, 1000);
        }
      } catch (error) {
        console.error('❌ 调整地图视图失败:', error);
        ElMessage.warning('房源标记已加载，但地图视图调整失败');
      }
    } else {
      ElMessage.warning(`❌ 所有房源的地理定位都失败了，请检查房源地址信息`);
      console.error('⚠️ 所有房源标记都加载失败，可能的原因：');
      console.error('  1. 房源地址格式不正确或不完整');
      console.error('  2. 房源经纬度坐标缺失或无效');
      console.error('  3. 高德地图API地理编码服务异常');
      console.error('  4. 网络连接问题');
    }
    } catch (error) {
      console.error('加载房源标记失败:', error);
      console.error('错误堆栈:', error.stack);
      ElMessage.error('加载房源标记失败: ' + (error.message || '请稍后重试'));
    } finally {
      isLoadingMarkers = false;
    }
  }, 500);
}

// 清除所有标记
function clearAllMarkers() {
  console.log(`🗑️ 清除地图标记，当前数量: ${houseMarkers.length}`);
  if (map && houseMarkers.length > 0) {
    houseMarkers.forEach((marker, index) => {
      try {
        map.remove(marker);
      } catch (e) {
        console.warn(`移除标记 ${index} 失败:`, e);
      }
    });
    houseMarkers = [];
  }
  allMarkers.value = [];
  console.log(`✅ 已清除所有标记`);
}

// 为单个房源添加标记
function addHouseMarker(AMap, map, geocoder, house) {
  return new Promise((resolve) => {
    console.log(`  🏠 开始处理房源: ${house.title} (ID: ${house.propertyid || house.id})`);

    if (!AMap || !map || !geocoder) {
      console.error('  ❌ 地图组件未初始化:', { AMap: !!AMap, map: !!map, geocoder: !!geocoder });
      resolve(false);
      return;
    }

    // 格式化价格（添加千分位分隔符，单位：元）
    const formatPrice = (price) => {
      if (!price) return '价格面议'
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '元'
    }

    // 创建标记和信息窗口的通用函数
    const createMarkerAndInfoWindow = (lnglat, displayAddress) => {
      try {
        console.log(`🔨 创建标记: ${house.title} at [${lnglat[0]}, ${lnglat[1]}]`);

        const price = formatPrice(house.price);
        const area = house.area ? `${house.area}㎡` : '';
        const layout = house.layout || '';

        // 创建主标记（红色房屋图标）
        const marker = new AMap.Marker({
          position: lnglat,
          title: house.title || '房源',
          anchor: 'bottom-center',
          zIndex: 100,
          visible: true,
          clickable: true,
          offset: new AMap.Pixel(0, 0),
          // 使用自定义图标（红色大标记）
          icon: new AMap.Icon({
            size: new AMap.Size(36, 36),
            image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
            imageSize: new AMap.Size(36, 36)
          })
        });

        // 确保标记可见
        marker.show();

        const address = displayAddress || house.address || house.district || '';

        // 创建信息窗口内容
        const infoWindow = new AMap.InfoWindow({
          content: `
            <div style="padding: 15px; font-size: 14px; min-width: 280px; max-width: 320px;">
              <div style="font-weight: 600; font-size: 18px; margin-bottom: 12px; color: #333; border-bottom: 2px solid #f56c6c; padding-bottom: 10px;">
                ${(house.title || '房源信息').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              </div>
              <div style="color: #666; line-height: 2;">
                ${price ? `<div style="margin-bottom: 8px;"><span style="color: #999; margin-right: 8px;">💰 价格：</span><span style="color: #f56c6c; font-weight: 600; font-size: 18px;">${price}</span></div>` : ''}
                ${area ? `<div style="margin-bottom: 8px;"><span style="color: #999; margin-right: 8px;">📐 面积：</span>${area}</div>` : ''}
                ${layout ? `<div style="margin-bottom: 8px;"><span style="color: #999; margin-right: 8px;">🏠 户型：</span>${layout}</div>` : ''}
                ${house.orientation ? `<div style="margin-bottom: 8px;"><span style="color: #999; margin-right: 8px;">🧭 朝向：</span>${house.orientation}</div>` : ''}
                ${house.floor ? `<div style="margin-bottom: 8px;"><span style="color: #999; margin-right: 8px;">🏢 楼层：</span>${house.floor}</div>` : ''}
                <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #eee; color: #666; font-size: 13px;">
                  📍 ${address.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
                <div style="margin-top: 15px;">
                  <button
                    onclick="window.openHouseDetail(${house.propertyid || house.id})"
                    style="
                      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
                      color: white;
                      border: none;
                      padding: 10px 20px;
                      border-radius: 6px;
                      cursor: pointer;
                      font-size: 14px;
                      width: 100%;
                      font-weight: 500;
                      box-shadow: 0 2px 4px rgba(64,158,255,0.3);
                    "
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(64,158,255,0.4)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(64,158,255,0.3)'"
                  >
                    🔍 查看详情
                  </button>
                </div>
              </div>
            </div>
          `,
          offset: new AMap.Pixel(0, -30),
          closeWhenClickMap: true
        });

        // 点击标记显示信息窗口
        marker.on('click', () => {
          console.log(`🖱️ 点击了房源标记: ${house.title}`);
          infoWindow.open(map, lnglat);
        });

        // 将标记添加到地图
        map.add(marker);
        houseMarkers.push(marker);
        allMarkers.value.push({ marker, house });

        console.log(`✅ 成功添加标记: ${house.title}, 当前总标记数: ${houseMarkers.length}`);
        resolve(true);
      } catch (error) {
        console.error(`❌ 添加标记失败 [${house.title}]:`, error);
        resolve(false);
      }
    }

    // 优先使用经纬度坐标定位（最准确）
    // 兼容多种字段名格式：longitude/Longitude, latitude/Latitude
    const getLongitude = (house) => {
      // 优先使用小写字段名
      if (house.longitude !== undefined && house.longitude !== null) return house.longitude;
      // 其次使用大写字段名
      if (house.Longitude !== undefined && house.Longitude !== null) return house.Longitude;
      return null;
    };

    const getLatitude = (house) => {
      // 优先使用小写字段名
      if (house.latitude !== undefined && house.latitude !== null) return house.latitude;
      // 其次使用大写字段名
      if (house.Latitude !== undefined && house.Latitude !== null) return house.Latitude;
      return null;
    };

    const lon = getLongitude(house);
    const lat = getLatitude(house);

    // 检查坐标是否存在并有效（处理数字和字符串类型）
    const lonNum = lon != null ? parseFloat(lon) : NaN;
    const latNum = lat != null ? parseFloat(lat) : NaN;
    const hasCoordinates = !isNaN(lonNum) && !isNaN(latNum) &&
                           lonNum !== 0 && latNum !== 0 &&
                           lonNum >= -180 && lonNum <= 180 &&
                           latNum >= -90 && latNum <= 90;

    if (hasCoordinates) {
      const lnglat = [lonNum, latNum];
      console.log(`  ✓ 使用坐标定位: ${house.title} -> [${lonNum.toFixed(6)}, ${latNum.toFixed(6)}]`);
      const address = house.address || house.Address ||
        ((house.province || house.Province) && (house.city || house.City) && (house.district || house.District)
          ? `${house.province || house.Province}${house.city || house.City}${house.district || house.District}${house.street || house.Street || ''}`
          : house.district || house.District || '');
      // 注意：这里直接调用，createMarkerAndInfoWindow 会在内部 resolve
      createMarkerAndInfoWindow(lnglat, address);
      return; // 这里 return 后，Promise 会由 createMarkerAndInfoWindow 来 resolve
    } else {
      console.log(`  ⚠️ 房源 "${house.title}" 没有有效坐标 (lon: ${lon}, lat: ${lat})，将使用地址编码`);
    }

    // 如果没有坐标，使用地址进行地理编码
    const address = house.address || house.Address || house.district || house.District || '';
    if (!address) {
      console.warn(`  ❌ 房源 ${house.propertyid || house.id} (${house.title}) 没有地址信息和坐标，跳过`);
      resolve(false);
      return;
    }

    // 构建完整地址（如果有结构化地址信息）
    let fullAddress = address;
    const province = house.province || house.Province || '';
    const city = house.city || house.City || '';
    const district = house.district || house.District || '';
    const street = house.street || house.Street || '';

    if (!address && province && city && district) {
      fullAddress = `${province}${city}${district}${street}`;
    } else if (!address.includes('市') && !address.includes('省')) {
      // 如果地址不完整，尝试添加城市或省份前缀
      if (city) {
        fullAddress = city + address;
      } else if (province) {
        fullAddress = province + address;
      }
    }

    console.log(`  🌐 开始地理编码: ${house.title} - ${fullAddress}`);

    // 地理编码：将地址转换为经纬度
    try {
      geocoder.getLocation(fullAddress, (status, result) => {
        try {
          if (status === 'complete' && result && result.geocodes && result.geocodes.length > 0) {
            const location = result.geocodes[0].location;
            if (!location || !location.lng || !location.lat) {
              console.warn(`  ❌ 房源 "${house.title}" 地理编码返回的坐标无效:`, location);
              resolve(false);
              return;
            }

            const lnglat = [location.lng, location.lat];
            console.log(`  ✅ 地理编码成功: ${house.title} -> [${lnglat[0].toFixed(6)}, ${lnglat[1].toFixed(6)}]`);
            createMarkerAndInfoWindow(lnglat, fullAddress);
            // resolve 已在 createMarkerAndInfoWindow 中调用
          } else {
            console.warn(`  ❌ 房源 "${house.title}" (${fullAddress}) 地理编码失败:`, {
              status,
              message: result?.info || result?.message || '未知错误'
            });
            resolve(false);
          }
        } catch (error) {
          console.error(`  ❌ 地理编码回调处理异常 [${house.title}]:`, error);
          resolve(false);
        }
      });
    } catch (error) {
      console.error(`  ❌ 地理编码调用异常 [${house.title}]:`, error);
      resolve(false);
    }
  });
}

// 筛选功能
function handleLayoutFilter(layout) {
  filterLayout.value = filterLayout.value === layout ? '' : layout;
  applyFilters();
}

function handlePriceFilter(price) {
  filterPrice.value = filterPrice.value === price ? '' : price;
  applyFilters();
}

function handleLocationClick() {
  if (geolocation) {
    isLoading.value = true;
    isManualLocation.value = true; // 标记为手动触发
    geolocation.getCurrentPosition();
  }
}

// 应用筛选条件
function applyFilters() {
  // 清除当前所有标记
  clearAllMarkers();

  // 筛选房源
  let filteredHouses = allHouses.value;

  // 户型筛选
  if (filterLayout.value) {
    filteredHouses = filteredHouses.filter(house => {
      const layout = house.layout || '';
      if (filterLayout.value === '四居+') {
        return layout.includes('四') || layout.includes('5') || layout.includes('6') || layout.includes('7') || layout.includes('8');
      }
      return layout.includes(filterLayout.value);
    });
  }

  // 价格筛选
  if (filterPrice.value) {
    filteredHouses = filteredHouses.filter(house => {
      const price = house.price || 0;
      if (filterPrice.value === '100万以下') {
        return price < 1000000;
      } else if (filterPrice.value === '100-200万') {
        return price >= 1000000 && price <= 2000000;
      } else if (filterPrice.value === '200万以上') {
        return price > 2000000;
      }
      return true;
    });
  }

  // 更新房源总数
  houseCount.value = filteredHouses.length;

  // 重新加载筛选后的房源标记
  if (AMap && map && geocoder) {
    loadFilteredMarkers(AMap, map, geocoder, filteredHouses);
  }
}

// 加载筛选后的房源标记
async function loadFilteredMarkers(AMap, map, geocoder, houses) {
  if (houses.length === 0) {
    ElMessage.info('没有符合条件的房源');
    return;
  }

  console.log(`开始加载 ${houses.length} 个筛选后的房源标记`);
  const batchSize = 5;
  let successCount = 0;

  for (let i = 0; i < houses.length; i += batchSize) {
    const batch = houses.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(house => addHouseMarker(AMap, map, geocoder, house))
    );
    successCount += results.filter(r => r).length;
    if (i + batchSize < houses.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log(`筛选后成功加载 ${houseMarkers.length} 个房源标记`);
  if (houseMarkers.length > 0) {
    ElMessage.success(`已显示 ${houseMarkers.length} 个符合条件的房源`);
  }
}

// 在window对象上添加打开房源详情的函数（供信息窗口中的按钮调用）
if (typeof window !== 'undefined') {
  window.openHouseDetail = (propertyId) => {
    router.push(`/house/detail/${propertyId}`);
  };
}

onUnmounted(() => {
  try {
    // 清除所有房源标记
    clearAllMarkers();

    if (map) {
      map.clearInfoWindow(); // 清除地图上的信息窗体
      map.destroy(); // 销毁地图，释放内存
    }
  } catch (error) {
    console.error('地图销毁时出错:', error);
  } finally {
    map = null;
    geolocation = null;
    geocoder = null;
    AMap = null;
    houseMarkers = [];
    allHouses.value = [];
    allMarkers.value = [];
  }
});
</script>

<style lang="scss" scoped>
.house-map-container {
  width: 100%;
  position: relative;
  display: flex;
  background-color: #f5f5f5;

  .map-container {
    width: 100%;
    height: 100%;
    position: relative;

    .search-box {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 1000;
      width: 350px;

      .search-input {
        position: absolute;
        top: 0;
        left: 0;
      }

      .search-result {
        position: absolute;
        top: 40px;
        width: 100%;
        max-height: 300px;
        overflow-y: auto;
        color: #333;
        background-color: #fefefee0;
        border: 1px solid #ccc;
        border-radius: 4px;

        .search-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;

          div {
            margin-left: 12px;

            p {
              margin: 2px 0;

              &:first-child {
                font-weight: 600;
              }

              &:last-child {
                font-size: 12px;
                color: #999;
              }
            }
          }

          &:hover {
            background-color: #f5f7fa;
          }

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }

    .filter-panel {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      padding: 15px;
      z-index: 1000;
      min-width: 200px;
      max-width: 280px;

      .filter-header {
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;

        .filter-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }

      .filter-row {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
          text-align: center;
        }

        .filter-label {
          display: block;
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .filter-count {
          font-size: 14px;
          font-weight: 600;
          color: #409eff;
        }

        .filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .location-icon {
          color: #409eff;
          cursor: pointer;
          font-size: 20px;

          &:hover {
            color: #66b1ff;
          }
        }
      }
    }

    .house-cards {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      height: 160px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      overflow-x: auto;
      display: flex;
      gap: 15px;
      padding: 20px;
      z-index: 1000;

      .house-card {
        flex-shrink: 0;
        width: 300px;
        display: flex;
        gap: 15px;
        cursor: pointer;

        &:hover {
          background-color: #f5f7fa;
        }

        .house-image {
          width: 120px;
          height: 90px;
          border-radius: 4px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .house-info {
          flex: 1;

          .house-title {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #333;
          }

          .house-details {
            font-size: 14px;
            color: #666;
            margin-bottom: 6px;

            span {
              margin-right: 10px;
            }
          }

          .house-location {
            font-size: 12px;
            color: #999;
            margin-bottom: 8px;
          }

          .house-tags {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
          }
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .house-map-container {
    .map-container {
      .search-box {
        width: calc(100vw - 40px);
        left: 20px;
        top: 20px;
      }

      .filter-panel {
        position: fixed;
        top: auto;
        bottom: 200px;
        left: 20px;
        right: 20px;
        min-width: auto;
      }

      .house-cards {
        height: 120px;
        padding: 15px;

        .house-card {
          width: 280px;

          .house-image {
            width: 100px;
            height: 75px;
          }

          .house-info {
            .house-title {
              font-size: 14px;
            }

            .house-details {
              font-size: 12px;
            }

            .house-tags {
              .el-tag {
                font-size: 10px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
