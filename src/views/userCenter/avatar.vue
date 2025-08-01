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
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload">
      <img v-if="imageUrl" :src="imageUrl" class="avatar"/>
      <el-icon v-else class="avatar-uploader-icon">
        <Plus/>
      </el-icon>
    </el-upload>
    <el-button @click="handleConfirm">确认更换</el-button>
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

form.value = props.user;
imageUrl.value = getServerUrl() + 'image/userAvatar/' + form.value.avatar;

const handleAvatarSuccess = (res) => {
  imageUrl.value = getServerUrl() + res.data.src;
  form.value.avatar = res.data.title;
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
}

const handleConfirm = async () => {
  let result = await requestUtil.post("sys/user/updateAvatar", form.value);
  let data = result.data;
  if (data.code === 200) {
    ElMessage.success("执行成功！");
    store.commit("SET_USERINFO", form.value);
  } else {
    ElMessage.error(data.msg);
  }
}
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
