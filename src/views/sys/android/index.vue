<template>
  <div class="app-container">
    <el-row :gutter="20" class="header">
      <el-col :span="7">
        <el-input placeholder="请输入应用版本号..." v-model="queryForm.query" clearable></el-input>
      </el-col>
      <el-button type="primary" :icon="Search" @click="initAndroidApplicationList">搜索</el-button>
      <el-button type="success" :icon="DocumentAdd" @click="handleDialogValue()">新增</el-button>
      <el-popconfirm title="您确定批量删除这些记录吗？" @confirm="handleDelete(null)">
        <template #reference>
          <el-button type="danger" :disabled="delBtnStatus" :icon="Delete">批量删除</el-button>
        </template>
      </el-popconfirm>
    </el-row>
    <el-table :data="tableData" stripe style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column prop="name" label="应用名" width="80" align="center"/>
      <el-table-column prop="icon" label="应用图标" width="80" align="center">
        <template v-slot="scope">
          <img :src="getServerUrl() + 'image/androidApplicationPicture/' + scope.row.icon" width="50" height="50"
               alt="应用图标"/>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="版本代码" width="80" align="center"/>
      <el-table-column prop="version" label="版本号" width="100" align="center"/>
      <el-table-column prop="content" label="关于应用" width="120" align="center">
        <template v-slot="scope">
          <p class="cell-overflow-ellipsis">{{ scope.row.content }}</p>
        </template>
      </el-table-column>
      <el-table-column label="APK" width="100" align="center">
        <template v-slot="scope">
          <el-text v-if="scope.row.url" class="mx-1" type="primary"
                   @click="handleDownloadAPK(scope.row.url)">
            {{ scope.row.url }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小（MB）" width="100" align="center"/>
      <el-table-column prop="uploadTime" label="上传时间" width="200" align="center" :formatter="formatDateTime"/>
      <el-table-column prop="force" label="强制更新" width="120" align="center" :formatter="forceFormat"/>
      <el-table-column prop="status" label="状态" width="120" align="center" :formatter="stateFormat"/>
      <el-table-column prop="action" label="操作" width="200" fixed="right" align="center">
        <template v-slot="scope">
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
          @initAndroidApplicationList="initAndroidApplicationList"/>
</template>

<script setup>
import {ref} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
import {Search, Delete, DocumentAdd, Edit, Tools, RefreshRight} from '@element-plus/icons-vue';
import Dialog from './components/dialog';
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
const dialogTitle = ref("");
const id = ref(-1);
const delBtnStatus = ref(true);
const multipleSelection = ref([]);

const handleSelectionChange = (selection) => {
  console.log("勾选了");
  console.log(selection);
  multipleSelection.value = selection;
  delBtnStatus.value = selection.length === 0;
};

const initAndroidApplicationList = async () => {
  const res = await requestUtil.post("sys/android/list", queryForm.value);
  tableData.value = res.data.androidApplicationList;
  total.value = res.data.total;
};

initAndroidApplicationList();

const handleSizeChange = (pageSize) => {
  queryForm.value.pageNum = 1;
  queryForm.value.pageSize = pageSize;
  initAndroidApplicationList();
};

const handleCurrentChange = (pageNum) => {
  queryForm.value.pageNum = pageNum;
  initAndroidApplicationList();
};

const handleDialogValue = (androidApplicationId) => {
  if (androidApplicationId) {
    id.value = androidApplicationId;
    dialogTitle.value = "安卓应用修改";
  } else {
    id.value = -1;
    dialogTitle.value = "安卓应用添加";
  }
  dialogVisible.value = true;
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
  const res = await requestUtil.post("sys/android/delete", ids);
  if (res.data.code === 200) {
    ElMessage({
      type: 'success',
      message: '执行成功!'
    });
    initAndroidApplicationList();
  } else {
    ElMessage({
      type: 'error',
      message: res.data.msg,
    });
  }
};

const handleDownloadAPK = async (filename) => {
  try {
    // 创建隐藏的a标签
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = getServerUrl() + "sys/android/downloadAPK/" + filename;
    // 设置download属性为文件名
    link.setAttribute('download', filename || 'download');
    // 添加到页面并触发点击
    document.body.appendChild(link);
    link.click();
    // 移除链接
    document.body.removeChild(link);
    ElMessage.success("APK文件开始下载！");
  } catch (error) {
    ElMessage.error('APK文件下载失败，请重试！', error);
  }
}

const forceFormat = (row, column) => {
  if (row.force === 0) {
    return '否';
  } else {
    return '是';
  }
};

const stateFormat = (row, column) => {
  if (row.status === 0) {
    return '正常';
  } else {
    return '禁用';
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