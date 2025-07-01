<template>
  <div class="info-management">
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="search-item">
            <label>资讯标题</label>
            <el-input
              v-model="searchForm.title"
              placeholder="输入标题"
              clearable
            />
          </div>
        </el-col>
        <el-col :span="4">
          <div class="search-item">
            <label>分类</label>
            <el-select
              v-model="searchForm.category"
              placeholder="请选择分类"
              style="width: 100%"
              clearable
            >
              <el-option label="房产新闻" value="1" />
              <el-option label="购房指南" value="2" />
              <el-option label="装修知识" value="3" />
              <el-option label="政策解读" value="4" />
              <el-option label="市场分析" value="5" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="search-item">
            <label>发布者</label>
            <el-input
              v-model="searchForm.publisher"
              placeholder="输入发布者"
              clearable
            />
          </div>
        </el-col>
        <el-col :span="4">
          <div class="search-item">
            <label>发布时间</label>
            <el-date-picker
              v-model="searchForm.publishDate"
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
          添加资讯
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
            :type="currentCategoryFilter === '' ? 'primary' : ''"
            size="small"
            @click="handleCategoryFilter('')"
          >
            全部
          </el-button>
          <el-button
            :type="currentCategoryFilter === '1' ? 'primary' : ''"
            size="small"
            @click="handleCategoryFilter('1')"
          >
            房产新闻
          </el-button>
          <el-button
            :type="currentCategoryFilter === '2' ? 'primary' : ''"
            size="small"
            @click="handleCategoryFilter('2')"
          >
            购房指南
          </el-button>
          <el-button
            :type="currentCategoryFilter === '3' ? 'primary' : ''"
            size="small"
            @click="handleCategoryFilter('3')"
          >
            装修知识
          </el-button>
        </el-button-group>
      </div>
    </div>
    <!-- 资讯数据表格 -->
    <div class="table-section">
      <el-table
        :data="paginatedInfos"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
        v-loading="loading"
        element-loading-text="加载中..."
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="infoid" label="资讯编号" />
        <el-table-column
          prop="title"
          label="标题"
          show-overflow-tooltip
          width="200"
        >
          <template #default="{ row }">
            <span class="info-title-link" @click="handleViewDetail(row)">
              {{ row.title }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ getCategoryName(row.infocategoryid) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容摘要" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getContentSummary(row.content) }}
          </template>
        </el-table-column>
        <el-table-column prop="publisherid" label="发布者ID" align="center" />
        <el-table-column
          prop="publishdate"
          label="发布时间"
          align="center"
          width="160"
        >
          <template #default="{ row }">
            {{ new Date(row.publishdate).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="标签" align="center" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="tagId in row.tagIds"
              :key="tagId"
              size="small"
              style="margin-right: 8px;"
            >
              {{ infoTags.find(i => i.id === tagId).value }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="pagination-wrapper">
      <div class="pagination-info">
        第{{ currentPage }}页 共{{ Math.ceil(filteredInfos.length / pageSize)


































        }}页， 总计{{ filteredInfos.length }}条数据
      </div>
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredInfos.length"
        layout="sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 资讯详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="'资讯详情 - ' + currentInfo.title"
      width="70%"
      append-to-body
    >
      <div class="info-detail" v-if="currentInfo">
        <div class="detail-row">
          <span class="label">资讯编号：</span>
          <span>{{ currentInfo.infoid }}</span>
        </div>
        <div class="detail-row">
          <span class="label">标题：</span>
          <span>{{ currentInfo.title }}</span>
        </div>
        <div class="detail-row">
          <span class="label">分类：</span>
          <el-tag
            type="info"
            >{{ getCategoryName(currentInfo.infocategoryid) }}</el-tag
          >
        </div>
        <div class="detail-row">
          <span class="label">发布者ID：</span>
          <span>{{ currentInfo.publisherid }}</span>
        </div>
        <div class="detail-row">
          <span class="label">发布时间：</span>
          <span>{{ currentInfo.publishdate }}</span>
        </div>
        <div class="detail-row">
          <span class="label">标签：</span>
          <el-tag
            v-for="tagId in currentInfo.tagIds"
            :key="tagId"
            size="small"
            style="margin-right: 8px;"
          >
            {{ infoTags.find(i => i.id === tagId).value }}
          </el-tag>
        </div>
        <div class="detail-row">
          <span class="label">内容：</span>
        </div>
        <div class="content-area">
          {{ currentInfo.content }}
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEditFromDetail">编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { infoApi } from '@/api'
import { infoTags } from '@/constant/tags'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const infos = ref([])
const selectedItems = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const currentCategoryFilter = ref('')
const detailDialogVisible = ref(false)
const currentInfo = ref({})

// 搜索表单
const searchForm = reactive({
  title: '',
  category: '',
  publisher: '',
  publishDate: ''
})

// 分类映射
const categoryMap = {
  1: '房产新闻',
  2: '购房指南',
  3: '装修知识',
  4: '政策解读',
  5: '市场分析'
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  return categoryMap[categoryId] || '未知分类'
}

// 获取内容摘要
const getContentSummary = (content) => {
  if (!content) return ''
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

// 计算属性：过滤后的资讯列表
const filteredInfos = computed(() => {
  let result = infos.value

  // 按分类筛选
  if (currentCategoryFilter.value) {
    result = result.filter(info => info.infocategoryid == currentCategoryFilter.value)
  }

  // 按搜索条件筛选
  if (searchForm.title) {
    result = result.filter(info =>
      info.title && info.title.toLowerCase().includes(searchForm.title.toLowerCase())
    )
  }

  if (searchForm.category) {
    result = result.filter(info => info.infocategoryid == searchForm.category)
  }

  if (searchForm.publisher) {
    result = result.filter(info =>
      info.publisherid && info.publisherid.toString().includes(searchForm.publisher)
    )
  }

  if (searchForm.publishDate) {
    const searchDate = new Date(searchForm.publishDate).toISOString().split('T')[0]
    result = result.filter(info =>
      info.publishdate && info.publishdate.includes(searchDate)
    )
  }

  return result
})

// 计算属性：分页后的资讯列表
const paginatedInfos = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredInfos.value.slice(start, end)
})

// 加载资讯数据
const loadInfos = async () => {
  try {
    loading.value = true
    const response = await infoApi.getAllInfo()
    if (response.success) {
      infos.value = response.data || []
    } else {
      ElMessage.error(response.data?.errorMsg || '获取资讯数据失败')
    }
  } catch (error) {
    console.error('加载资讯数据失败:', error)
    ElMessage.error('获取资讯数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentCategoryFilter.value = ''
  currentPage.value = 1
}

// 添加资讯
const handleAdd = () => {
  router.push('/info/list/add')
}

// 批量删除
const handleBatchDelete = async () => {
  if (!selectedItems.value.length) {
    ElMessage.warning('请选择要删除的资讯')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedItems.value.length} 条资讯吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    loading.value = true
    const ids = selectedItems.value.map(item => item.infoid)
    for (let i = 0; i < ids.length; i++) {
        await infoApi.batchDeleteInfo(ids[i])
    }
    ElMessage.success('批量删除成功')
    await loadInfos()
    selectedItems.value = []
  } catch (error) {
    console.log(error)
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 分类筛选
const handleCategoryFilter = (category) => {
  currentCategoryFilter.value = category
  currentPage.value = 1
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

// 查看详情
const handleViewDetail = (row) => {
  currentInfo.value = row
  detailDialogVisible.value = true
}

// 编辑资讯
const handleEdit = (row) => {
  router.push(`/info/list/add?id=${row.infoid}&mode=edit`)
}

// 从详情页编辑
const handleEditFromDetail = () => {
  detailDialogVisible.value = false
  handleEdit(currentInfo.value)
}

// 删除单个资讯
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除资讯"${row.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    loading.value = true
    const response = await infoApi.deleteInfo(row.infoid)

    if (response.success) {
      ElMessage.success('删除成功')
      await loadInfos()
    } else {
      ElMessage.error(response.data?.errorMsg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 分页大小变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

// 当前页变化
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

// 组件挂载时加载数据
onMounted(() => {
  loadInfos()
})
</script>

<style lang="scss" scoped>
.search-section {
  border-radius: 8px;
  margin-bottom: 20px;
}

.search-item {
    label {
        display: block;
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
    }
}

.search-btn {
    margin-top: 22px;
}

.reset-btn {
    margin-top: 22px;
    color: #606266;
}

.text-right {
    text-align: right;
}

.search-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #606266;
}

.search-btn {
  margin-right: 10px;
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

.left-actions .el-button {
  margin-right: 10px;
}

.right-actions {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
  color: #606266;
  font-size: 14px;
}

.table-section {
  background: white;
  overflow: hidden;
}

.info-title-link {
  color: #409eff;
  cursor: pointer;
  font-weight: 500;
}

.info-title-link:hover {
  text-decoration: underline;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 0 20px;
}

.pagination-info {
  color: #909399;
  font-size: 14px;
}

.info-detail {
  line-height: 1.6;
}

.detail-row {
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
}

.detail-row .label {
  min-width: 100px;
  font-weight: 500;
  color: #606266;
}

.content-area {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
  white-space: pre-wrap;
  line-height: 1.8;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-button-group .el-button) {
  border-radius: 0;
}

:deep(.el-button-group .el-button:first-child) {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

:deep(.el-button-group .el-button:last-child) {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
