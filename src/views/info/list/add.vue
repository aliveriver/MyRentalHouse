<template>
  <div class="info-add">
    <div class="header">
      <h2>{{ isEdit ? '编辑资讯' : isView ? '资讯详情' : '新增资讯' }}</h2>
    </div>
    <div class="form-content">
      <el-form
        :model="form"
        :rules="isView ? {} : rules"
        ref="formRef"
        label-width="100px"
        :disabled="isView"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资讯标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="输入资讯标题"
                :readonly="isView"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资讯分类" prop="infocategoryid">
              <el-select
                v-model="form.infocategoryid"
                placeholder="请选择分类"
                style="width: 100%"
                :disabled="isView"
              >
                <el-option
                  v-for="item in informationcategoriesTags"
                  :key="item.id"
                  :label="item.value"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布日期" prop="publishdate">
              <el-date-picker
                v-model="form.publishdate"
                type="date"
                placeholder="请选择发布日期"
                style="width: 100%"
                :disabled="isView"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="关联标签" prop="tagIds">
              <el-select
                v-model="form.tagIds"
                placeholder="请选择关联标签"
                style="width: 100%"
                :disabled="isView"
                multiple
              >
                <el-option
                  v-for="tag in infoTags"
                  :key="tag.id"
                  :label="tag.value"
                  :value="tag.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="资讯内容" prop="content">
              <el-input
                type="textarea"
                v-model="form.content"
                placeholder="请输入资讯内容，至少50个字符"
                :rows="8"
                :readonly="isView"
                maxlength="5000"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="footer">
      <div class="header-actions" v-if="!isView">
        <el-button @click="handleCancel" :disabled="loading">取消</el-button>
        <el-button @click="handleSaveDraft" :disabled="loading">
          保存草稿
        </el-button>
        <el-button type="primary" @click="handlePublish" :loading="loading">
          {{ isEdit ? '更新资讯' : '发布资讯' }}
        </el-button>
      </div>
      <div class="header-actions" v-else>
        <el-button @click="handleBack">返回</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { infoApi } from '@/api/index'
import { infoTags, informationcategoriesTags } from "@/constant/tags"
import useStore from '@/store/index'
const store = useStore()

const router = useRouter()
const route = useRoute()

// 页面状态
const isEdit = ref(false)
const isView = ref(false)
const loading = ref(false)
const formRef = ref(null)

// 表单数据
const form = ref({
  title: '',
  content: '',
  infocategoryid: null,
  publisherid: store.getUserInfo?.userid,
  publishdate: '',
  tagIds: []
})


// 分类映射
const categoryMap = {
  1: '房产新闻',
  2: '购房指南',
  3: '装修知识',
  4: '政策解读',
  5: '市场分析'
}

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入资讯标题', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入资讯内容', trigger: 'blur' },
  ],
  infocategoryid: [
    { required: true, message: '请选择资讯分类', trigger: 'change' }
  ],
  publishdate: [
    { required: true, message: '请选择发布日期', trigger: 'change' }
  ]
}

// 初始化页面
const initPage = async () => {
  const { id, mode } = route.query

  if (mode === 'view') {
    isView.value = true
  } else if (id) {
    isEdit.value = true
  }

  if (id) {
    await loadInfoData(id)
  } else {
    // 新建时设置默认值
    const today = new Date().toISOString().split('T')[0]
    form.value.publishdate = today
  }
}

// 加载资讯数据
const loadInfoData = async (infoid) => {
  try {
    loading.value = true
    const response = await infoApi.getInfoById(infoid)

    if (response.success) {
      const data = response.data
      form.value = {
        infoid: data.infoid,
        title: data.title || '',
        content: data.content || '',
        infocategoryid: data.infocategoryid,
        publisherid: data.publisherid,
        publishdate: data.publishdate || '',
        tagIds: data.tagIds || []
      }
    } else {
      ElMessage.error(response.data?.errorMsg || '获取资讯数据失败')
      router.back()
    }
  } catch (error) {
    console.error('加载资讯数据失败:', error)
    ElMessage.error('获取资讯数据失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = async () => {
  // 检查是否有未保存的更改
  const hasChanges = Object.keys(form.value).some(key => {
    if (key === 'tagIds') {
      return JSON.stringify(form.value[key]) !== JSON.stringify([])
    }
    return form.value[key] !== (key === 'publishdate' ? new Date().toISOString().split('T')[0] : '')
  })

  if (hasChanges) {
    try {
      await ElMessageBox.confirm(
        '当前有未保存的更改，确定要取消吗？',
        '确认取消',
        {
          confirmButtonText: '确定',
          cancelButtonText: '继续编辑',
          type: 'warning',
        }
      )
    } catch {
      return
    }
  }

  router.back()
}

// 保存草稿
const handleSaveDraft = () => {
  ElMessage.info('草稿保存功能待实现')
}

// 发布/更新资讯
const handlePublish = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
    return
  }

  try {
    loading.value = true

    // 准备提交的数据
    const submitData = {
      title: form.value.title,
      content: form.value.content,
      infocategoryid: form.value.infocategoryid,
      publisherid: form.value.publisherid,
      publishdate: form.value.publishdate,
      tagIds: form.value.tagIds
    }

    let response
    if (isEdit.value) {
      response = await infoApi.updateInfo(form.value.infoid, submitData)
    } else {
      response = await infoApi.createInfo(submitData)
    }

    if (response.success) {
      ElMessage.success(isEdit.value ? '资讯更新成功' : '资讯发布成功')
      router.push('/info/list')
    } else {
      ElMessage.error(response.data?.errorMsg || (isEdit.value ? '更新失败' : '发布失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '发布失败')
  } finally {
    loading.value = false
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 编辑（从查看模式切换到编辑模式）
const handleEdit = () => {
  const query = { ...route.query }
  delete query.mode
  router.replace({ query })
}

// 组件挂载时初始化
onMounted(() => {
  initPage()
})
</script>

<style scoped>

.header {
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 500;
}

.form-content {
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

.content-preview {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 20px;
  background-color: #fafafa;
}

.preview-header h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
}

.preview-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  color: #909399;
  font-size: 14px;
}

.preview-content {
  background: white;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: #606266;
  min-height: 100px;
}

.preview-tags {
  border-top: 1px solid #e4e7ed;
  padding-top: 15px;
}

.footer {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.header-actions .el-button {
  margin: 0 10px;
  min-width: 100px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

:deep(.el-input__count) {
  color: #909399;
}

:deep(.el-select .el-tag) {
  margin: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-add {
    padding: 10px;
  }

  .form-content {
    padding: 20px;
  }

  .preview-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
