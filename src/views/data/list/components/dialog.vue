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
      <el-form-item label="悦单名" prop="title">
        <el-input v-model="form.title"/>
      </el-form-item>
      <el-form-item label="缩略图" prop="thumbnailPic">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'data/list/uploadImage'"
            :show-file-list="false"
            :on-success="handleThumbnailPicSuccess"
            :before-upload="beforePictureUpload">
          <img v-if="thumbnailPicUrl" :src="thumbnailPicUrl" class="picture" alt="缩略图"/>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadThumbnailPicture">确认更换</el-button>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-mention v-model="form.description" type="textarea"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="0">正常</el-radio>
          <el-radio :value="1">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="创建时间" prop="createdTime">
        <el-date-picker
            v-model="form.createdTime"
            type="datetime"
            placeholder="请选择一个日期"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="MMM DD, YYYY"
            time-format="HH:mm"/>
      </el-form-item>
      <el-form-item label="积分" prop="integral">
        <el-input v-model="form.integral"/>
      </el-form-item>
      <el-form-item label="周积分" prop="weekIntegral">
        <el-input v-model="form.weekIntegral"/>
      </el-form-item>
      <el-form-item label="总积分" prop="totalUser">
        <el-input v-model="form.totalUser"/>
      </el-form-item>
      <el-form-item label="排名" prop="rank">
        <el-input v-model="form.rank"/>
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
import moment from 'moment-timezone';

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
  thumbnailPic: '',
  description: '',
  status: 0,
  createdTime: Date,
  integral: 0,
  weekIntegral: 0,
  totalUser: 0,
  rank: 0
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const posterPicUrl = ref("");
const thumbnailPicUrl = ref("");
const url = ref("");
const videoName = ref("");
const videoPlayer = ref(null);
const areas = ref([]);
const formRef = ref(null);

const handleThumbnailPicSuccess = (res) => {
  thumbnailPicUrl.value = getServerUrl() + res.data.src;
  form.value.thumbnailPic = res.data.title;
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

const checkTitle = async (rule, value, callback) => {
  if (form.value.id === -1) {
    const res = await requestUtil.post("data/list/checkTitle", {title: form.value.title});
    if (res.data.code === 500) {
      callback(new Error("MV名已存在！"));
    } else {
      callback();
    }
  } else {
    callback();
  }
};

const rules = ref({
  title: [
    {required: true, message: '请输入悦单名'},
    {required: true, validator: checkTitle, trigger: "blur"}
  ],
  description: [{required: true, message: "描述不能为空", trigger: "blur"}]
});

const initFormData = async (id) => {
  const res = await requestUtil.get("data/list/" + id);
  form.value = res.data.listItem;
  posterPicUrl.value = getServerUrl() + 'image/listPicture/' + form.value.posterPic;
  thumbnailPicUrl.value = getServerUrl() + 'image/listPicture/' + form.value.thumbnailPic;
  url.value = getServerUrl() + 'video/list/' + form.value.url;
  form.value.oldMvAreaId = form.value.listArea.id;
};

const initAreaData = async () => {
  const areasRes = await requestUtil.get("list_areas");
  areas.value = areasRes.data;
}

watch(
    () => props.dialogVisible,
    () => {
      initAreaData();
      let id = props.id;
      console.log("id=" + id);
      if (id !== -1) {
        initFormData(id);
      } else {
        form.value = {
          id: -1,
          type: '',
          title: '',
          thumbnailPic: '',
          description: '',
          status: 0,
          createdTime: Date,
          integral: 0,
          weekIntegral: 0,
          totalUser: 0,
          rank: 0
        };
        url.value = null;
        posterPicUrl.value = null;
        thumbnailPicUrl.value = null;
      }
    }
);

const emits = defineEmits(['update:modelValue', 'initList']);

const handleClose = () => {
  emits('update:modelValue', false);
};

const handleConfirmUploadThumbnailPicture = async () => {
  let result = await requestUtil.post("data/list/updateThumbnailPicture", form.value);
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
        form.value.hdUrl = videoName;
        form.value.uhdUrl = videoName;
        form.value.listArea.id = form.value.listArea.name;
      }
      form.value.listArea.id = form.value.listArea.name;
      let result = await requestUtil.post("data/list/save", form.value);
      let data = result.data;
      if (data.code === 200) {
        ElMessage.success("执行成功！");
        formRef.value.resetFields();
        emits("initList");
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
