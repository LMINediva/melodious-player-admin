<template>
  <el-dialog
      v-bind="dialogVisible"
      :title="dialogTitle"
      width="30%"
      @close="handleClose">
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
      <el-form-item label="应用名" prop="name">
        <el-input v-model.trim="form.name"/>
      </el-form-item>
      <el-form-item label="应用图标" prop="icon">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'sys/android/uploadImage'"
            :show-file-list="false"
            :on-success="handleIconPicSuccess"
            :before-upload="beforePictureUpload">
          <img v-if="iconPicUrl" :src="iconPicUrl" class="picture" alt="海报图片"/>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadIconPicture">确认更换</el-button>
      </el-form-item>
      <el-form-item label="版本号" prop="version">
        <el-input v-model.trim="form.version"/>
      </el-form-item>
      <el-form-item label="APK" prop="url">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'sys/android/uploadAPK'"
            :show-file-list="false"
            :on-success="handleAPKSuccess"
            :before-upload="beforeAPKUpload">
          <el-text class="mx-1" type="primary" v-if="url" v-model="url"></el-text>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadAPK">确认更换</el-button>
      </el-form-item>
      <el-form-item label="上传时间" prop="uploadTime">
        <el-date-picker
            v-model="form.uploadTime"
            type="datetime"
            placeholder="请选择一个日期"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="MMM DD, YYYY"
            time-format="HH:mm"/>
      </el-form-item>
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
  name: '',
  icon: '',
  version: '',
  url: '',
  size: 0,
  uploadTime: Date,
  status: 0
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const iconPicUrl = ref("");
const url = ref("");

const handleIconPicSuccess = (res) => {
  iconPicUrl.value = getServerUrl() + res.data.src;
  form.value.posterPic = res.data.title;
};

const handleAPKSuccess = (res) => {
  url.value = getServerUrl() + res.data.src;
  form.value.url = res.data.title;
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

const beforeAPKUpload = (file) => {
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
    {required: true, validator: checkTitle, trigger: "blur"}
  ],
  artistName: [{required: true, message: "歌手姓名不能为空", trigger: "blur"}],
  description: [{required: true, message: "描述不能为空", trigger: "blur"}]
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("data/music/" + id);
  form.value = res.data.music;
  iconPicUrl.value = getServerUrl() + 'image/musicPicture/' + form.value.posterPic;
  url.value = getServerUrl() + 'audio/music/' + form.value.url;
};

watch(
    () => props.dialogVisible,
    () => {
      let id = props.id;
      console.log("id=" + id);
      if (id !== -1) {
        initFormData(id);
      } else {
        form.value = {
          id: -1,
          name: '',
          icon: '',
          version: '',
          url: '',
          size: 0,
          uploadTime: Date,
          status: 0
        };
        url.value = null;
        iconPicUrl.value = null;
      }
    }
);

const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value !== '';
}

const handleDeleteUploadFileCache = async () => {
  let result = await requestUtil.post("data/music/deleteUploadFileCache", form.value);
  let data = result.data;
  if (data.code === 200) {
    form.value.posterPic = "";
    form.value.thumbnailPic = "";
    form.value.url = "";
    form.value.lyric = "";
    ElMessage.success("文件上传缓存删除成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const emits = defineEmits(['update:modelValue', 'initMusicList']);

const handleClose = () => {
  emits('update:modelValue', false);
  if (form.value.id === -1) {
    if (isNotEmpty(form.value.posterPic) || isNotEmpty(form.value.thumbnailPic)
        || isNotEmpty(form.value.url) || isNotEmpty(form.value.lyric)) {
      handleDeleteUploadFileCache();
    }
  }
};

const handleConfirmUploadIconPicture = async () => {
  let result = await requestUtil.post("data/music/updatePosterPicture", form.value);
  let data = result.data;
  if (data.code === 200) {
    ElMessage.success("执行成功！");
    store.commit("SET_USERINFO", form.value);
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirmUploadThumbnailPicture = async () => {
  let result = await requestUtil.post("data/music/updateThumbnailPicture", form.value);
  let data = result.data;
  if (data.code === 200) {
    ElMessage.success("执行成功！");
    store.commit("SET_USERINFO", form.value);
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirmUploadLyric = async () => {
  let result = await requestUtil.post("data/music/updateLyric", form.value);
  let data = result.data;
  if (data.code === 200) {
    ElMessage.success("执行成功！");
    store.commit("SET_USERINFO", form.value);
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirmUploadAPK = async () => {
  let result = await requestUtil.post("data/music/updateAudio", form.value);
  let data = result.data;
  if (data.code === 200) {
    ElMessage.success("执行成功！");
    store.commit("SET_USERINFO", form.value);
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (form.value.id === -1) {
        form.value.id = null;
      }
      let result = await requestUtil.post("data/music/save", form.value);
      let data = result.data;
      if (data.code === 200) {
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
</style>
