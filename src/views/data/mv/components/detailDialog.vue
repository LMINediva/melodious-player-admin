<template>
  <el-dialog
      v-bind="dialogVisible"
      :title="dialogTitle"
      width="40%"
      @close="handleClose">
    <el-form
        ref="formRef"
        :model="form"
        label-width="200px">
      <el-form-item label="MV名：">
        <el-text class="mx-1">{{ form.title }}</el-text>
      </el-form-item>
      <el-form-item label="歌手名称：">
        <el-text class="mx-1">{{ form.artistName }}</el-text>
      </el-form-item>
      <el-form-item label="描述：">
        <el-text class="mx-1">{{ form.description }}</el-text>
      </el-form-item>
      <el-form-item label="海报图片：">
        <img :src="getServerUrl() + 'image/musicPicture/' + form.posterPic" width="150" height="150"
             alt="海报图片"/>
      </el-form-item>
      <el-form-item label="缩略图：">
        <img :src="getServerUrl() + 'image/musicPicture/' + form.thumbnailPic" width="150" height="150"
             alt="缩略图"/>
      </el-form-item>
      <el-form-item label="创建用户：">
        <el-text class="mx-1">{{ form.sysUser.username }}</el-text>
      </el-form-item>
      <el-form-item label="发行时间：">
        <el-text class="mx-1">{{ formatDateTime(form.regdate) }}</el-text>
      </el-form-item>
      <el-form-item label="视频类型：">
        <el-text class="mx-1">{{ form.videoSourceTypeName }}</el-text>
      </el-form-item>
      <el-form-item label="区域：">
        <el-text class="mx-1">{{ form.mvArea.name }}</el-text>
      </el-form-item>
      <el-form-item label="总浏览量：">
        <el-text class="mx-1">{{ form.totalViews }}</el-text>
      </el-form-item>
      <el-form-item label="PC端浏览量：">
        <el-text class="mx-1">{{ form.totalPcViews }}</el-text>
      </el-form-item>
      <el-form-item label="手机端浏览量：">
        <el-text class="mx-1">{{ form.totalMobileViews }}</el-text>
      </el-form-item>
      <el-form-item label="评论数：">
        <el-text class="mx-1">{{ form.totalComments }}</el-text>
      </el-form-item>
      <el-form-item label="MV：">
        <el-text class="mx-1">{{ form.url }}</el-text>
      </el-form-item>
      <el-form-item label="高清MV：">
        <el-text class="mx-1">{{ form.hdUrl }}</el-text>
      </el-form-item>
      <el-form-item label="超高清MV：">
        <el-text class="mx-1">{{ form.uhdUrl }}</el-text>
      </el-form-item>
      <el-form-item label="MV大小（MB）：">
        <el-text class="mx-1">{{ form.videoSize }}</el-text>
      </el-form-item>
      <el-form-item label="高清MV大小（MB）：">
        <el-text class="mx-1">{{ form.hdVideoSize }}</el-text>
      </el-form-item>
      <el-form-item label="超高清MV大小（MB）：">
        <el-text class="mx-1">{{ form.uhdVideoSize }}</el-text>
      </el-form-item>
      <el-form-item label="MV时长：">
        <el-text class="mx-1">{{ form.duration }}</el-text>
      </el-form-item>
      <el-form-item label="状态：">
        <el-text class="mx-1">{{ stateFormat(form.status) }}</el-text>
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

const form = ref({
  id: -1,
  title: '',
  artistName: '',
  description: '',
  mvArea: {
    id: 1,
    name: '',
    code: ''
  },
  posterPic: '',
  thumbnailPic: '',
  regdate: Date,
  videoSourceTypeName: '',
  totalViews: 0,
  totalPcViews: 0,
  totalMobileViews: 0,
  totalComments: 0,
  url: '',
  hdUrl: '',
  uhdUrl: '',
  videoSize: 0,
  hdVideoSize: 0,
  uhdVideoSize: 0,
  duration: Date,
  status: 0,
  sysUser: {
    username: ""
  }
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("data/mv/" + id);
  form.value = res.data.mvItem;
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
