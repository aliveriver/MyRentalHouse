<template>
  <div class="house-management">
    <!-- 搜索和操作区 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="search-item">
            <label>房源名称</label>
            <el-input
              v-model="searchForm.name"
              placeholder="输入名称"
              clearable
            />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="search-item">
            <label>添加时间</label>
            <el-date-picker
              v-model="searchForm.addTime"
              type="date"
              placeholder="请选择时间"
              style="width: 100%"
            />
          </div>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" class="search-btn" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button class="reset-btn" @click="handleReset"> 重置 </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮区 -->
    <div class="action-section">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加
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
    <!-- 房源数据表格 -->
    <div class="table-section">
      <el-table
        :data="paginatedHouses"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="房源编号" width="100" />
        <el-table-column
          prop="title"
          label="名称"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="house-title-link" @click="handleViewDetail(row)">
              {{ row.title }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="originalPrice"
          label="原价格"
          width="100"
          align="center"
        >
          <template #default="{ row }"> ¥{{ row.originalPrice }} </template>
        </el-table-column>
        <el-table-column
          prop="currentPrice"
          label="现价"
          width="100"
          align="center"
        >
          <template #default="{ row }"> ¥{{ row.currentPrice }} </template>
        </el-table-column>
        <el-table-column
          prop="location"
          label="所属国家/地区"
          width="120"
          align="center"
        />
        <el-table-column
          prop="addTime"
          label="加入时间"
          width="120"
          align="center"
        />
        <el-table-column
          prop="status"
          label="审核状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.status === '通过' ? 'success' : row.status === '待审核' ? 'warning' : 'danger'"
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

    <!-- 新增/编辑房源弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '编辑房源' : '新增房源'"
      width="600px"
      :before-close="handleEditClose"
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="房源编号" prop="id" v-if="editForm.id">
          <el-input v-model="editForm.id" disabled />
        </el-form-item>
        <el-form-item label="房源名称" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入房源名称" />
        </el-form-item>
        <el-form-item label="原价格" prop="originalPrice">
          <el-input-number
            v-model="editForm.originalPrice"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="现价" prop="currentPrice">
          <el-input-number
            v-model="editForm.currentPrice"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="所属国家/地区" prop="location">
          <el-select
            v-model="editForm.location"
            placeholder="请选择国家/地区"
            style="width: 100%"
          >
            <el-option label="中国" value="中国" />
            <el-option label="美国" value="美国" />
            <el-option label="日本" value="日本" />
            <el-option label="韩国" value="韩国" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态" prop="status">
          <el-select
            v-model="editForm.status"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option label="通过" value="通过" />
            <el-option label="待审核" value="待审核" />
            <el-option label="拒绝" value="拒绝" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEditClose">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 房源详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="房源详情"
      width="80%"
      :before-close="handleClose"
    >
      <div v-if="currentHouse" class="house-detail">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-section">
              <h3>基本信息</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item
                  label="房源编号"
                  >{{ currentHouse.id }}</el-descriptions-item
                >
                <el-descriptions-item
                  label="房源标题"
                  >{{ currentHouse.title }}</el-descriptions-item
                >
                <el-descriptions-item label="原价格"
                  >¥{{ currentHouse.originalPrice }}</el-descriptions-item
                >
                <el-descriptions-item label="现价"
                  >¥{{ currentHouse.currentPrice }}</el-descriptions-item
                >
                <el-descriptions-item
                  label="所属国家/地区"
                  >{{ currentHouse.location }}</el-descriptions-item
                >
                <el-descriptions-item
                  label="加入时间"
                  >{{ currentHouse.addTime }}</el-descriptions-item
                >
                <el-descriptions-item label="状态">
                  <el-tag
                    :type="currentHouse.status === '通过' ? 'success' : currentHouse.status === '待审核' ? 'warning' : 'danger'"
                    size="small"
                  >
                    {{ currentHouse.status }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-section">
              <h3>房源图片</h3>
              <div class="house-images">
                <img :src="currentHouse.image" :alt="currentHouse.title" />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  Search,
  Plus,
  Delete
} from '@element-plus/icons-vue'

const router = useRouter();

// 搜索表单
const searchForm = ref({
  name: '',
  addTime: ''
})

// 选中项
const selectedItems = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗控制
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const currentHouse = ref(null)

// 编辑表单
const editForm = ref({
  id: '',
  title: '',
  originalPrice: 0,
  currentPrice: 0,
  location: '',
  status: ''
})

const editFormRef = ref(null)

// 编辑表单验证规则
const editRules = {
  title: [
    { required: true, message: '请输入房源名称', trigger: 'blur' }
  ],
  originalPrice: [
    { required: true, message: '请输入原价格', trigger: 'blur' }
  ],
  currentPrice: [
    { required: true, message: '请输入现价', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请选择国家/地区', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择审核状态', trigger: 'change' }
  ]
}

// 房源数据
const houseList = ref([
  {
    id: '987767',
    title: 'xxxxxxx',
    originalPrice: 9999,
    currentPrice: 7959,
    location: '中国',
    addTime: 'xxx',
    status: '通过',
    image: 'https://via.placeholder.com/300x200?text=房源图片1'
  },
  {
    id: '987768',
    title: 'xxxxxxxxx',
    originalPrice: 9999,
    currentPrice: 7959,
    location: '中国',
    addTime: 'xxx',
    status: '通过',
    image: 'https://via.placeholder.com/300x200?text=房源图片2'
  },
  {
    id: '987769',
    title: 'xxxxxx',
    originalPrice: 9999,
    currentPrice: 7959,
    location: '中国',
    addTime: 'xxx',
    status: '通过',
    image: 'https://via.placeholder.com/300x200?text=房源图片3'
  },
  {
    id: '987770',
    title: 'xxxxxx',
    originalPrice: 9999,
    currentPrice: 7959,
    location: '中国',
    addTime: 'xxx',
    status: '通过',
    image: 'https://via.placeholder.com/300x200?text=房源图片4'
  },
  {
    id: '987771',
    title: 'xxxxxx',
    originalPrice: 9999,
    currentPrice: 7959,
    location: '中国',
    addTime: 'xxx',
    status: '通过',
    image: 'https://via.placeholder.com/300x200?text=房源图片5'
  },
  {
    id: '987772',
    title: 'xxxxxx',
    originalPrice: 9999,
    currentPrice: 7959,
    location: '中国',
    addTime: 'xxx',
    status: '通过',
    image: 'https://via.placeholder.com/300x200?text=房源图片6'
  },
  {
    id: '987773',
    title: 'xxxxxx',
    originalPrice: 9999,
    currentPrice: 7959,
    location: '中国',
    addTime: 'xxx',
    status: '通过',
    image: 'https://via.placeholder.com/300x200?text=房源图片7'
  },
  {
    id: '987774',
    title: 'xxxxxxxxx',
    originalPrice: 9999,
    currentPrice: 7959,
    location: '中国',
    addTime: 'xxx',
    status: '通过',
    image: 'https://via.placeholder.com/300x200?text=房源图片8'
  },
  {
    id: '987775',
    title: 'xxxxxxxxx',
    originalPrice: 9999,
    currentPrice: 7959,
    location: '中国',
    addTime: 'xxx',
    status: '通过',
    image: 'https://via.placeholder.com/300x200?text=房源图片9'
  },
  {
    id: '987776',
    title: 'xxxxxxxxx',
    originalPrice: 9999,
    currentPrice: 7959,
    location: '中国',
    addTime: 'xxx',
    status: '通过',
    image: 'https://via.placeholder.com/300x200?text=房源图片10'
  }
])

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

// 方法
const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success('查询完成')
}

const handleReset = () => {
  searchForm.value = {
    name: '',
    addTime: ''
  }
  currentPage.value = 1
  ElMessage.success('重置完成')
}

const handleAdd = () => {
  router.push('/house/add')
}

const handleEdit = (row) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
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

const handleEditSubmit = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate((valid) => {
    if (valid) {
      if (editForm.value.id) {
        // 编辑
        const index = houseList.value.findIndex(item => item.id === editForm.value.id)
        if (index > -1) {
          houseList.value[index] = { ...editForm.value }
          ElMessage.success('编辑成功')
        }
      } else {
        // 新增
        editForm.value.id = '987767'
        editForm.value.image = 'https://via.placeholder.com/300x200?text=新房源图片'
        houseList.value.unshift({ ...editForm.value })
        ElMessage.success('添加成功')
      }
      editDialogVisible.value = false
    }
  })
}

const handleEditClose = () => {
  editDialogVisible.value = false
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
}

const handleBatchDelete = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要删除的项目')
    return
  }
  deleteDialogVisible.value = true
}

const confirmBatchDelete = () => {
  const selectedIds = selectedItems.value.map(item => item.id)
  houseList.value = houseList.value.filter(item => !selectedIds.includes(item.id))
  selectedItems.value = []
  deleteDialogVisible.value = false
  ElMessage.success(`成功删除 ${selectedIds.length} 条记录`)
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

    .el-button {
      margin-right: 10px;
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
