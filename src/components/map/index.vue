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
          <span class="filter-count">{{ 0 }}</span>
        </div>
        <div class="filter-row">
          <span class="filter-label">户型</span>
          <div class="filter-buttons">
            <el-button size="small" type="primary">全部</el-button>
            <el-button size="small">一居</el-button>
            <el-button size="small">二居</el-button>
            <el-button size="small">三居</el-button>
            <el-button size="small">四居+</el-button>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-label">价格</span>
          <div class="filter-buttons">
            <el-button size="small">100万以下</el-button>
            <el-button size="small">100-200万</el-button>
            <el-button size="small">200万以上</el-button>
          </div>
        </div>
        <div class="filter-row">
          <el-icon class="location-icon" title="定位到当前位置">
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
let geocoder = null; // 地理编码对象
let placeSearch = null; // 地点搜索对象

const inputVal = ref("");
const resultList = ref([]);
function inputSearchHandler() {
  const value = inputVal.value.trim();
  if (!value) {
    ElMessage({
      type: "warning",
      message: "请输入搜索内容",
    });
    return;
  }

  placeSearch.search(value, (status, result) => {
    console.log(status, result, "地理搜索结果");
    if (status === "complete" && result.poiList && result.poiList.pois) {
      resultList.value = result.poiList.pois;
      if (result.poiList.pois.length === 0) {
        ElMessage({
          type: "info",
          message: "未找到相关位置",
        });
      }
    } else {
      ElMessage({
        type: "error",
        message: "搜索失败，请重试",
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
      "AMap.Geocoder", // 地理编码
      "AMap.PlaceSearch", // 地点搜索
    ],
  }).then((mapItem) => {
    AMap = mapItem;
    // 创建地图实例
    map = new AMap.Map("container", {
      resizeEnable: true, //是否监控地图容器尺寸变化
      zoom: 6, //初始地图级别
    });
    // 地图搜索
    placeSearch = new AMap.PlaceSearch({
      map: map,
    });
    // 地理编码器（经纬度与地理名称互换）
    geocoder = new AMap.Geocoder({
      radius: 1000,
      // 返回包括小区/兴趣点信息
      extensions: "all",
    });

    // 初始化用户定位
    useGeolocation(AMap, map);
    // 初始化点击事件
    useMapClick(AMap, map, geocoder);
  });
});

// 地图获取用户定位信息
function useGeolocation(AMap, map) {
  isLoading.value = true;

  // 创建定位对象
  geolocation = new AMap.Geolocation({
    enableHighAccuracy: true, //是否使用高精度定位，默认:true
    timeout: 15000, //超过15秒后停止定位，默认：无穷大
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

  geolocation.getCurrentPosition((status, result) => {
    isLoading.value = false;
    if (status === 'complete') {
      console.log('定位成功:', result);
      // 设置地图缩放级别
      map.setZoom(15);
    } else {
      console.error('定位失败:', result);
      ElMessage({
        type: "error",
        message: `定位失败: ${result.message || '请检查定位权限'}`,
      });
      // 定位失败时设置默认位置（北京）
      map.setCenter([116.397428, 39.90923]);
      map.setZoom(10);
    }
  });

  geolocation.on("complete", (evt) => {
    isLoading.value = false;
    console.log(evt, "定位成功事件");
  });

  geolocation.on("error", (err) => {
    isLoading.value = false;
    console.error(err, "定位失败事件");
    ElMessage({
      type: "error",
      message: "定位失败，将显示默认位置",
    });
    // 定位失败时设置默认位置（北京）
    map.setCenter([116.397428, 39.90923]);
    map.setZoom(10);
  });
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

onUnmounted(() => {
  try {
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
    placeSearch = null;
    AMap = null;
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
