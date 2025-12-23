<template>
  <el-dialog
      v-bind="dialogVisible"
      :title="dialogTitle"
      width="30%"
      :before-close="handleClose">
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
      <el-form-item label="音乐名" prop="title">
        <el-input v-model.trim="form.title"/>
      </el-form-item>
      <el-form-item label="歌手姓名" prop="artistName">
        <el-input v-model.trim="form.artistName"/>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-mention v-model.trim="form.description" type="textarea"/>
      </el-form-item>
      <el-form-item label="海报图片" prop="posterPic">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'data/music/uploadImage'"
            :show-file-list="false"
            :on-progress="handlePosterPicProgress"
            :on-success="handlePosterPicSuccess"
            :on-error="handlePosterPicError"
            :before-upload="beforePictureUpload">
          <img v-if="posterPicUrl" :src="posterPicUrl" class="picture" alt="海报图片"/>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadPosterPicture">确认更换</el-button>
      </el-form-item>
      <div v-if="uploadPosterPicProgress > 0" class="progress-container">
        <el-progress :percentage="uploadPosterPicProgress" :status="uploadPosterPicStatus"/>
      </div>
      <el-form-item label="缩略图" prop="thumbnailPic">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'data/music/uploadImage'"
            :show-file-list="false"
            :on-progress="handleThumbnailPicProgress"
            :on-success="handleThumbnailPicSuccess"
            :on-error="handleThumbnailPicError"
            :before-upload="beforePictureUpload">
          <img v-if="thumbnailPicUrl" :src="thumbnailPicUrl" class="picture" alt="缩略图"/>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadThumbnailPicture">确认更换</el-button>
      </el-form-item>
      <div v-if="uploadThumbnailPicProgress > 0" class="progress-container">
        <el-progress :percentage="uploadThumbnailPicProgress" :status="uploadPosterPicStatus"/>
      </div>
      <el-form-item label="歌词" prop="lyric">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'data/music/uploadLyric'"
            :show-file-list="false"
            :on-progress="handleLyricProgress"
            :on-success="handleLyricSuccess"
            :on-error="handleLyricError"
            :before-upload="beforeLyricUpload">
          <el-text v-if="form.lyric" class="mx-1">
            {{ form.lyric }}
          </el-text>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadLyric">确认更换</el-button>
      </el-form-item>
      <div v-if="uploadLyricProgress > 0" class="progress-container">
        <el-progress :percentage="uploadLyricProgress" :status="uploadLyricStatus"/>
      </div>
      <el-form-item label="音乐" prop="url">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'data/music/uploadAudio'"
            :show-file-list="false"
            :on-progress="handleAudioProgress"
            :on-success="handleAudioSuccess"
            :on-error="handleAudioError"
            :before-upload="beforeAudioUpload">
          <div v-if="form.url">
            <audio ref="audioPlayer" controls class="picture">
              <source :src="audioUrl" type="audio/mpeg">
              您的浏览器不支持audio元素。
            </audio>
            <el-text class="mx-1" type="primary">{{ form.url }}</el-text>
          </div>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadAudio">确认更换</el-button>
      </el-form-item>
      <div v-if="uploadAudioProgress > 0" class="progress-container">
        <el-progress :percentage="uploadAudioProgress" :status="uploadAudioStatus"/>
      </div>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="0">正常</el-radio>
          <el-radio :value="1">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleConfirm">确认</el-button>
        <el-button @click="handleClose">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import {defineEmits, defineProps, ref, watch} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
import {ElMessage} from 'element-plus';
import {Plus} from "@element-plus/icons-vue";
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
  sysUser: {}
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const posterPicUrl = ref("");
const thumbnailPicUrl = ref("");
const audioUrl = ref("");
const audioName = ref("");
const lyricUrl = ref("");
const currentUser = ref(store.getters.GET_USERINFO);
const uploadPosterPicProgress = ref(0);
const uploadPosterPicStatus = ref("");
const uploadThumbnailPicProgress = ref(0);
const uploadThumbnailPicStatus = ref("");
const uploadLyricProgress = ref(0);
const uploadLyricStatus = ref("");
const uploadAudioProgress = ref(0);
const uploadAudioStatus = ref("");
const isUploadPosterPicSuccess = ref(false);
const isConfirmChangePosterPic = ref(false);
const isUploadThumbnailPicSuccess = ref(false);
const isConfirmChangeThumbnailPic = ref(false);
const isUploadLyricSuccess = ref(false);
const isConfirmChangeLyric = ref(false);
const isUploadAudioSuccess = ref(false);
const isConfirmChangeAudio = ref(false);

const handlePosterPicProgress = (event, file, fileList) => {
  uploadPosterPicProgress.value = event.percent;
  uploadPosterPicStatus.value = "";
};

const handlePosterPicSuccess = (res) => {
  uploadPosterPicStatus.value = "success";
  posterPicUrl.value = getServerUrl() + res.data.src;
  form.value.posterPic = res.data.title;
  isUploadPosterPicSuccess.value = true;
  setTimeout(() => {
    uploadPosterPicProgress.value = 0;
  }, 2000);
};

const handlePosterPicError = (error, file, fileList) => {
  uploadPosterPicStatus.value = "exception";
  ElMessage.error("音乐海报图片上传失败，请重试！");
};

const handleThumbnailPicProgress = (event, file, fileList) => {
  uploadThumbnailPicProgress.value = event.percent;
  uploadThumbnailPicStatus.value = "";
};

const handleThumbnailPicSuccess = (res) => {
  uploadThumbnailPicStatus.value = "success";
  thumbnailPicUrl.value = getServerUrl() + res.data.src;
  form.value.thumbnailPic = res.data.title;
  isUploadThumbnailPicSuccess.value = true;
  setTimeout(() => {
    uploadThumbnailPicProgress.value = 0;
  }, 2000);
};

const handleThumbnailPicError = (error, file, fileList) => {
  uploadThumbnailPicStatus.value = "exception";
  ElMessage.error("音乐缩略图图片上传失败，请重试！");
};

const handleLyricProgress = (event, file, fileList) => {
  uploadLyricProgress.value = event.percent;
  uploadLyricStatus.value = "";
};

const handleLyricSuccess = (res) => {
  uploadLyricStatus.value = "success";
  lyricUrl.value = getServerUrl() + res.data.src;
  form.value.lyric = res.data.title;
  isUploadLyricSuccess.value = true;
  setTimeout(() => {
    uploadLyricProgress.value = 0;
  }, 2000);
};

const handleLyricError = (error, file, fileList) => {
  uploadLyricStatus.value = "exception";
  ElMessage.error("歌词文件上传失败，请重试！");
};

const handleAudioProgress = (event, file, fileList) => {
  uploadAudioProgress.value = event.percent;
  uploadAudioStatus.value = "";
};

const handleAudioSuccess = (res) => {
  uploadAudioStatus.value = "success";
  audioUrl.value = getServerUrl() + res.data.src;
  audioName.value = res.data.title;
  form.value.url = res.data.title;
  isUploadAudioSuccess.value = true;
  setTimeout(() => {
    uploadAudioProgress.value = 0;
  }, 2000);
};

const handleAudioError = (error, file, fileList) => {
  uploadAudioStatus.value = "exception";
  ElMessage.error("歌词文件上传失败，请重试！");
};

const beforePictureUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isJPG) {
    ElMessage.error('图片只能是jpeg、jpg和png格式');
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2M!');
  }
  return isJPG && isLt2M;
}

const beforeLyricUpload = (file) => {
  const isLyric = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.lrc');
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLyric) {
    ElMessage.error('歌词文件只能是lrc格式');
  }
  if (!isLt2M) {
    ElMessage.error('歌词文件大小不能超过2M!');
  }
  return isLyric && isLt2M;
}

const beforeAudioUpload = (file) => {
  const isMP3 = file.type === 'audio/mpeg' || file.type === 'audio/wav';
  const fileSize = Number((file.size / 1024 / 1024).toFixed(1));
  const isLt50M = fileSize < 50;
  if (!isMP3) {
    ElMessage.error('音频只能是mp3和wav格式');
  }
  if (!isLt50M) {
    ElMessage.error('音频大小不能超过50M！');
  }
  if (isMP3 && isLt50M) {
    form.value.musicSize = fileSize;
    form.value.hdMusicSize = fileSize;
    form.value.uhdMusicSize = fileSize;
    form.value.type = file.type;
  }
  return isMP3 && isLt50M;
}

const checkTitle = async (rule, value, callback) => {
  if (form.value.id === -1) {
    const res = await requestUtil.post("data/music/checkTitle", {title: form.value.title});
    if (res.data.code === 500) {
      callback(new Error("音乐名已存在！"));
    } else {
      callback();
    }
  } else {
    callback();
  }
};

const rules = ref({
  title: [
    {required: true, message: '请输入音乐名'},
    {min: 1, max: 80, message: '音乐名长度在1到80个字符之间', trigger: 'blur'},
    {required: true, validator: checkTitle, trigger: "blur"}
  ],
  artistName: [
    {required: true, message: "歌手姓名不能为空", trigger: "blur"},
    {min: 1, max: 80, message: '歌手姓名长度在1到80个字符之间', trigger: 'blur'}
  ],
  description: [
    {required: true, message: "描述不能为空", trigger: "blur"},
    {min: 1, max: 220, message: '描述长度在1到220个字符之间', trigger: 'blur'}
  ]
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("data/music/" + id);
  form.value = res.data.music;
  posterPicUrl.value = getServerUrl() + 'image/musicPicture/' + form.value.posterPic;
  thumbnailPicUrl.value = getServerUrl() + 'image/musicPicture/' + form.value.thumbnailPic;
  if (form.value.lyric !== null) {
    lyricUrl.value = getServerUrl() + 'audio/lyric/' + form.value.lyric;
  } else {
    lyricUrl.value = null;
  }
  audioUrl.value = getServerUrl() + 'audio/music/' + form.value.url;
};

watch(
    () => props.dialogVisible,
    () => {
      let id = props.id;
      if (id !== -1) {
        initFormData(id);
      } else {
        form.value = {
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
          sysUser: {}
        };
        audioUrl.value = null;
        posterPicUrl.value = null;
        thumbnailPicUrl.value = null;
        lyricUrl.value = null;
      }
    }
);

const handleDeleteUploadFileCache = async () => {
  let result = await requestUtil.post("data/music/deleteUploadFileCache", form.value);
  let data = result.data;
  if (data.code === 200) {
    form.value.posterPic = "";
    form.value.thumbnailPic = "";
    form.value.url = "";
    form.value.lyric = "";
    isUploadPosterPicSuccess.value = false;
    isConfirmChangePosterPic.value = false;
    isUploadThumbnailPicSuccess.value = false;
    isConfirmChangeThumbnailPic.value = false;
    isUploadLyricSuccess.value = false;
    isConfirmChangeLyric.value = false;
    isUploadAudioSuccess.value = false;
    isConfirmChangeAudio.value = false;
    ElMessage.success("文件上传缓存删除成功！");
  } else {
    ElMessage.error(data.msg);
  }
};

const emits = defineEmits(['update:modelValue', 'initMusicList']);

const handleClose = () => {
  emits('update:modelValue', false);
  if ((isUploadPosterPicSuccess.value && !isConfirmChangePosterPic.value) ||
      (isUploadThumbnailPicSuccess.value && !isConfirmChangeThumbnailPic.value) ||
      (isUploadLyricSuccess.value && !isConfirmChangeLyric.value) ||
      (isUploadAudioSuccess.value && !isConfirmChangeAudio.value)) {
    handleDeleteUploadFileCache();
  }
  uploadPosterPicProgress.value = 0;
  uploadPosterPicStatus.value = "";
  uploadThumbnailPicProgress.value = 0;
  uploadThumbnailPicStatus.value = "";
  uploadLyricProgress.value = 0;
  uploadLyricStatus.value = "";
  uploadAudioProgress.value = 0;
  uploadAudioStatus.value = "";
};

const handleConfirmUploadPosterPicture = async () => {
  let result = await requestUtil.post("data/music/updatePosterPicture", form.value);
  let data = result.data;
  if (data.code === 200) {
    isConfirmChangePosterPic.value = true;
    emits("initMusicList");
    ElMessage.success("执行成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirmUploadThumbnailPicture = async () => {
  let result = await requestUtil.post("data/music/updateThumbnailPicture", form.value);
  let data = result.data;
  if (data.code === 200) {
    isConfirmChangeThumbnailPic.value = true;
    emits("initMusicList");
    ElMessage.success("执行成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirmUploadLyric = async () => {
  let result = await requestUtil.post("data/music/updateLyric", form.value);
  let data = result.data;
  if (data.code === 200) {
    isConfirmChangeLyric.value = true;
    emits("initMusicList");
    ElMessage.success("执行成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirmUploadAudio = async () => {
  uploadAudioProgress.value = 0;
  uploadAudioStatus.value = "";
  let result = await requestUtil.post("data/music/updateAudio", form.value);
  let data = result.data;
  if (data.code === 200) {
    isConfirmChangeAudio.value = true;
    emits("initMusicList");
    ElMessage.success("执行成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (form.value.id === -1) {
        form.value.id = null;
        form.value.hdUrl = audioName;
        form.value.uhdUrl = audioName;
        form.value.sysUser = currentUser;
      }
      let result = await requestUtil.post("data/music/save", form.value);
      let data = result.data;
      if (data.code === 200) {
        isConfirmChangePosterPic.value = true;
        isConfirmChangeThumbnailPic.value = true;
        isConfirmChangeLyric.value = true;
        isConfirmChangeAudio.value = true;
        ElMessage.success("执行成功！");
        formRef.value.resetFields();
        emits("initMusicList");
        handleClose();
      } else {
        ElMessage.error(data.msg);
      }
    } else {
      console.log("fail");
    }
  });
};
</script>

<style scoped>
.picture-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.picture-uploader .el-upload:hover {
  border-color: #409eff;
}

.el-icon.picture-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.picture {
  width: 120px;
  height: 120px;
  display: block;
}

.progress-container {
  padding-left: 20px;
  padding-right: 20px;
}
</style>
