<template>
  <div class="map-container">
    <div id="container" :style="`height: ${mapHW.height}`" ref="mapRef"></div>
  </div>
</template>

<script setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { key_web_js } from "./config.js";

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
let layerCity = null; // 区域图层

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
    ],
  }).then((mapItem) => {
    AMap = mapItem;
    // 获取当前设备定位
    map = new AMap.Map("container");
    map.plugin("AMap.Geolocation", function () {
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
      });
      map.addControl(geolocation);
      geolocation.getCurrentPosition();
      geolocation.on("complete", (evt) => {
        console.log(evt, "定位成功");
      });
      geolocation.on("error", (err) => {
        console.log(err, "定位成失败");
      });

      // 点击地图重新定位
      map.on("click", (evt) => {
        console.log("地图被点击，重新获取定位...", evt);
        geolocation.getCurrentPosition();
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
