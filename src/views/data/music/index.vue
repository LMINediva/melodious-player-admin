<template>
  <div class="app-container">
    <el-row :gutter="20" class="header">
      <el-col :span="7">
        <el-input placeholder="请输入音乐名..." v-model="queryForm.query" clearable></el-input>
      </el-col>
      <el-button type="primary" :icon="Search" @click="initMusicList">搜索</el-button>
      <el-button type="success" :icon="DocumentAdd" @click="handleDialogValue()">新增</el-button>
      <el-popconfirm title="您确定批量删除这些记录吗？" @confirm="handleDelete(null)">
        <template #reference>
          <el-button type="danger" :disabled="delBtnStatus" :icon="Delete">批量删除</el-button>
        </template>
      </el-popconfirm>
    </el-row>
    <el-table :data="tableData" stripe style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column prop="type" label="音乐类型" width="80" align="center"/>
      <el-table-column prop="title" label="音乐名" width="100" align="center"/>
      <el-table-column prop="artistName" label="歌手名称" width="100" align="center"/>
      <el-table-column prop="description" label="描述" width="200" align="center">
        <template v-slot="scope">
          <p class="cell-overflow-ellipsis">{{ scope.row.description }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="posterPic" label="海报图片" width="80" align="center">
        <template v-slot="scope">
          <img :src="getServerUrl() + 'image/musicPicture/' + scope.row.posterPic" width="50" height="50"
               alt="海报图片"/>
        </template>
      </el-table-column>
      <el-table-column prop="thumbnailPic" label="缩略图" width="80" align="center">
        <template v-slot="scope">
          <img :src="getServerUrl() + 'image/musicPicture/' + scope.row.thumbnailPic" width="50" height="50"
               alt="缩略图"/>
        </template>
      </el-table-column>
      <el-table-column prop="sysUser.username" label="创建用户" width="100" align="center"/>
      <el-table-column label="歌词" width="100" align="center">
        <template v-slot="scope">
          <el-text v-if="scope.row.lyric" class="mx-1" type="primary"
                   @click="handleLyricDialogValue(scope.row.id, scope.row.title, scope.row.lyric)">
            {{ scope.row.lyric }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="url" label="音乐" width="100" align="center">
        <template v-slot="scope">
          <el-text v-if="scope.row.url" class="mx-1" type="primary"
                   @click="handleAudioDialogValue(scope.row.id, scope.row.title, scope.row.url)">
            {{ scope.row.url }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="hdUrl" label="高品质音乐" width="100" align="center">
        <template v-slot="scope">
          <el-text v-if="scope.row.hdUrl" class="mx-1" type="primary"
                   @click="handleAudioDialogValue(scope.row.id, scope.row.title, scope.row.hdUrl)">
            {{ scope.row.hdUrl }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="uhdUrl" label="超高品质音乐" width="100" align="center">
        <template v-slot="scope">
          <el-text v-if="scope.row.uhdUrl" class="mx-1" type="primary"
                   @click="handleAudioDialogValue(scope.row.id, scope.row.title, scope.row.uhdUrl)">
            {{ scope.row.uhdUrl }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="musicSize" label="音乐大小（MB）" width="120" align="center"/>
      <el-table-column prop="hdMusicSize" label="高品质音乐大小（MB）" width="120" align="center"/>
      <el-table-column prop="uhdMusicSize" label="超高品质音乐大小（MB）" width="120" align="center"/>
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
          @initMusicList="initMusicList"/>
  <LyricDialog v-model="lyricDialogVisible" :dialogVisible="lyricDialogVisible"
               :id="id" :dialogTitle="lyricDialogTitle"/>
  <AudioDialog v-model="audioDialogVisible" :dialogVisible="audioDialogVisible"
               :id="id" :dialogTitle="audioDialogTitle"/>
</template>

<script setup>
import {ref} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
import {Search, Delete, DocumentAdd, Edit, Tools, RefreshRight} from '@element-plus/icons-vue';
import Dialog from './components/dialog';
import {ElMessage, ElMessageBox} from 'element-plus';
import LyricDialog from './components/lyricDialog.vue';
import AudioDialog from "./components/audioDialog.vue";
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
const lyricDialogVisible = ref(false);
const audioDialogVisible = ref(false);
const dialogTitle = ref("");
const lyricDialogTitle = ref("");
const audioDialogTitle = ref("");
const id = ref(-1);
const delBtnStatus = ref(true);
const multipleSelection = ref([]);

const handleSelectionChange = (selection) => {
  console.log("勾选了");
  console.log(selection);
  multipleSelection.value = selection;
  delBtnStatus.value = selection.length === 0;
};

const initMusicList = async () => {
  let res;
  if (currentUser.value.username !== 'java1234') {
    queryForm.value.sysUser = currentUser;
    res = await requestUtil.post("data/music/myList", queryForm.value);
  } else {
    res = await requestUtil.post("data/music/list", queryForm.value);
  }
  tableData.value = res.data.musicList;
  total.value = res.data.total;
};

initMusicList();

const handleSizeChange = (pageSize) => {
  queryForm.value.pageNum = 1;
  queryForm.value.pageSize = pageSize;
  initMusicList();
};

const handleCurrentChange = (pageNum) => {
  queryForm.value.pageNum = pageNum;
  initMusicList();
};

const handleDialogValue = (musicId) => {
  if (musicId) {
    id.value = musicId;
    dialogTitle.value = "在线音乐修改";
  } else {
    id.value = -1;
    dialogTitle.value = "在线音乐添加";
  }
  dialogVisible.value = true;
};

const handleLyricDialogValue = (musicId, musicName, lyric) => {
  id.value = musicId;
  if (lyric) {
    lyricDialogTitle.value = musicName + " : " + lyric;
  } else {
    lyricDialogTitle.value = "没找到歌词";
  }
  lyricDialogVisible.value = true;
};

const handleAudioDialogValue = (musicId, musicName, audio) => {
  id.value = musicId;
  if (audio) {
    audioDialogTitle.value = musicName + " : " + audio;
  } else {
    audioDialogTitle.value = "没找到音频";
  }
  audioDialogVisible.value = true;
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
  const res = await requestUtil.post("data/music/delete", ids);
  if (res.data.code === 200) {
    ElMessage({
      type: 'success',
      message: '执行成功!'
    });
    initMusicList();
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