<template>
  <div class="map-house-container">
    <!-- 主要内容区域 - 双列布局 -->
    <div class="main-content">
      <!-- 左侧房源区域 (60%) -->
      <div class="left-section">
        <!-- 房源搜索面板 -->
        <div class="section-header">
          <h3>房源信息</h3>
          <el-form :inline="true" :model="houseObject">
            <el-form-item label="地区">
              <el-select
                v-model="houseObject.address"
                placeholder="请选择.."
                style="width: 200px"
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
                style="width: 200px"
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
        </div>

        <!-- 房源卡片区域 -->
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
          <div class="info-list">
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
import { propertiesApi, infoApi } from '@/api/index'

const router = useRouter()

// 房源相关数据
const selectedAreas = ref([])
const selectedPrices = ref([])
const searchKeyword = ref('')
const houseObject = ref({
  address: '',
  price: ''
})
const houseList = ref([])

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

    if (response.success) {
      houseList.value = response.data.map(item => ({
        id: item.propertyid,
        name: item.title,
        image: item.image || 'https://www.dmoe.cc/random.php?id=' + Math.random()
      }))
    }
  } catch (error) {
    console.error('获取房源数据失败:', error)
  }
}

// 获取资讯数据
const getInfoList = async () => {
  try {
    infoLoading.value = true
    const response = await infoApi.getAllInfo()

    if (response.success) {
      infoList.value = response.data || []
    } else {
      ElMessage.error('获取资讯数据失败')
    }
  } catch (error) {
    console.error('获取资讯数据失败:', error)
    ElMessage.error('获取资讯数据失败')
  } finally {
    infoLoading.value = false
  }
}

// 房源查询
const onSubmit = () => {
  console.log('查询条件:', houseObject.value)
  // 这里可以添加具体的筛选逻辑
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
  getHouseList()
  getInfoList()
})
</script>

<style lang="scss" scoped>
.map-house-container {
  overflow: hidden;

  .main-content {
    display: flex;
    height: 100%;
    gap: 20px;
    padding: 20px;
    overflow: hidden;
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

      h3 {
        margin: 0 0 15px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .el-form {
        margin: 0;
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
              text-align: center;
              line-height: 1.4;
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
    }
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
