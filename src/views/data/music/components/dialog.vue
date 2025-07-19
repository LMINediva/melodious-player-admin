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
      <el-form-item label="类型" prop="type">
        <el-input v-model="form.type"/>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title"/>
      </el-form-item>
      <el-form-item label="歌手姓名" prop="artistName">
        <el-input v-model="form.artistName"/>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description"/>
      </el-form-item>
      <el-form-item label="海报图片" prop="posterPic">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'data/music/uploadImage'"
            :show-file-list="false"
            :on-success="handlePosterPicSuccess"
            :before-upload="beforePictureUpload">
          <img v-if="posterPicUrl" :src="posterPicUrl" class="picture"/>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadPosterPicture">确认更换</el-button>
      </el-form-item>
      <el-form-item label="缩略图" prop="thumbnailPic">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'data/music/uploadImage'"
            :show-file-list="false"
            :on-success="handleThumbnailPicSuccess"
            :before-upload="beforePictureUpload">
          <img v-if="thumbnailPicUrl" :src="thumbnailPicUrl" class="picture"/>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadThumbnailPicture">确认更换</el-button>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="'0'">正常</el-radio>
          <el-radio :value="'1'">禁用</el-radio>
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
  thumbnailPic: ''
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const posterPicUrl = ref("");
posterPicUrl.value = getServerUrl() + 'image/musicPicture/' + form.value.posterPic;

const thumbnailPicUrl = ref("");
thumbnailPicUrl.value = getServerUrl() + 'image/musicPicture/' + form.value.thumbnailPic;

const handlePosterPicSuccess = (res) => {
  posterPicUrl.value = getServerUrl() + res.data.src;
  form.value.posterPic = res.data.title;
};

const handleThumbnailPicSuccess = (res) => {
  thumbnailPicUrl.value = getServerUrl() + res.data.src;
  form.value.posterPic = res.data.title;
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

const checkUsername = async (rule, value, callback) => {
  if (form.value.id === -1) {
    const res = await requestUtil.post("sys/user/checkUserName", {username: form.value.username});
    if (res.data.code === 500) {
      callback(new Error("用户名已存在！"));
    } else {
      callback();
    }
  } else {
    callback();
  }
};

const rules = ref({
  username: [
    {required: true, message: '请输入用户名'},
    {required: true, validator: checkUsername, trigger: "blur"}
  ],
  email: [{required: true, message: "邮箱地址不能为空", trigger: "blur"}, {
    type: "email",
    message: "请输入正确的邮箱地址",
    trigger: ["blur", "change"]
  }],
  phonenumber: [{
    required: true,
    message: "手机号码不能为空",
    trigger: "blur"
  }, {pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur"}],
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("data/music/" + id);
  form.value = res.data.homeItem;
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
          username: "",
          password: "123456",
          status: "0",
          phonenumber: "",
          email: "",
          remark: ""
        };
      }
    }
);

const emits = defineEmits(['update:modelValue', 'initUserList']);

const handleClose = () => {
  emits('update:modelValue', false)
};

const handleConfirmUploadPosterPicture = async () => {
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

const handleConfirm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (form.value.id === -1) {
        form.value.id = null;
      }
      let result = await requestUtil.post("sys/user/save", form.value);
      let data = result.data;
      if (data.code === 200) {
        ElMessage.success("执行成功！");
        formRef.value.resetFields();
        emits("initUserList");
        handleClose();
      } else {
        ElMessage.error(data.msg);
      }
    } else {
      console.log("fail");
    }
  })
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
