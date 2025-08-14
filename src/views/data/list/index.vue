<template>
  <div class="app-container">
    <el-row :gutter="20" class="header">
      <el-col :span="7">
        <el-input placeholder="请输入悦单名..." v-model="queryForm.query" clearable></el-input>
      </el-col>
      <el-button type="primary" :icon="Search" @click="initList">搜索</el-button>
      <el-button type="success" :icon="DocumentAdd" @click="handleDialogValue(null)">新增</el-button>
      <el-popconfirm title="您确定批量删除这些记录吗？" @confirm="handleDelete(null)">
        <template #reference>
          <el-button type="danger" :disabled="delBtnStatus" :icon="Delete">批量删除</el-button>
        </template>
      </el-popconfirm>
    </el-row>
    <el-table :data="tableData" stripe style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column prop="title" label="悦单名" width="100" align="center"/>
      <el-table-column prop="thumbnailPic" label="缩略图" width="80" align="center">
        <template v-slot="scope">
          <img :src="getServerUrl() + 'image/listPicture/' + scope.row.thumbnailPic" width="50" height="50"
               alt="缩略图"/>
        </template>
      </el-table-column>
      <el-table-column prop="sysUser.username" label="创建用户" width="100" align="center"/>
      <el-table-column prop="videoCount" label="视频数量" width="100" align="center">
        <template v-slot="scope">
          <el-text v-if="scope.row.videoCount !== 0" class="mx-1" type="primary"
                   @click="handleVideoDialogValue(scope.row.id, scope.row.title, scope.row.mvList)">
            {{ scope.row.videoCount }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" width="200" align="center">
        <template v-slot="scope">
          <p class="cell-overflow-ellipsis">{{ scope.row.description }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="类型" width="100" align="center"/>
      <el-table-column prop="status" label="状态" width="120" align="center" :formatter="stateFormat"/>
      <el-table-column prop="totalViews" label="总浏览量" width="100" align="center"/>
      <el-table-column prop="totalFavorites" label="点赞量" width="100" align="center"/>
      <el-table-column prop="createdTime" label="创建时间" width="100" align="center" :formatter="formatDateTime"/>
      <el-table-column prop="updateTime" label="更新时间" width="100" align="center" :formatter="formatDateTime"/>
      <el-table-column prop="integral" label="积分" width="100" align="center"/>
      <el-table-column prop="weekIntegral" label="周积分" width="100" align="center"/>
      <el-table-column prop="totalUser" label="总积分" width="100" align="center"/>
      <el-table-column prop="rank" label="排名" width="100" align="center"/>
      <el-table-column prop="action" label="操作" width="400" fixed="right" align="center">
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
          @initList="initList"/>
  <VideoDialog v-model="videoDialogVisible" :dialogVisible="videoDialogVisible"
               :id="id" :dialogTitle="videoDialogTitle"/>
</template>

<script setup>
import {ref} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
import {Search, Delete, DocumentAdd, Edit, Tools, RefreshRight} from '@element-plus/icons-vue';
import moment from 'moment-timezone';
import Dialog from './components/dialog';
import {ElMessage, ElMessageBox} from 'element-plus';
import VideoDialog from './components/videoDialog.vue';

const tableData = ref([]);
const total = ref(0);
const queryForm = ref({
  query: '',
  pageNum: 1,
  pageSize: 10
});

const dialogVisible = ref(false);
const videoDialogVisible = ref(false);
const dialogTitle = ref("");
const videoDialogTitle = ref("");
const id = ref(-1);
const delBtnStatus = ref(true);
const multipleSelection = ref([]);

const handleSelectionChange = (selection) => {
  console.log("勾选了");
  console.log(selection);
  multipleSelection.value = selection;
  delBtnStatus.value = selection.length === 0;
};

const initList = async () => {
  const res = await requestUtil.post("data/list/list", queryForm.value);
  tableData.value = res.data.playList;
  total.value = res.data.total;
};

initList();

const handleSizeChange = (pageSize) => {
  queryForm.value.pageNum = 1;
  queryForm.value.pageSize = pageSize;
  initList();
};

const handleCurrentChange = (pageNum) => {
  queryForm.value.pageNum = pageNum;
  initList();
};

const handleDialogValue = (listId) => {
  if (listId) {
    id.value = listId;
    dialogTitle.value = "在线悦单修改";
  } else {
    id.value = -1;
    dialogTitle.value = "在线悦单添加";
  }
  dialogVisible.value = true;
};

const handleVideoDialogValue = (listId, listName, mvArray) => {
  id.value = listId;
  if (mvArray) {
    videoDialogTitle.value = listName;
  } else {
    videoDialogTitle.value = "没找到";
  }
  videoDialogVisible.value = true;
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
  const res = await requestUtil.post("data/list/delete", ids);
  if (res.data.code === 200) {
    ElMessage({
      type: 'success',
      message: '执行成功!'
    });
    initList();
  } else {
    ElMessage({
      type: 'error',
      message: res.data.msg,
    });
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