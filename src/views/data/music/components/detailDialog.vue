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
      <el-form-item label="音乐类型：">
        <el-text class="mx-1">{{ form.type }}</el-text>
      </el-form-item>
      <el-form-item label="音乐名：">
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
      <el-form-item label="歌词：">
        <el-text class="mx-1">{{ form.lyric }}</el-text>
      </el-form-item>
      <el-form-item label="音乐：">
        <el-text class="mx-1">{{ form.url }}</el-text>
      </el-form-item>
      <el-form-item label="高品质音乐：">
        <el-text class="mx-1">{{ form.hdUrl }}</el-text>
      </el-form-item>
      <el-form-item label="超高品质音乐：">
        <el-text class="mx-1">{{ form.uhdUrl }}</el-text>
      </el-form-item>
      <el-form-item label="音乐大小（MB）：">
        <el-text class="mx-1">{{ form.musicSize }}</el-text>
      </el-form-item>
      <el-form-item label="高品质音乐大小（MB）：">
        <el-text class="mx-1">{{ form.hdMusicSize }}</el-text>
      </el-form-item>
      <el-form-item label="超高品质音乐大小（MB）：">
        <el-text class="mx-1">{{ form.uhdMusicSize }}</el-text>
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
  type: '',
  title: '',
  artistName: '',
  description: '',
  posterPic: '',
  thumbnailPic: '',
  lyric: '',
  url: '',
  hdUrl: '',
  uhdUrl: '',
  musicSize: 0,
  hdMusicSize: 0,
  uhdMusicSize: 0,
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
  const res = await requestUtil.get("data/music/" + id);
  form.value = res.data.music;
};

watch(
    () => props.dialogVisible,
    () => {
      let id = props.id;
      initFormData(id);
    }
);

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

</style>
