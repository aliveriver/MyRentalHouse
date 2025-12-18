<template>
  <div class="map-house-container">
    <!-- 主要内容区域 - 双列布局 -->
    <div class="main-content">
      <!-- 左侧房源区域 (60%) -->
      <div class="left-section">
        <!-- 房源搜索面板 -->
        <div class="section-header">
          <h3>房源信息</h3>
          <el-form
            :inline="true"
            :model="houseObject"
            class="house-search-form"
          >
            <el-form-item label="地区查询">
              <el-input
                v-model="houseObject.address"
                placeholder="输入地区关键词"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="价格范围">
              <div class="price-range-wrapper">
                <el-input-number
                  v-model="houseObject.minPrice"
                  :min="0"
                  :max="houseObject.maxPrice || 9999999999"
                  placeholder="最低价"
                  controls-position="right"
                  style="width: 140px"
                />
                <span class="price-separator">-</span>
                <el-input-number
                  v-model="houseObject.maxPrice"
                  :min="houseObject.minPrice || 0"
                  placeholder="最高价"
                  controls-position="right"
                  style="width: 140px"
                />
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="resetSearch">
                <el-icon><RefreshLeft /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 房源卡片区域 -->
        <div class="house-cards-section">
          <div v-if="filteredHouseList.length === 0" class="empty-state">
            <el-empty description="暂无符合条件的房源" />
          </div>
          <div v-else class="house-cards-grid">
            <div
              v-for="house in filteredHouseList"
              :key="house.id"
              class="house-card"
              @click="viewHouseDetail(house)"
            >
              <div class="house-image">
                <img :src="house.image" :alt="house.name" />
              </div>
              <div class="house-info">
                <div class="house-name">{{ house.name }}</div>
                <div class="house-details">
                  <div class="house-address">{{ house.address }}</div>
                  <div class="house-price">¥{{ formatPrice(house.price) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧资讯区域 (40%) -->
      <div class="right-section">
        <div class="section-header">
          <h3>最新资讯</h3>
          <div class="info-filters">
            <el-select
              v-model="selectedCategory"
              placeholder="选择分类"
              style="width: 150px"
              size="small"
              @change="handleCategoryChange"
            >
              <el-option label="全部" value="" />
              <el-option label="房产新闻" value="1" />
              <el-option label="购房指南" value="2" />
              <el-option label="装修知识" value="3" />
              <el-option label="政策解读" value="4" />
              <el-option label="市场分析" value="5" />
            </el-select>
          </div>
        </div>

        <!-- 资讯列表区域 -->
        <div class="info-section" v-loading="infoLoading">
          <div v-if="infoList.length === 0 && !infoLoading" class="empty-state">
            <el-empty description="暂无资讯数据" />
          </div>
          <div v-else class="info-list">
            <div
              v-for="info in displayedInfos"
              :key="info.infoid"
              class="info-card"
              @click="viewInfoDetail(info)"
            >
              <div class="info-header">
                <h4 class="info-title">{{ info.title }}</h4>
                <el-tag
                  :type="getCategoryTagType(info.infocategoryid)"
                  size="small"
                >
                  {{ getCategoryName(info.infocategoryid) }}
                </el-tag>
              </div>
              <div class="info-content">
                {{ getContentSummary(info.content) }}
              </div>
              <div class="info-meta">
                <span
                  class="publish-date"
                  >{{ formatDate(info.publishdate) }}</span
                >
                <div class="info-tags">
                  <template v-if="info.tagIds && info.tagIds.length > 0">
                    <el-tag
                      v-for="tagId in info.tagIds.slice(0, 2)"
                      :key="tagId"
                      size="small"
                      type="info"
                      style="margin-left: 4px;"
                    >
                      {{ getTagName(tagId) }}
                    </el-tag>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多按钮 -->
          <div class="load-more" v-if="hasMoreInfos">
            <el-button
              @click="loadMoreInfos"
              :loading="loadingMore"
              size="small"
              plain
            >
              加载更多
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 资讯详情弹窗 -->
    <el-dialog
      v-model="infoDetailVisible"
      :title="currentInfo.title"
      width="70%"
      append-to-body
    >
      <div class="info-detail" v-if="currentInfo">
        <div class="detail-header">
          <div class="detail-meta">
            <el-tag :type="getCategoryTagType(currentInfo.infocategoryid)">
              {{ getCategoryName(currentInfo.infocategoryid) }}
            </el-tag>
            <span class="publish-info">
              发布时间：{{ formatDate(currentInfo.publishdate) }}
            </span>
          </div>
          <div class="detail-tags">
            <el-tag
              v-for="tagId in currentInfo.tagIds"
              :key="tagId"
              size="small"
              style="margin-right: 8px;"
            >
              {{ getTagName(tagId) }}
            </el-tag>
          </div>
        </div>
        <div class="detail-content">
          {{ currentInfo.content }}
        </div>
      </div>
      <template #footer>
        <el-button @click="infoDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import { propertiesApi, infoApi } from '@/api/index'

const router = useRouter()

// 房源相关数据
const houseObject = ref({
  address: '',
  minPrice: null,
  maxPrice: null
})
const houseList = ref([])
const allHouseData = ref([]) // 存储完整的房源数据用于筛选

// 资讯相关数据
const infoList = ref([])
const selectedCategory = ref('')
const infoLoading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const infoDetailVisible = ref(false)
const currentInfo = ref({})

// 分类映射
const categoryMap = {
  1: '房产新闻',
  2: '购房指南',
  3: '装修知识',
  4: '政策解读',
  5: '市场分析'
}

// 标签映射
const tagMap = {
  1: '热门',
  2: '推荐',
  3: '新房',
  4: '二手房',
  5: '租房',
  6: '投资',
  7: '装修',
  8: '政策',
  9: '市场',
  10: '指南'
}

// 计算筛选后的房源列表
const filteredHouseList = computed(() => {
  let filtered = [...houseList.value]

  // 地区筛选（模糊匹配）
  if (houseObject.value.address && houseObject.value.address.trim()) {
    const keyword = houseObject.value.address.trim().toLowerCase()
    filtered = filtered.filter(house =>
      house.address && house.address.toLowerCase().includes(keyword)
    )
  }

  // 价格范围筛选
  if (houseObject.value.minPrice !== null && houseObject.value.minPrice !== undefined) {
    filtered = filtered.filter(house => house.price >= houseObject.value.minPrice)
  }
  if (houseObject.value.maxPrice !== null && houseObject.value.maxPrice !== undefined) {
    filtered = filtered.filter(house => house.price <= houseObject.value.maxPrice)
  }

  return filtered
})

// 计算显示的资讯列表
const displayedInfos = computed(() => {
  let filtered = infoList.value

  if (selectedCategory.value) {
    filtered = filtered.filter(info => info.infocategoryid == selectedCategory.value)
  }

  return filtered.slice(0, currentPage.value * pageSize.value)
})

// 是否还有更多资讯
const hasMoreInfos = computed(() => {
  let totalFiltered = infoList.value.length
  if (selectedCategory.value) {
    totalFiltered = infoList.value.filter(info => info.infocategoryid == selectedCategory.value).length
  }
  return displayedInfos.value.length < totalFiltered
})

// 获取房源数据
const getHouseList = async () => {
  try {
    const response = await propertiesApi.getAllProperties({
      page: 1,
      size: 1000000
    })

    console.log('房源API响应:', response)

    if (response && response.success) {
      // 后端返回格式：Result.ok(propertiesList)，所以 data 就是列表
      const data = response.data || []
      const { filesApi } = await import('@/api/index')
      houseList.value = Array.isArray(data) ? data.map(item => {
        // 获取第一张图片，如果没有则使用默认随机图片
        let imageUrl = 'https://www.dmoe.cc/random.php?id=' + Math.random()
        if (item.photoList && item.photoList.length > 0 && item.photoList[0]) {
          // 使用 filesApi 获取完整URL
          imageUrl = filesApi.getFileUrl(item.photoList[0])
        }
        return {
          id: item.propertyid,
          name: item.title || item.name || '未命名房源',
          image: imageUrl,
          address: item.address || '',
          price: item.price || 0
        }
      }) : []
      console.log('解析后的房源列表:', houseList.value)
    } else {
      // 如果返回失败，显示错误信息
      const errorMsg = response?.errorMsg || response?.message || '获取房源数据失败'
      ElMessage.error(errorMsg)
      houseList.value = []
    }
  } catch (error) {
    console.error('获取房源数据失败:', error)
    // 从错误响应中提取错误信息
    const errorMsg = error.response?.data?.errorMsg ||
                     error.response?.data?.message ||
                     error.message ||
                     '获取房源数据失败，请稍后重试'
    ElMessage.error(errorMsg)
    houseList.value = []
  }
}

// 获取资讯数据
const getInfoList = async () => {
  try {
    infoLoading.value = true
    const response = await infoApi.getAllInfo()

    console.log('资讯API响应:', response)

    if (response && response.success) {
      // 后端返回格式：Result.ok(informationList)，所以 data 就是列表
      const data = response.data || []
      infoList.value = Array.isArray(data) ? data : []
      console.log('解析后的资讯列表:', infoList.value)
    } else {
      // 如果返回失败，显示错误信息
      const errorMsg = response?.errorMsg || response?.message || '获取资讯数据失败'
      ElMessage.error(errorMsg)
      infoList.value = []
    }
  } catch (error) {
    console.error('获取资讯数据失败:', error)
    // 从错误响应中提取错误信息
    const errorMsg = error.response?.data?.errorMsg ||
                     error.response?.data?.message ||
                     error.message ||
                     '获取资讯数据失败，请稍后重试'
    ElMessage.error(errorMsg)
    infoList.value = []
  } finally {
    infoLoading.value = false
  }
}

// 房源查询
const onSubmit = () => {
  console.log('查询条件:', houseObject.value)
  // 筛选逻辑已通过 computed 属性 filteredHouseList 自动实现
  ElMessage.success(`找到 ${filteredHouseList.value.length} 个符合条件的房源`)
}

// 重置搜索
const resetSearch = () => {
  houseObject.value = {
    address: '',
    minPrice: null,
    maxPrice: null
  }
  ElMessage.info('已重置搜索条件')
}

// 格式化价格
const formatPrice = (price) => {
  if (!price || price === 0) return '0'
  return price.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

// 查看房源详情
const viewHouseDetail = (house) => {
  router.push(`/house/detail/${house.id}`)
}

// 分类筛选变化
const handleCategoryChange = () => {
  currentPage.value = 1
}

// 加载更多资讯
const loadMoreInfos = () => {
  loadingMore.value = true
  setTimeout(() => {
    currentPage.value++
    loadingMore.value = false
  }, 500)
}

// 查看资讯详情
const viewInfoDetail = (info) => {
  currentInfo.value = info
  infoDetailVisible.value = true
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  return categoryMap[categoryId] || '未知分类'
}

// 获取分类标签类型
const getCategoryTagType = (categoryId) => {
  const types = {
    1: 'danger',   // 房产新闻
    2: 'success',  // 购房指南
    3: 'warning',  // 装修知识
    4: 'info',     // 政策解读
    5: 'primary'   // 市场分析
  }
  return types[categoryId] || 'info'
}

// 获取标签名称
const getTagName = (tagId) => {
  return tagMap[tagId] || `标签${tagId}`
}

// 获取内容摘要
const getContentSummary = (content) => {
  if (!content) return ''
  return content.length > 80 ? content.substring(0, 80) + '...' : content
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  } catch {
    return dateString
  }
}

// 组件挂载时加载数据
onMounted(() => {
  console.log('house/info 页面已挂载，开始加载数据')
  getHouseList()
  getInfoList()
})
</script>

<style lang="scss" scoped>
.map-house-container {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 60px);
  overflow: auto;

  .main-content {
    display: flex;
    min-height: calc(100vh - 60px);
    gap: 20px;
    padding: 20px;
    box-sizing: border-box;
  }

  // 左侧房源区域
  .left-section {
    flex: 0 0 70%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .section-header {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;

      h3 {
        margin: 0 0 15px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .house-search-form {
        margin: 0;

        .price-range-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;

          .price-separator {
            color: #909399;
            font-weight: 500;
          }
        }
      }
    }

    .house-cards-section {
      flex: 1;
      background: white;
      border-radius: 8px;
      padding: 20px 0;
      padding-right: 20px;
      overflow-y: auto;

      .house-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;

        .house-card {
          background: white;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-color: #409eff;
          }

          .house-image {
            width: 100%;
            height: 150px;
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
            padding: 12px;

            .house-name {
              font-size: 14px;
              font-weight: 500;
              color: #333;
              line-height: 1.4;
              margin-bottom: 8px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .house-details {
              .house-address {
                font-size: 12px;
                color: #909399;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .house-price {
                font-size: 14px;
                color: #f56c6c;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }

  .right-section {
    flex: 0 0 30%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .section-header {
      background: white;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .info-filters {
        display: flex;
        align-items: center;
      }
    }

    .info-section {
      flex: 1;
      background: white;
      border-radius: 8px;
      padding: 20px 0;
      overflow-y: auto;

      .info-list {
        .info-card {
          padding: 16px;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          margin-bottom: 16px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: #409eff;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
          }

          .info-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;

            .info-title {
              flex: 1;
              margin: 0;
              font-size: 16px;
              font-weight: 500;
              color: #303133;
              line-height: 1.4;
              margin-right: 12px;
            }
          }

          .info-content {
            color: #606266;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 12px;
          }

          .info-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #909399;

            .publish-date {
              font-size: 12px;
            }

            .info-tags {
              display: flex;
              align-items: center;
            }
          }
        }
      }

      .load-more {
        text-align: center;
        padding: 20px 0;
      }

      .empty-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
        padding: 40px;
      }
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    padding: 40px;
  }
}

// 资讯详情弹窗样式
.info-detail {
  .detail-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e4e7ed;

    .detail-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .publish-info {
        color: #909399;
        font-size: 14px;
      }
    }

    .detail-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .detail-content {
    font-size: 16px;
    line-height: 1.8;
    color: #303133;
    white-space: pre-wrap;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .map-house-container .main-content {
    flex-direction: column;

    .left-section {
      flex: none;
      height: 50%;
    }

    .right-section {
      flex: none;
      height: 50%;
    }
  }
}

@media (max-width: 768px) {
  .map-house-container {
    .main-content {
      padding: 10px;
      gap: 10px;
    }

    .left-section .house-cards-section .house-cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .right-section .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
}

// 滚动条样式
.info-section::-webkit-scrollbar,
.house-cards-section::-webkit-scrollbar {
  width: 6px;
}

.info-section::-webkit-scrollbar-track,
.house-cards-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.info-section::-webkit-scrollbar-thumb,
.house-cards-section::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.info-section::-webkit-scrollbar-thumb:hover,
.house-cards-section::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
