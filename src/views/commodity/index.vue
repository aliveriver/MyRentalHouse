<template>
  <div>
    <div class="tool">
      <el-button type="primary" @click="addGoods">新增商品</el-button>
    </div>
    <el-table :data="pagerData" style="width: 100%; margin-bottom: 15px;">
      <el-table-column label="商品编号" prop="id" />
      <el-table-column label="商品名称" prop="name" />
      <el-table-column label="价格" prop="price" />
      <el-table-column label="库存" prop="number" />
      <el-table-column label="简介" prop="desc">
        <template #default="{ row }">
          <div v-html="row.desc"></div>
        </template>
      </el-table-column>
      <el-table-column label="图片" prop="image">
        <template #default="{ row, $index }">
          <el-button type="warning" @click="editGoods(row, $index)">编辑</el-button>
          <el-popconfirm title="确认删除该商品?" @confirm="delGoods(row, $index)">
            <template #reference>
              <el-button type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="prev, pager, next" :page-size="pager.size" :total="pager.total"
      @change="pageChange" />
  </div>

  <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="500" top="10px">
    <el-form :model="form">
      <el-form-item label="商品名称">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="分类名称">
        <el-input v-model="form.classifyName" autocomplete="off" />
      </el-form-item>
      <el-form-item label="商品价格">
        <el-input v-model="form.price" autocomplete="off" />
      </el-form-item>
      <el-form-item label="商品图片">
        <el-upload v-model:file-list="form.image" class="upload-demo"
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" multiple>
          <el-button type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">
              jpg/png 小于 500KB 的文件。
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="商品库存">
        <el-input v-model="form.number" autocomplete="off" />
      </el-form-item>
      <el-form-item label="商品规格">
        <el-input v-model="form.pacification" autocomplete="off" />
      </el-form-item>
      <el-form-item label="商品简介">
        <div style="border: 1px solid #ccc">
          <Toolbar style="border-bottom: 1px solid #ccc" mode="simple" :editor="editorRef" />
          <Editor style="height: 200px; overflow-y: hidden;" v-model="form.desc" mode="simple"
            @onCreated="handleCreated" />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ref, reactive, computed } from 'vue'

const tableData = reactive([
  { id: 'GD001', name: '商品A', price: 100, number: 10, image: '商品A图片', operation: '操作' },
  { id: 'GD002', name: '商品B', price: 150, number: 20, image: '商品B图片', operation: '操作' },
  { id: 'GD003', name: '商品C', price: 200, number: 30, image: '商品C图片', operation: '操作' },
  { id: 'GD004', name: '商品D', price: 250, number: 40, image: '商品D图片', operation: '操作' },
  { id: 'GD005', name: '商品E', price: 300, number: 50, image: '商品E图片', operation: '操作' },
  { id: 'GD006', name: '商品F', price: 350, number: 60, image: '商品F图片', operation: '操作' },
  { id: 'GD007', name: '商品G', price: 400, number: 70, image: '商品G图片', operation: '操作' },
  { id: 'GD008', name: '商品H', price: 450, number: 80, image: '商品H图片', operation: '操作' },
  { id: 'GD009', name: '商品I', price: 500, number: 90, image: '商品I图片', operation: '操作' },
  { id: 'GD010', name: '商品J', price: 550, number: 100, image: '商品J图片', operation: '操作' },
  { id: 'GD011', name: '商品K', price: 600, number: 110, image: '商品K图片', operation: '操作' },
  { id: 'GD012', name: '商品L', price: 650, number: 120, image: '商品L图片', operation: '操作' },
  { id: 'GD013', name: '商品M', price: 700, number: 130, image: '商品M图片', operation: '操作' },
  { id: 'GD014', name: '商品N', price: 750, number: 140, image: '商品N图片', operation: '操作' },
  { id: 'GD015', name: '商品O', price: 800, number: 150, image: '商品O图片', operation: '操作' }
])

const pager = reactive({
  page: 1,
  size: 10,
  total: tableData.length,
})

const pagerData = computed(() => tableData.slice((pager.page - 1) * pager.size, pager.page * pager.size))
const pageChange = (currentPage) => {
  pager.page = currentPage;
}

const addGoods = () => {
  dialogTitle.value = "新增商品"
  dialogFormVisible.value = true;
}
const editGoods = (row, index) => {
  dialogTitle.value = "编辑商品"
  dialogFormVisible.value = true;
  form.value = JSON.parse(JSON.stringify(row));
  form.value.image = [];
}
const delGoods = (row, index) => {
  tableData.splice(index, 1)
}

const dialogTitle = ref("新增商品");
const dialogFormVisible = ref(false);
const form = ref({
  name: "",
  classifyName: "",
  price: "",
  image: [],
  number: "",
  pacification: "",
  desc: "",
})

const editorRef = ref(null);
const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const confirm = () => {
  if (dialogTitle.value === "新增商品") {
    tableData.unshift({
      id: Math.random().toString().slice(-5),
      ...form.value
    });
    form.value = {
      name: "",
      classifyName: "",
      price: "",
      image: [],
      number: "",
      pacification: "",
      desc: "",
    }
  } else {
    const findIndex = tableData.findIndex(item => item.id === form.value.id);
    if (findIndex !== -1) {
      tableData[findIndex] = form.value;
    }
  }
  dialogFormVisible.value = false;
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