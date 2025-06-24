<template>
  <div
    class="map-container"
    v-loading="isLoading"
    element-loading-text="正在加载地图..."
  >
    <div class="search-box">
      <el-input
        size="large"
        v-model="inputVal"
        placeholder="输入.."
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
        <div class="search-item" v-for="item in resultList">
          <el-icon><CaretRight /></el-icon>
          <div>
            <p>{{ item.address }}</p>
            <p>{{ item.cityname + item.adname + `（${item.adcode}）` }}</p>
          </div>
        </div>
      </div>
    </div>
    <div id="container" :style="`height: ${mapHW.height}`" ref="mapRef"></div>
  </div>
</template>

<script setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { key_web_js } from "./config.js";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";

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
  placeSearch.search(value, (status, result) => {
    console.log(status, result, "地理搜索结果");
    if (status !== "complete") {
      ElMessage({
        type: "error",
        message: "搜索失败",
      });
    }
    resultList.value = result.poiList.pois;
  });
}
function inputClearHandler() {
  resultList.value = [];
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
      "AMap.DistrictLayer", // 定位
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
  map.plugin("AMap.Geolocation", function () {
    isLoading.value = true;
    geolocation = new AMap.Geolocation({
      enableHighAccuracy: true, //是否使用高精度定位，默认:true
      timeout: 10000, //超过10秒后停止定位，默认：无穷大
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
    geolocation.getCurrentPosition();
    geolocation.on("complete", (evt) => {
      isLoading.value = false;
      console.log(evt, "定位成功");
    });
    geolocation.on("error", (err) => {
      isLoading.value = false;
      ElMessage({
        type: "error",
        message: "定位失败",
      });
      console.log(err, "定位成失败");
    });
    // AMap.Geolocation();
  });
}

// 地图点击事件
function useMapClick(AMap, map, geocoder) {
  // 添加定位标记
  let marker = new AMap.Marker();
  // 点击地图定位
  map.on("click", (e) => {
    console.log(e);
    const lnglat = [e.lnglat.lng, e.lnglat.lat];

    // 设置定位标记和位置
    map.add(marker);
    marker.setPosition(lnglat);
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

        // 创建自定义 InfoWindow（气泡面板）
        const infoWindow = new AMap.InfoWindow({
          content: `
                <div style="font-size: 14px;">
                  <strong>当前位置：</strong><br/>
                  ${
                    province +
                    district +
                    street +
                    township +
                    neighborhood +
                    streetNumber +
                    `（${adcode}）`
                  }<br/>
                </div>
              `,
          offset: new AMap.Pixel(0, -30),
        });

        infoWindow.open(map, lnglat);
      } else {
        console.warn("获取地址失败");
      }
    });
  });
}

onUnmounted(() => {
  map.clearInfoWindow(); // 清除地图上的信息窗体
  map.destroy(); // 销毁地图，释放内存
  map = null;
  geolocation = null;
  geocoder = null;
  placeSearch = null;
});
</script>

<style lang="scss" scoped>
.map-container {
  position: relative;
}

.search-box {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  width: 300px;
  .search-input {
    position: absolute;
    top: 0;
    left: 0;
  }
  .search-result {
    position: absolute;
    top: 40px;
    width: 100%;
    height: fit-content;
    color: #333;
    background-color: #fefefee0;
    border: 1px solid #ccc;
    .search-item {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      font-size: 14px;
      cursor: pointer;
      div {
        margin-left: 12px;
      }
      &:hover {
        background-color: #eee;
      }
    }
  }
}
</style>
