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
      <el-form-item label="反馈内容" prop="content">
        <el-mention v-model="form.content" type="textarea"/>
      </el-form-item>
      <el-form-item label="反馈图片" prop="picture">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'sys/feedback/uploadImage'"
            :show-file-list="false"
            :on-success="handlePicSuccess"
            :before-upload="beforePictureUpload">
          <img v-if="picUrl" :src="picUrl" class="picture" alt="反馈图片"/>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadPicture">确认更换</el-button>
      </el-form-item>
      <el-form-item label="提交时间" prop="submissionTime">
        <el-date-picker
            v-model="form.submissionTime"
            type="datetime"
            placeholder="请选择一个日期"
            value-format="YYYY-MM-DD HH:mm:ss"/>
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
  content: '',
  picture: '',
  submissionTime: Date,
  sysUser: {}
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const picUrl = ref("");
const currentUser = ref(store.getters.GET_USERINFO);

const handlePicSuccess = (res) => {
  picUrl.value = getServerUrl() + res.data.src;
  form.value.picture = res.data.title;
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

const rules = ref({
  content: [
    {required: true, message: '请输入反馈的内容', trigger: "blur"},
    {min: 1, max: 200, message: '内容长度在1到200个字符之间', trigger: 'blur'}
  ]
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("sys/feedback/" + id);
  form.value = res.data.feedback;
  picUrl.value = getServerUrl() + 'image/feedbackPicture/' + form.value.picture;
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
          content: '',
          picture: '',
          submissionTime: Date,
          sysUser: {}
        };
        picUrl.value = null;
        form.value.submissionTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      }
    }
);

const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value !== '';
}

const handleDeleteUploadFileCache = async () => {
  let result = await requestUtil.post("sys/feedback/deleteUploadFileCache", form.value);
  let data = result.data;
  if (data.code === 200) {
    form.value.picture = "";
    ElMessage.success("文件上传缓存删除成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const emits = defineEmits(['update:modelValue', 'initFeedbackList']);

const handleClose = () => {
  emits('update:modelValue', false);
  if (form.value.id === -1) {
    if (isNotEmpty(form.value.picture)) {
      handleDeleteUploadFileCache();
    }
  }
};

const handleConfirmUploadPicture = async () => {
  let result = await requestUtil.post("sys/feedback/updatePicture", form.value);
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
        form.value.sysUser = currentUser;
      }
      form.value.content = form.value.content.toString().trim();
      let result = await requestUtil.post("sys/feedback/save", form.value);
      let data = result.data;
      if (data.code === 200) {
        ElMessage.success("执行成功！");
        formRef.value.resetFields();
        emits("initFeedbackList");
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
