<template>
  <el-form
      ref="formRef"
      :model="form"
      label-width="100px"
      style="text-align: center;padding-bottom:10px">
    <el-upload
        :headers="headers"
        class="avatar-uploader"
        :action="getServerUrl()+'sys/user/uploadImage'"
        :show-file-list="false"
        :on-progress="handleAvatarProgress"
        :on-success="handleAvatarSuccess"
        :on-error="handleAvatarError"
        :before-upload="beforeAvatarUpload">
      <img v-if="imageUrl" :src="imageUrl" class="avatar"/>
      <el-icon v-else class="avatar-uploader-icon">
        <Plus/>
      </el-icon>
    </el-upload>
    <el-button @click="handleConfirm">确认更换</el-button>
    <div v-if="uploadAvatarProgress > 0">
      <el-progress :percentage="uploadAvatarProgress" :status="uploadAvatarStatus"/>
    </div>
  </el-form>
</template>

<script setup>
import {defineProps, ref} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
import {ElMessage} from 'element-plus';
import {Plus} from '@element-plus/icons-vue';
import store from '@/store';

const props = defineProps(
    {
      user: {
        type: Object,
        default: () => {
        },
        required: true
      }
    }
);

const headers = ref({
  token: store.getters.GET_TOKEN
});

const form = ref({
  id: -1,
  avatar: ''
});

const formRef = ref(null);
const imageUrl = ref("");
const uploadAvatarProgress = ref(0);
const uploadAvatarStatus = ref("");
const isConfirmChangeAvatar = ref(false);

form.value = props.user;
imageUrl.value = getServerUrl() + 'image/userAvatar/' + form.value.avatar;

const handleAvatarProgress = (event, file, fileList) => {
  uploadAvatarProgress.value = event.percent;
  uploadAvatarStatus.value = "";
};

const handleAvatarSuccess = (res) => {
  uploadAvatarStatus.value = "success";
  imageUrl.value = getServerUrl() + res.data.src;
  form.value.avatar = res.data.title;
  setTimeout(() => {
    uploadAvatarProgress.value = 0;
  }, 2000);
};

const handleAvatarError = (error, file, fileList) => {
  uploadAvatarStatus.value = "exception";
  ElMessage.error("头像图片上传失败，请重试！");
};

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isJPG) {
    ElMessage.error('图片只能是jpeg、jpg和png格式');
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2M!');
  }
  return isJPG && isLt2M;
};

const handleConfirm = async () => {
  let result = await requestUtil.post("sys/user/updateAvatar", form.value);
  let data = result.data;
  if (data.code === 200) {
    ElMessage.success("执行成功！");
    store.commit("SET_USERINFO", form.value);
  } else {
    ElMessage.error(data.msg);
  }
};

const handleDeleteUploadFileCache = async () => {
  let result = await requestUtil.post("sys/user/deleteUploadFileCache", form.value);
  let data = result.data;
  if (data.code === 200) {
    form.value.avatar = "";
    ElMessage.success("文件上传缓存删除成功！");
  } else {
    ElMessage.error(data.msg);
  }
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
}
</style>
