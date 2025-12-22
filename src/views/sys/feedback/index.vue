<template>
  <div class="app-container">
    <el-row :gutter="20" class="header">
      <el-col :span="7">
        <el-input placeholder="请输入反馈内容..." v-model="queryForm.query" clearable></el-input>
      </el-col>
      <el-button type="primary" :icon="Search" @click="initFeedbackList">搜索</el-button>
      <el-button type="success" :icon="DocumentAdd" @click="handleDialogValue()">新增</el-button>
      <el-popconfirm title="您确定批量删除这些记录吗？" @confirm="handleDelete(null)">
        <template #reference>
          <el-button type="danger" :disabled="delBtnStatus" :icon="Delete">批量删除</el-button>
        </template>
      </el-popconfirm>
    </el-row>
    <el-table :data="tableData" stripe style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column prop="content" label="反馈内容" width="120" align="center">
        <template v-slot="scope">
          <p class="cell-overflow-ellipsis">{{ scope.row.content }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="picture" label="反馈图片" width="80" align="center">
        <template v-slot="scope">
          <img :src="getServerUrl() + 'image/feedbackPicture/' + scope.row.picture" width="50" height="50"
               alt="反馈图片"/>
        </template>
      </el-table-column>
      <el-table-column prop="sysUser.username" label="反馈用户" width="100" align="center"/>
      <el-table-column prop="submissionTime" label="反馈时间" width="200" align="center" :formatter="formatDateTime"/>
      <el-table-column prop="action" label="操作" width="400" fixed="right" align="center">
        <template v-slot="scope">
          <el-button type="primary" :icon="Tickets" @click="handleDetailDialogValue(scope.row.id)"/>
          <el-button type="primary" :icon="Edit" @click="handleDialogValue(scope.row.id)"/>
          <el-popconfirm title="您确定要删除这条记录吗？" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button type="danger" :icon="Delete"/>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        :page-sizes="[10, 20, 30, 40]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />
  </div>
  <Dialog v-model="dialogVisible" :dialogVisible="dialogVisible" :id="id" :dialogTitle="dialogTitle"
          @initFeedbackList="initFeedbackList"/>
  <DetailDialog v-model="detailDialogVisible" :dialogVisible="detailDialogVisible"
                :id="id" :dialogTitle="detailDialogTitle"/>
</template>

<script setup>
import {ref} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
import {Search, Delete, DocumentAdd, Edit, Tickets} from '@element-plus/icons-vue';
import Dialog from './components/dialog';
import DetailDialog from "./components/detailDialog.vue";
import {ElMessage, ElMessageBox} from 'element-plus';
import moment from 'moment-timezone';

const tableData = ref([]);
const total = ref(0);
const queryForm = ref({
  query: '',
  pageNum: 1,
  pageSize: 10,
  sysUser: {}
});

const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const dialogTitle = ref("");
const detailDialogTitle = ref("");
const id = ref(-1);
const delBtnStatus = ref(true);
const multipleSelection = ref([]);

const handleSelectionChange = (selection) => {
  console.log("勾选了");
  console.log(selection);
  multipleSelection.value = selection;
  delBtnStatus.value = selection.length === 0;
};

const initFeedbackList = async () => {
  const res = await requestUtil.post("sys/feedback/list", queryForm.value);
  tableData.value = res.data.feedbackList;
  total.value = res.data.total;
};

initFeedbackList();

const handleSizeChange = (pageSize) => {
  queryForm.value.pageNum = 1;
  queryForm.value.pageSize = pageSize;
  initFeedbackList();
};

const handleCurrentChange = (pageNum) => {
  queryForm.value.pageNum = pageNum;
  initFeedbackList();
};

const handleDialogValue = (feedbackId) => {
  if (feedbackId) {
    id.value = feedbackId;
    dialogTitle.value = "反馈修改";
  } else {
    id.value = -1;
    dialogTitle.value = "反馈添加";
  }
  dialogVisible.value = true;
};

const handleDetailDialogValue = (feedbackId) => {
  if (feedbackId) {
    id.value = feedbackId;
    detailDialogTitle.value = "详情";
  } else {
    id.value = -1;
    detailDialogTitle.value = "没找到详情";
  }
  detailDialogVisible.value = true;
};

const handleDelete = async (id) => {
  var ids = [];
  if (id) {
    ids.push(id);
  } else {
    multipleSelection.value.forEach(row => {
      ids.push(row.id);
    });
  }
  const res = await requestUtil.post("sys/feedback/delete", ids);
  if (res.data.code === 200) {
    ElMessage({
      type: 'success',
      message: '执行成功!'
    });
    initFeedbackList();
  } else {
    ElMessage({
      type: 'error',
      message: res.data.msg,
    });
  }
};

const formatDateTime = (row, column, cellValue, index) => {
  if (!cellValue) {
    return '';
  }
  return moment(cellValue).format("YYYY-MM-DD HH:mm:ss");
};
</script>

<style lang="scss" scoped>
.header {
  padding-bottom: 16px;
  box-sizing: border-box;
}

.el-pagination {
  float: right;
  padding: 20px;
  box-sizing: border-box;
}

::v-deep th.el-table__cell {
  word-break: break-word;
  background-color: #f8f8f9 !important;
  color: #515a6e;
  height: 40px;
  font-size: 13px;

}

.el-tag--small {
  margin-left: 5px;
}

.cell-overflow-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>