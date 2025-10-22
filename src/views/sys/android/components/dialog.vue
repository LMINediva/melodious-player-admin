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
          <el-text class="mx-1" type="primary" v-if="url">{{ apkName }}</el-text>
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
            value-format="YYYY-MM-DD HH:mm:ss"/>
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
const apkName = ref("");

const handleIconPicSuccess = (res) => {
  iconPicUrl.value = getServerUrl() + res.data.src;
  form.value.icon = res.data.title;
};

const handleAPKSuccess = (res) => {
  url.value = getServerUrl() + res.data.src;
  apkName.value = res.data.title;
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
  const fileExtension = file.name.split('.').pop();
  const isAPK = fileExtension.toLowerCase() === 'apk';
  const fileSize = Number((file.size / 1024 / 1024).toFixed(1));
  const isLt50M = fileSize < 50;
  if (!isAPK) {
    ElMessage.error('安卓应用只能是apk格式');
  }
  if (!isLt50M) {
    ElMessage.error('安卓应用大小不能超过50M！');
  }
  if (isAPK && isLt50M) {
    form.value.size = fileSize;
  }
  return isAPK && isLt50M;
}

const rules = ref({
  name: [
    {required: true, message: '请输入应用名', trigger: "blur"}
  ],
  version: [{required: true, message: "版本号不能为空", trigger: "blur"}]
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("sys/android/" + id);
  form.value = res.data.androidApplication;
  iconPicUrl.value = getServerUrl() + 'image/androidApplicationPicture/' + form.value.icon;
  url.value = getServerUrl() + 'application/android/' + form.value.url;
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
        form.value.uploadTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      }
    }
);

const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value !== '';
}

const handleDeleteUploadFileCache = async () => {
  let result = await requestUtil.post("sys/android/deleteUploadFileCache", form.value);
  let data = result.data;
  if (data.code === 200) {
    form.value.icon = "";
    form.value.url = "";
    ElMessage.success("文件上传缓存删除成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const emits = defineEmits(['update:modelValue', 'initAndroidApplicationList']);

const handleClose = () => {
  emits('update:modelValue', false);
  if (form.value.id === -1) {
    if (isNotEmpty(form.value.icon) || isNotEmpty(form.value.url)) {
      handleDeleteUploadFileCache();
    }
  }
};

const handleConfirmUploadIconPicture = async () => {
  let result = await requestUtil.post("sys/android/updateIconPicture", form.value);
  let data = result.data;
  if (data.code === 200) {
    ElMessage.success("执行成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirmUploadAPK = async () => {
  let result = await requestUtil.post("sys/android/updateAndroidApplication", form.value);
  let data = result.data;
  if (data.code === 200) {
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
      }
      let result = await requestUtil.post("sys/android/save", form.value);
      let data = result.data;
      if (data.code === 200) {
        ElMessage.success("执行成功！");
        formRef.value.resetFields();
        emits("initAndroidApplicationList");
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
