<template>
  <div class="map-container" v-loading="isLoading">
    <div id="container" :style="`height: ${mapHW.height}`" ref="mapRef"></div>
  </div>
</template>

<script setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { key_web_js } from "./config.js";
import { ElMessage } from "element-plus";

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

const isLoading = ref(false);

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
    ],
  }).then((mapItem) => {
    AMap = mapItem;
    // 获取当前设备定位
    map = new AMap.Map("container");
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

      // 地理编码器（经纬度与地理名称互换）
      geocoder = new AMap.Geocoder({
        radius: 1000,
        // 返回包括小区/兴趣点信息
        extensions: "all",
      });

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
            const formatted = result.regeocode.formattedAddress;
            const neighborhood =
              addressComponent.neighborhood.name || "未知小区";
            console.log(neighborhood, "?");

            // 创建自定义 InfoWindow（气泡面板）
            const infoWindow = new AMap.InfoWindow({
              content: `
                <div style="font-size: 14px;">
                  <strong>当前位置：</strong><br/>
                  ${formatted}<br/>
                  <strong>小区：</strong>${neighborhood}
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
    });
    mapItem.Geolocation();
  });
});

onUnmounted(() => {
  map.clearInfoWindow(); // 清除地图上的信息窗体
  map.destroy(); // 销毁地图，释放内存
  map = null;
});
</script>

<style lang="scss" scoped>
.map-container {
  position: relative;
}
</style>
