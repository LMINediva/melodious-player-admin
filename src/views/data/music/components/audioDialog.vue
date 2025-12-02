<template>
  <el-dialog
      v-bind="dialogVisible"
      :title="dialogTitle"
      width="30%"
      @close="handleClose">
    <el-form
        ref="formRef"
        :model="form"
        label-width="100px">
      <el-form-item label="音频">
        <audio ref="audioPlayer" v-if="audioUrl" :src="audioUrl" controls>
          您的浏览器不支持audio元素。
        </audio>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import {defineEmits, defineProps, onMounted, ref, watch} from 'vue';
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
  status: 0
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const formRef = ref(null);
const audioPlayer = ref(null);
const isPlaying = ref(false);
const audioUrl = ref("");

const initFormData = async (id) => {
  const res = await requestUtil.get("data/music/" + id);
  form.value = res.data.music;
  audioUrl.value = getServerUrl() + "audio/music/" + form.value.url;
};

watch(
    () => props.dialogVisible,
    () => {
      let id = props.id;
      console.log("id=" + id);
      initFormData(id);
    }
);

const handlePlay = () => {
  isPlaying.value = true;
};

onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.addEventListener('play', handlePlay);
  }
});

const handleClose = () => {
  if (isPlaying) {
    audioPlayer.value.pause();
  }
};
</script>

<style scoped>
.text-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
