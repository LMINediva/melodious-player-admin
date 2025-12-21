<template>
  <el-dialog
      v-bind="dialogVisible"
      :title="dialogTitle"
      width="40%"
      @close="handleClose">
    <el-form
        ref="formRef"
        :model="form"
        label-width="100px">
      <el-form-item label="悦单名：">
        <el-text class="mx-1">{{ form.title }}</el-text>
      </el-form-item>
      <el-form-item label="缩略图：">
        <el-image :src="getServerUrl() + 'image/listPicture/' + form.thumbnailPic"
                  :preview-src-list="[getServerUrl() + 'image/listPicture/' + form.thumbnailPic]"
                  class="image" alt="缩略图"/>
      </el-form-item>
      <el-form-item label="创建用户：">
        <el-text class="mx-1">{{ form.sysUser.username }}</el-text>
      </el-form-item>
      <el-form-item label="视频数量：">
        <el-text class="mx-1">{{ form.videoCount }}</el-text>
      </el-form-item>
      <el-form-item label="MV：">
        <el-table :data="form.mvList.slice((queryForm.pageNum - 1) * queryForm.pageSize,
            (queryForm.pageNum - 1) * queryForm.pageSize + queryForm.pageSize)"
                  stripe style="width: 100%">
          <el-table-column prop="title" label="MV名" width="100" align="center"/>
          <el-table-column prop="artistName" label="歌手名称" width="100" align="center"/>
          <el-table-column prop="videoSourceTypeName" label="视频类型" width="100" align="center"/>
          <el-table-column label="海报图片" prop="posterPic">
            <template v-slot="scope">
              <img :src="getServerUrl() + 'image/mvPicture/' + scope.row.posterPic" width="50" height="50"
                   alt="海报图片"/>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="描述：">
        <el-text class="mx-1">{{ form.description }}</el-text>
      </el-form-item>
      <el-form-item label="类型：">
        <el-text class="mx-1">{{ form.category }}</el-text>
      </el-form-item>
      <el-form-item label="状态：">
        <el-text class="mx-1">{{ stateFormat(form.status) }}</el-text>
      </el-form-item>
      <el-form-item label="总浏览量：">
        <el-text class="mx-1">{{ form.totalViews }}</el-text>
      </el-form-item>
      <el-form-item label="点赞量：">
        <el-text class="mx-1">{{ form.totalFavorites }}</el-text>
      </el-form-item>
      <el-form-item label="创建时间：">
        <el-text class="mx-1">{{ formatDateTime(form.createTime) }}</el-text>
      </el-form-item>
      <el-form-item label="更新时间：">
        <el-text class="mx-1">{{ formatDateTime(form.updateTime) }}</el-text>
      </el-form-item>
      <el-form-item label="积分：">
        <el-text class="mx-1">{{ form.integral }}</el-text>
      </el-form-item>
      <el-form-item label="周积分：">
        <el-text class="mx-1">{{ form.weekIntegral }}</el-text>
      </el-form-item>
      <el-form-item label="总积分：">
        <el-text class="mx-1">{{ form.totalUser }}</el-text>
      </el-form-item>
      <el-form-item label="排名：">
        <el-text class="mx-1">{{ form.rank }}</el-text>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import {defineProps, ref, watch} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
import store from "@/store";
import moment from "moment-timezone";

const props = defineProps(
    {
      id: {
        type: Number,
        default: -1,
        required: true
      },
      dialogTitle: {
        type: String,
        default: '',
        required: true
      },
      dialogVisible: {
        type: Boolean,
        default: false,
        required: true
      }
    }
);

const queryForm = ref({
  query: '',
  pageNum: 1,
  pageSize: 10
});

const form = ref({
  id: -1,
  title: '',
  thumbnailPic: '',
  videoCount: 0,
  mvList: [],
  description: '',
  category: '',
  status: 0,
  totalViews: 0,
  totalFavorites: 0,
  updateTime: Date,
  createTime: Date,
  integral: 0,
  weekIntegral: 0,
  totalUser: 0,
  rank: 0,
  sysUser: {
    username: ""
  }
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("data/list/" + id);
  form.value = res.data.playItem;
};

watch(
    () => props.dialogVisible,
    () => {
      let id = props.id;
      initFormData(id);
    }
);

const formatDateTime = (time) => {
  if (!time) {
    return '';
  }
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
};

const stateFormat = (status) => {
  if (status === 0) {
    return '正常';
  } else {
    return '禁用';
  }
};

const handleClose = () => {
};
</script>

<style scoped>
.image {
  width: 150px;
  height: 150px;
}
</style>
