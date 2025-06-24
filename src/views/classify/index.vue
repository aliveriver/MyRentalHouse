<template>
  <div>
    <div class="tool">
      <el-button type="primary" @click="dialogFormVisible2 = true">新增分类</el-button>
    </div>
    <el-table :data="tableData" :border="parentBorder" style="width: 100%">
      <el-table-column type="expand" label="分类名称" width="100">
        <template #header="props">
          分类名称
        </template>
        <template #default="props">
          <el-table :data="props.row.subcategories" class="level2">
            <el-table-column label="分类名称" prop="name" width="100"></el-table-column>
            <el-table-column label="分类级别" prop="level" />
            <el-table-column label="分类编号" prop="id" />
            <el-table-column label="分类图片" prop="image" />
            <el-table-column label="操作" prop="operation">
              <template #default="{ row, $index }">
                <el-button type="warning" @click="editRow(props.row.subcategories, $index)">编辑</el-button>
                <el-popconfirm title="确认删除?" @confirm="delRow(props.row.subcategories, $index)">
                  <template #reference>
                    <el-button type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="分类级别" prop="level" />
      <el-table-column label="分类编号" prop="id" />
      <el-table-column label="分类图片" prop="image">
        <template #default="{ row }">
          <img :src="row.image" alt="" width="50" height="50">
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="operation">
        <template #default="{ row, $index }">
          <el-button type="warning" @click="editRow(tableData, $index)">编辑</el-button>
          <el-popconfirm title="确认删除?" @confirm="delRow(tableData, $index)">
            <template #reference>
              <el-button type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="dialogFormVisible" title="修改分类" width="500">
    <el-form :model="form">
      <el-form-item label="分类名称">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="二级分类">
        <el-radio-group v-model="form.twoClass">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上级分类" v-if="form.twoClass">
        <el-select v-model="form.parentClassify">
          <el-option label="食品" value="shiping" />
          <el-option label="衣服" value="yifu" />
        </el-select>
      </el-form-item>
      <el-form-item label="分类图片">
        <el-upload v-model:file-list="form.images" class="upload-demo"
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" multiple>
          <el-button type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">
              jpg/png 小于 500KB 的文件。
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="dialogFormVisible2" title="新增分类" width="500">
    <el-form :model="newform">
      <el-form-item label="分类名称">
        <el-input v-model="newform.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="二级分类">
        <el-radio-group v-model="newform.twoClass">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible2 = false">取消</el-button>
        <el-button type="primary" @click="addClassify">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'

const parentBorder = ref(false)
const tableData = reactive([
  {
    name: '分类1',
    level: '一级',
    id: '001',
    image: 'https://img0.baidu.com/it/u=3277825972,186028718&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
    operation: '操作1',
    subcategories: [
      { name: '子分类1-1', level: '二级', id: '001-1', image: 'image1-1.jpg', operation: '操作1-1' },
      { name: '子分类1-2', level: '二级', id: '001-2', image: 'image1-2.jpg', operation: '操作1-2' }
    ]
  },
  {
    name: '分类2',
    level: '一级',
    id: '002',
    image: 'image2.jpg',
    operation: '操作2',
    subcategories: [
      { name: '子分类2-1', level: '二级', id: '002-1', image: 'image2-1.jpg', operation: '操作2-1' },
      { name: '子分类2-2', level: '二级', id: '002-2', image: 'image2-2.jpg', operation: '操作2-2' }
    ]
  }
])
const editRow = (row, index) => {
  const r = row[index];
  dialogFormVisible.value = true;
  form.value.name = r.name
  form.value.parentClassify = r.level
}
const delRow = (row, index) => {
  row.splice(index, 1)
}

const dialogFormVisible = ref(false);
const form = ref({
  parentClassify: "",
  name: "",
  twoClass: true
})

const dialogFormVisible2 = ref(false);
const newform = ref({
  parentClassify: "",
  name: "",
  twoClass: true
})
const addClassify = () => {
  tableData.push({
    level: newform.value.name
  })
  dialogFormVisible2.value = false;
}
</script>

<style lang="scss" scoped>
.level2 :deep {
  .el-table__header {
    thead {
      display: none;
    }
  }
}
</style>