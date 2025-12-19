<template>
  <div class="app-container">
    <el-row :gutter="20" class="header">
      <el-col :span="7">
        <el-input placeholder="请输入MV名..." v-model="queryForm.query" clearable></el-input>
      </el-col>
      <el-button type="primary" :icon="Search" @click="initMVList">搜索</el-button>
      <el-button type="success" :icon="DocumentAdd" @click="handleDialogValue(null)">新增</el-button>
      <el-popconfirm title="您确定批量删除这些记录吗？" @confirm="handleDelete(null)">
        <template #reference>
          <el-button type="danger" :disabled="delBtnStatus" :icon="Delete">批量删除</el-button>
        </template>
      </el-popconfirm>
    </el-row>
    <el-table :data="tableData" stripe style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column prop="title" label="MV名" width="100" align="center"/>
      <el-table-column prop="description" label="描述" width="200" align="center">
        <template v-slot="scope">
          <p class="cell-overflow-ellipsis">{{ scope.row.description }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="artistName" label="歌手名称" width="100" align="center"/>
      <el-table-column prop="posterPic" label="海报图片" width="80" align="center">
        <template v-slot="scope">
          <img :src="getServerUrl() + 'image/mvPicture/' + scope.row.posterPic" width="50" height="50"
               alt="海报图片"/>
        </template>
      </el-table-column>
      <el-table-column prop="thumbnailPic" label="缩略图" width="80" align="center">
        <template v-slot="scope">
          <img :src="getServerUrl() + 'image/mvPicture/' + scope.row.thumbnailPic" width="50" height="50"
               alt="缩略图"/>
        </template>
      </el-table-column>
      <el-table-column prop="sysUser.username" label="创建用户" width="100" align="center"/>
      <el-table-column prop="mvArea.name" label="区域" width="100" align="center"/>
      <el-table-column label="MV" width="100" align="center">
        <template v-slot="scope">
          <el-text v-if="scope.row.url" class="mx-1 pointer-cursor" type="primary"
                   @click="handleVideoDialogValue(scope.row.id, scope.row.title, scope.row.url)">
            {{ scope.row.url }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column label="高清MV" width="100" align="center">
        <template v-slot="scope">
          <el-text v-if="scope.row.hdUrl" class="mx-1 pointer-cursor" type="primary"
                   @click="handleVideoDialogValue(scope.row.id, scope.row.title, scope.row.hdUrl)">
            {{ scope.row.hdUrl }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column label="超高清MV" width="100" align="center">
        <template v-slot="scope">
          <el-text v-if="scope.row.uhdUrl" class="mx-1 pointer-cursor" type="primary"
                   @click="handleVideoDialogValue(scope.row.id, scope.row.title, scope.row.uhdUrl)">
            {{ scope.row.uhdUrl }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="regdate" label="发行时间" width="100" align="center" :formatter="formatDateTime"/>
      <el-table-column prop="videoSourceTypeName" label="视频类型" width="100" align="center"/>
      <el-table-column prop="videoSize" label="MV大小（MB）" width="120" align="center"/>
      <el-table-column prop="hdVideoSize" label="高清MV大小（MB）" width="120" align="center"/>
      <el-table-column prop="uhdVideoSize" label="超高清MV大小（MB）" width="120" align="center"/>
      <el-table-column prop="duration" label="MV时长" width="100" align="center"/>
      <el-table-column prop="totalViews" label="总浏览量" width="80" align="center"/>
      <el-table-column prop="totalPcViews" label="PC端浏览量" width="80" align="center"/>
      <el-table-column prop="totalMobileViews" label="手机端浏览量" width="80" align="center"/>
      <el-table-column prop="totalComments" label="评论数" width="80" align="center"/>
      <el-table-column prop="status" label="状态" width="120" align="center" :formatter="stateFormat"/>
      <el-table-column prop="action" label="操作" width="200" fixed="right" align="center">
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
          @initMVList="initMVList"/>
  <VideoDialog v-model="videoDialogVisible" :dialogVisible="videoDialogVisible"
               :id="id" :dialogTitle="videoDialogTitle"/>
  <DetailDialog v-model="detailDialogVisible" :dialogVisible="detailDialogVisible"
                :id="id" :dialogTitle="detailDialogTitle"/>
</template>

<script setup>
import {ref} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
import {Search, Delete, DocumentAdd, Edit, Tools, RefreshRight, Tickets} from '@element-plus/icons-vue';
import moment from 'moment-timezone';
import Dialog from './components/dialog';
import {ElMessage, ElMessageBox} from 'element-plus';
import VideoDialog from './components/videoDialog.vue';
import DetailDialog from "./components/detailDialog.vue";
import store from "@/store";

const tableData = ref([]);
const total = ref(0);
const queryForm = ref({
  query: '',
  pageNum: 1,
  pageSize: 10,
  sysUser: {}
});

const currentUser = ref(store.getters.GET_USERINFO);
const dialogVisible = ref(false);
const videoDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const dialogTitle = ref("");
const videoDialogTitle = ref("");
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

const initMVList = async () => {
  let res;
  if (currentUser.value.username !== 'java1234') {
    queryForm.value.sysUser = currentUser;
    res = await requestUtil.post("data/mv/myList", queryForm.value);
  } else {
    res = await requestUtil.post("data/mv/list", queryForm.value);
  }
  tableData.value = res.data.mvList;
  total.value = res.data.total;
};

initMVList();

const handleSizeChange = (pageSize) => {
  queryForm.value.pageNum = 1;
  queryForm.value.pageSize = pageSize;
  initMVList();
};

const handleCurrentChange = (pageNum) => {
  queryForm.value.pageNum = pageNum;
  initMVList();
};

const handleDialogValue = (mvId) => {
  if (mvId) {
    id.value = mvId;
    dialogTitle.value = "在线MV修改";
  } else {
    id.value = -1;
    dialogTitle.value = "在线MV添加";
  }
  dialogVisible.value = true;
};

const handleVideoDialogValue = (mvId, mvName, url) => {
  id.value = mvId;
  if (url) {
    videoDialogTitle.value = mvName + " : " + url;
  } else {
    videoDialogTitle.value = "没找到MV";
  }
  videoDialogVisible.value = true;
};

const handleDetailDialogValue = (mvId) => {
  if (mvId) {
    id.value = mvId;
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
  const res = await requestUtil.post("data/mv/delete", ids);
  if (res.data.code === 200) {
    ElMessage({
      type: 'success',
      message: '执行成功!'
    });
    initMVList();
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

.pointer-cursor {
  cursor: pointer;
}
</style>