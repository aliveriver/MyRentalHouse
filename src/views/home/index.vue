<template>
  <div>
    <el-row :gutter="20" style="align-items: center;">
      <el-col :span="6" style="height: 100%">
        <el-card style="font-size: 14px; height: 100%">
          <template #header>
            <el-row :gutter="20" style="align-items: center;">
              <el-col :span="12">
                <el-avatar :size="30" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              </el-col>
              <el-col :span="12" style="text-align: right;">
                <h2>Admin</h2>
              </el-col>
            </el-row>
          </template>

          <div style="margin-top: 15px; height: 55px">
            <p>登錄時間：0000-00-00</p>
            <p>登錄地點：北京</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card style="width: 100%; font-size: 14px">
          <template #header>
            <h2>6月统计信息</h2>
          </template>
          <el-row :gutter="20" style="align-items: center;">
            <el-col :span="8">
              <el-card>
                <div class="card-item">
                  <div><el-icon size="30">
                      <Expand />
                    </el-icon></div>
                  <div>
                    <p>500</p>
                    <p>商品数量（个）</p>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card>
                <div class="card-item">
                  <div><el-icon size="30">
                      <Expand />
                    </el-icon></div>
                  <div>
                    <p>30547</p>
                    <p>售出数量（个）</p>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card>
                <div class="card-item">
                  <div><el-icon size="30">
                      <Expand />
                    </el-icon></div>
                  <div>
                    <p>15.31</p>
                    <p>售出金额（万）</p>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <div ref="echarts1Ref" class="echartsBox"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div ref="echarts2Ref" class="echartsBox"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { ref, onMounted } from "vue";
const echarts1Ref = ref(null);
const echarts2Ref = ref(null);
onMounted(() => {
  // 1 
  const myChart1 = echarts.init(echarts1Ref.value);
  const option1 = {
    xAxis: {
      type: 'category',
      data: Array.from({ length: 12 }, (f, i) => i + 1 + '月')
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320, 820, 932, 901, 934, 1290],
        type: 'line',
        smooth: true
      }
    ]
  };
  option1 && myChart1.setOption(option1);

  // 2
  const myChart2 = echarts.init(echarts2Ref.value);
  const option2 = {
    xAxis: {
      type: 'category',
      data: Array.from({ length: 12 }, (f, i) => i + 1 + '月')
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130, 120, 200, 150, 80, 70],
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      }
    ]
  };

  option2 && myChart2.setOption(option2);
})
</script>

<style lang="scss" scoped>
.card-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.echartsBox {
  width: 100%;
  height: 400px;
}
</style>