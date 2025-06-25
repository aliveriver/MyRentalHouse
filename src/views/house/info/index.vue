<template>
  <div class="map-house-container">
    <!-- 轮播图区域 -->
    <div class="carousel-section">
      <el-carousel :interval="4000" height="auto">
        <el-carousel-item
          v-for="(image, index) in carouselImages"
          :key="index"
          style="height: 600px;"
        >
          <img :src="image.url" :alt="image.alt" class="carousel-image" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 搜索面板 -->
      <h3>房源信息</h3>
      <el-form :inline="true" :model="houseObject">
        <el-form-item label="地区">
          <el-select
            v-model="houseObject.address"
            placeholder="请选择.."
            style="width: 240px"
          >
            <el-option
              v-for="item in [
                        { label: '北京', value: 'beijing' },
                        { label: '上海', value: 'shanghai' },
                        { label: '辽宁', value: 'liaoning' }
                    ]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格">
          <el-select
            v-model="houseObject.price"
            placeholder="请选择.."
            style="width: 240px"
          >
            <el-option
              v-for="item in [
                        { label: '1000以下', value: '1000' },
                        { label: '1000-2000', value: '2000' },
                        { label: '2000-3000', value: '3000' },
                        { label: '3000以上', value: '4000' }
                    ]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 右侧房源卡片区域 -->
      <div class="house-cards-section">
        <div class="house-cards-grid">
          <div
            v-for="house in houseList"
            :key="house.id"
            class="house-card"
            @click="viewHouseDetail(house)"
          >
            <div class="house-image">
              <img :src="house.image" :alt="house.name" />
            </div>
            <div class="house-info">
              <div class="house-name">{{ house.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 轮播图数据
const carouselImages = ref([
  { url: 'https://pic4.zhimg.com/v2-3fad3b71721d643c918742fe2e75b943_1440w.jpg', alt: '轮播图1' },
  { url: 'https://mofang-renter.oss-cn-shanghai.aliyuncs.com/store/1589887234819.jpg', alt: '轮播图2' },
  { url: 'https://th.bing.com/th/id/R.afb27e3a0fcb84e7981a90a5a02f4800?rik=bSs9UafJVPDMgw&riu=http%3a%2f%2fszimg.xhj.com%2fxhj%2fimages%2f03dc38dd-7065-497f-bc56-39f93d340ce8.jpg&ehk=ge38AXyg9gOVeY2naXAqbcAwMd5nd2unVRJO76uCq4k%3d&risl=&pid=ImgRaw&r=0https://pic4.zhimg.com/v2-c5dd40c0226c91fb0eccae3f2d743563_r.jpg', alt: '轮播图3' },
  { url: 'https://bjcache.leju.com/zxjiaju/zx_pic/20150109/db/60/d60b99acfed08692126b482eccb5621f.jpg', alt: '轮播图4' },
])

// 筛选条件
const selectedAreas = ref([])
const selectedPrices = ref([])
const searchKeyword = ref('')

const houseObject = ref({
  address: '',
  price: ''
})

// 房源数据
const houseList = ref([
  {
    id: 1,
    name: '房源名称',
    image: 'https://th.bing.com/th/id/OIP.bfCdyDaBEjZEX_dMk9dk-QHaFj?w=238&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
  },
  {
    id: 2,
    name: '房源名称',
    image: 'https://th.bing.com/th/id/OIP.xmdtYLyKyFJN-NakrqxcbwHaFj?w=238&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
  },
  {
    id: 3,
    name: '房源名称',
    image: 'https://th.bing.com/th/id/OIP.WPL7bpQ6UGkp_cczqNUPkgHaFj?w=270&h=203&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
  },
  {
    id: 4,
    name: '房源名称',
    image: 'https://th.bing.com/th/id/OIP.jI9oZoKQtbf1_Mg_BTFlTwHaFj?w=264&h=198&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
  },
  {
    id: 5,
    name: '房源名称',
    image: 'https://th.bing.com/th/id/OIP.kjf6ebE9hmqxe30Tr3eRDgHaFi?w=260&h=194&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
  },
  {
    id: 6,
    name: '房源名称',
    image: 'https://th.bing.com/th/id/OIP.wN4jVopu5875tDaoQlWlVAHaFj?w=261&h=196&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
  },
  {
    id: 7,
    name: '房源名称',
    image: 'https://th.bing.com/th/id/OIP.PMZcVmTdIwkdEehM6HdWsQHaE8?w=294&h=196&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
  },
  {
    id: 8,
    name: '房源名称',
    image: 'https://th.bing.com/th/id/OIP.lwVjCb_YXY9ALCkJ6jBr8QHaFj?w=243&h=182&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
  }
])

const onSubmit = () => {
  // 处理查询逻辑
  console.log('查询条件:', houseObject.value)
}

// 查看房源详情
const viewHouseDetail = (house) => {
  router.push(`/house/detail/${house.id}`)
}
</script>

<style lang="scss" scoped>
.map-house-container {
  .carousel-section {
    position: relative;
    width: 100%;
    margin-bottom: 20px;

    .carousel-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .carousel-pagination {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 5px 15px;
      border-radius: 15px;
      font-size: 14px;

      span {
        margin: 0 2px;
      }
    }

  }

  .main-content {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    gap: 20px;
    padding: 0 20px;

    .filter-panel {
      background: white;
      border-radius: 8px;
      padding: 20px;
      height: fit-content;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      h3 {
        margin: 0 0 20px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .filter-group {
        display: flex;
        margin-bottom: 25px;

        .filter-title {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 12px;
        }

        .filter-options {
          :deep(.el-checkbox-group) {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          :deep(.el-checkbox) {
            margin-right: 0;

            .el-checkbox__label {
              font-size: 14px;
              color: #666;
            }
          }
        }
      }

      .filter-actions {
        margin-bottom: 25px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .filter-btn {
          font-size: 12px;
          padding: 6px 16px;
          height: auto;
        }
      }

      .search-section {
        margin-bottom: 25px;

        .search-input {
          margin-bottom: 10px;
        }

        .search-btn {
          width: 100%;
        }
      }

      .location-btn {
        text-align: center;

        .location-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;

          .el-icon {
            font-size: 20px;
            color: #666;
          }

          &:hover {
            border-color: #409eff;

            .el-icon {
              color: #409eff;
            }
          }
        }
      }
    }

    .house-cards-section {
      flex: 1;

      .house-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;

        .house-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }

          .house-image {
            width: 100%;
            height: 180px;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            }

            &:hover img {
              transform: scale(1.05);
            }
          }

          .house-info {
            padding: 15px;

            .house-name {
              font-size: 14px;
              font-weight: 500;
              color: #333;
              text-align: center;
            }
          }
        }
      }
    }
  }
}
</style>
