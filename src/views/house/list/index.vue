<template>
  <div class="house-management">
    <!-- 搜索和操作区 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="search-item">
            <label>房源名称</label>
            <el-input
              v-model="searchForm.name"
              placeholder="输入名称"
              clearable
            />
          </div>
        </el-col>
        <el-col :span="4">
          <div class="search-item">
            <label>价格范围</label>
            <el-select
              v-model="searchForm.priceRange"
              placeholder="请选择价格范围"
              style="width: 100%"
              clearable
            >
              <el-option label="50万以下" value="0-500000" />
              <el-option label="50-100万" value="500000-1000000" />
              <el-option label="100-200万" value="1000000-2000000" />
              <el-option label="200万以上" value="2000000-0" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="search-item">
            <label>状态</label>
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              style="width: 100%"
              clearable
            >
              <el-option label="在售" value="在售" />
              <el-option label="已售" value="已售" />
              <el-option label="待审核" value="待审核" />
              <el-option label="下架" value="下架" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="search-item">
            <label>发布时间</label>
            <el-date-picker
              v-model="searchForm.addTime"
              type="date"
              placeholder="请选择时间"
              style="width: 100%"
            />
          </div>
        </el-col>
        <el-col :span="8">
          <el-button
            type="primary"
            class="search-btn"
            @click="handleSearch"
            :loading="loading"
          >
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button class="reset-btn" @click="handleReset"> 重置 </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮区 -->
    <div class="action-section">
      <div class="left-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加房源
        </el-button>
        <el-button
          type="danger"
          :disabled="!selectedItems.length"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
      <div class="right-actions">
        <span class="filter-label">快速筛选：</span>
        <el-button-group>
          <el-button
            :type="currentStatusFilter === '' ? 'primary' : ''"
            size="small"
            @click="handleStatusFilter('')"
          >
            全部
          </el-button>
          <el-button
            :type="currentStatusFilter === '在售' ? 'primary' : ''"
            size="small"
            @click="handleStatusFilter('在售')"
          >
            在售
          </el-button>
          <el-button
            :type="currentStatusFilter === '已售' ? 'primary' : ''"
            size="small"
            @click="handleStatusFilter('已售')"
          >
            已售
          </el-button>
          <el-button
            :type="currentStatusFilter === '待审核' ? 'primary' : ''"
            size="small"
            @click="handleStatusFilter('待审核')"
          >
            待审核
          </el-button>
        </el-button-group>
      </div>
    </div>
    <!-- 房源数据表格 -->
    <div class="table-section">
      <el-table
        :data="paginatedHouses"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
        v-loading="loading"
        element-loading-text="加载中..."
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="房源编号" width="100" />
        <el-table-column
          prop="title"
          label="名称"
          show-overflow-tooltip
          width="120"
        >
          <template #default="{ row }">
            <span class="house-title-link" @click="handleViewDetail(row)">
              {{ row.title }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="currentPrice" label="价格" align="center">
          <template #default="{ row }"> ¥{{ row.price }} </template>
        </el-table-column>
        <el-table-column prop="area" label="面积(㎡)" align="center">
          <template #default="{ row }"> {{ row.area }} </template>
        </el-table-column>
        <el-table-column prop="layout" label="户型" align="center" />
        <el-table-column
          prop="location"
          label="地址"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column prop="addTime" label="发布时间" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === '在售' ? 'success' : row.status === '待审核' ? 'warning' : row.status === '已售' ? 'info' : 'danger'"
              size="small"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEditDetail(row)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="pagination-wrapper">
      <div class="pagination-info">
        第{{ currentPage }}页 共{{ Math.ceil(filteredHouses.length / pageSize)
















        }}页，共{{ filteredHouses.length }}条
      </div>
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="filteredHouses.length"
        layout="prev, pager, next"
        @current-change="handlePageChange"
        :pager-count="5"
        small
      />
    </div>

    <!-- 批量删除确认弹窗 -->
    <el-dialog v-model="deleteDialogVisible" title="批量删除确认" width="400px">
      <p>确定要删除选中的 {{ selectedItems.length }} 条房源信息吗？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmBatchDelete"
            >确定删除</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { propertiesApi } from '@/api/index'
import useStore from '@/store/index'

const router = useRouter();
const store = useStore();

// 搜索表单
const searchForm = ref({
  name: '',
  priceRange: '',
  status: '',
  addTime: ''
})

// 选中项
const selectedItems = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗控制
const detailDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const currentHouse = ref(null)

// 房源数据 - 改为从API获取
const houseList = ref([])
const loading = ref(false)
const currentStatusFilter = ref('')

// 筛选后的房源列表
const filteredHouses = computed(() => {
  let result = houseList.value

  // 按名称搜索
  if (searchForm.value.name) {
    const keyword = searchForm.value.name.toLowerCase()
    result = result.filter(house =>
      house.title.toLowerCase().includes(keyword) ||
      house.id.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 分页后的房源列表
const paginatedHouses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredHouses.value.slice(start, end)
})

// 获取房源列表
const getHouseList = async () => {
  try {
    loading.value = true
    const response = await propertiesApi.getAllProperties({
      page: currentPage.value,
      size: pageSize.value
    })

    if (response && response.success) {
      // 将API返回的数据映射到组件需要的格式
      houseList.value = response.data.map(item => ({
        id: item.propertyid,
        title: item.title,
        price: item.price,
        location: item.address,
        addTime: new Date(item.publishdate).toLocaleString(),
        status: item.status,
        description: item.description,
        area: item.area,
        layout: item.layout,
        sellerid: item.sellerid,
        tagIds: item.tagIds || [],
        image: 'https://via.placeholder.com/300x200?text=房源图片' // 默认图片
      }))
    } else {
      // 如果接口返回失败，显示错误信息
      ElMessage.error(response?.errorMsg || '获取房源列表失败')
    }
  } catch (error) {
    console.error('获取房源列表失败:', error)
    if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      ElMessage.warning('网络连接失败')
    } else {
      ElMessage.error('获取房源列表失败')
    }
  } finally {
    loading.value = false
  }
}

// 搜索房源
const handleSearch = async () => {
  try {
    loading.value = true
    const searchParams = {}

    // 如果有搜索名称，添加关键词搜索
    if (searchForm.value.name) {
      searchParams.keyword = searchForm.value.name
    }

    // 如果有状态筛选
    if (searchForm.value.status) {
      searchParams.status = searchForm.value.status
    }

    // 如果有价格范围筛选
    if (searchForm.value.priceRange) {
      const [minPrice, maxPrice] = searchForm.value.priceRange.split('-').map(Number)
      if (minPrice > 0) searchParams.minPrice = minPrice
      if (maxPrice > 0) searchParams.maxPrice = maxPrice
    }

    // 如果有时间筛选，添加发布日期筛选
    if (searchForm.value.addTime) {
      searchParams.publishdate = searchForm.value.addTime
    }

    const response = await propertiesApi.searchProperties(searchParams)

    if (response && response.success) {
      houseList.value = response.data.map(item => ({
        id: item.propertyid,
        title: item.title,
        price: item.price,
        location: item.address,
        addTime: new Date(item.publishdate).toLocaleString(),
        status: item.status,
        description: item.description,
        area: item.area,
        layout: item.layout,
        sellerid: item.sellerid,
        tagIds: item.tagIds || [],
        image: 'https://via.placeholder.com/300x200?text=房源图片' // 默认图片
      }))
      currentPage.value = 1
      ElMessage.success('查询完成')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.value = {
    name: '',
    priceRange: '',
    status: '',
    addTime: ''
  }
  currentPage.value = 1
  // 重新获取数据
  getHouseList()
  ElMessage.success('重置完成')
}

const handleAdd = () => {
  router.push('/house/add')
}

const handleEditDetail = (row) => {
  router.push({
    path: '/house/add',
    query: {
      mode: 'edit',
      id: row.id
    }
  })
}

const handleViewDetail = (row) => {
  router.push({
    path: '/house/add',
    query: {
      mode: 'view',
      id: row.id
    }
  })
}

const handleBatchDelete = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要删除的项目')
    return
  }
  deleteDialogVisible.value = true
}

// 修改批量删除方法，使用API
const confirmBatchDelete = async () => {
  try {
    loading.value = true
    const selectedIds = selectedItems.value.map(item => item.id)
    for(let i = 0; i < selectedIds.length; i++) {
      const response = await propertiesApi.batchDeleteProperties(selectedIds[i])
      if (response && response.success) {
      }
    }
    await getHouseList()
    deleteDialogVisible.value = false
    ElMessage.success(`成功删除 ${selectedIds.length} 条记录`)
    selectedItems.value = []
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

const handleView = (row) => {
  currentHouse.value = row
  detailDialogVisible.value = true
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handleClose = () => {
  detailDialogVisible.value = false
  currentHouse.value = null
}

// 页面挂载时获取数据
onMounted(() => {
  getHouseList()
})

// 状态快速筛选
const handleStatusFilter = async (status) => {
  currentStatusFilter.value = status
  searchForm.value.status = status
  await handleSearch()
}
</script>

<style lang="scss" scoped>
.house-management {
  .search-section {
    background: #fff;
    border-radius: 4px;
    margin-bottom: 20px;

    .search-item {
      label {
        display: block;
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }
    }

    .search-btn {
      margin-top: 26px;
    }

    .reset-btn {
      margin-top: 26px;
      color: #606266;
    }

    .text-right {
      text-align: right;
    }
  }

  .action-section {
    background: #fff;
    border-radius: 4px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;

    .left-actions {
      .el-button {
        margin-right: 10px;
      }
    }

    .right-actions {
      display: flex;
      align-items: center;

      .filter-label {
        font-size: 14px;
        color: #606266;
        margin-right: 8px;
      }
    }
  }

  .table-section {
    background: #fff;
    margin-bottom: 20px;

    :deep(.el-table) {
      border: 1px solid #ebeef5;

      .el-table__header-wrapper {
        .el-table__header {
          th {
            background-color: #f5f7fa;
            border-bottom: 1px solid #ebeef5;
          }
        }
      }

      .el-table__body-wrapper {
        .el-table__row {
          &:hover {
            background-color: #f5f7fa;
          }

          td {
            border-bottom: 1px solid #ebeef5;
          }
        }
      }
    }
  }

  .pagination-wrapper {
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .pagination-info {
      font-size: 14px;
      color: #606266;
    }

  }
  .house-detail {
    .detail-section {
      margin-bottom: 24px;

      h3 {
        margin-bottom: 16px;
        color: #333;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .house-images {
      text-align: center;

      img {
        max-width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .house-title-link {
    color: #409eff;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .dialog-footer {
    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
