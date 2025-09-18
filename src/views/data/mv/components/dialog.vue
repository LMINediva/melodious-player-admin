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
      <el-form-item label="MV名" prop="title">
        <el-input v-model="form.title"/>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-mention v-model="form.description" type="textarea"/>
      </el-form-item>
      <el-form-item label="区域" prop="mvArea.id">
        <el-select v-model="form.mvArea.name">
          <el-option
              v-for="area in areas"
              :key="area.name"
              :label="area.name"
              :value="area.id"/>
        </el-select>
      </el-form-item>
      <el-form-item label="歌手姓名" prop="artistName">
        <el-input v-model="form.artistName"/>
      </el-form-item>
      <el-form-item label="海报图片" prop="posterPic">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'data/mv/uploadImage'"
            :show-file-list="false"
            :on-success="handlePosterPicSuccess"
            :before-upload="beforePictureUpload">
          <img v-if="posterPicUrl" :src="posterPicUrl" class="picture" alt="海报图片"/>
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
            :action="getServerUrl() + 'data/mv/uploadImage'"
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
      <el-form-item label="发行时间" prop="regdate">
        <el-date-picker
            v-model="form.regdate"
            type="datetime"
            placeholder="请选择一个日期"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="MMM DD, YYYY"
            time-format="HH:mm"/>
      </el-form-item>
      <el-form-item label="MV" prop="url">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'data/mv/uploadVideo'"
            :show-file-list="false"
            :on-success="handleVideoSuccess"
            :before-upload="beforeVideoUpload">
          <video ref="videoPlayer" v-if="url" :src="url" @loadedmetadata="getVideoDuration"
                 width="320" height="240" controls>
            您的浏览器不支持video元素。
          </video>
          <el-icon v-else class="picture-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
        <el-button @click="handleConfirmUploadVideo">确认更换</el-button>
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
  artistName: '',
  description: '',
  mvArea: {
    id: -1,
    name: '',
    code: ''
  },
  posterPic: '',
  thumbnailPic: '',
  regdate: Date,
  videoSourceTypeName: '',
  url: '',
  hdUrl: '',
  uhdUrl: '',
  videoSize: 0,
  hdVideoSize: 0,
  uhdVideoSize: 0,
  duration: Date,
  status: 0,
  oldMvAreaId: -1,
  sysUser: {}
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
const currentUser = ref(store.getters.GET_USERINFO);

const handlePosterPicSuccess = (res) => {
  posterPicUrl.value = getServerUrl() + res.data.src;
  form.value.posterPic = res.data.title;
};

const handleThumbnailPicSuccess = (res) => {
  thumbnailPicUrl.value = getServerUrl() + res.data.src;
  form.value.thumbnailPic = res.data.title;
};

const handleVideoSuccess = (res) => {
  url.value = getServerUrl() + res.data.src;
  videoName.value = res.data.title;
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

const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/');
  const fileSize = Number((file.size / 1024 / 1024).toFixed(1));
  const isLt1024M = fileSize < 1024;
  if (!isVideo) {
    ElMessage.error('请上传视频文件');
  }
  if (!isLt1024M) {
    ElMessage.error('视频大小不能超过1GB！');
  }
  if (isVideo && isLt1024M) {
    form.value.videoSize = fileSize;
    form.value.hdVideoSize = fileSize;
    form.value.uhdVideoSize = fileSize;
    form.value.videoSourceTypeName = file.type;
  }
  return isVideo && isLt1024M;
}

const getVideoDuration = () => {
  if (videoPlayer.value) {
    const durationInSeconds = videoPlayer.value.duration;
    form.value.duration = moment.utc(durationInSeconds * 1000).format("HH:mm:ss");
  }
}

const checkTitle = async (rule, value, callback) => {
  if (form.value.id === -1) {
    const res = await requestUtil.post("data/mv/checkTitle", {title: form.value.title});
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
  type: [{required: true, message: "类型不能为空", trigger: "blur"}],
  title: [
    {required: true, message: '请输入MV名'},
    {required: true, validator: checkTitle, trigger: "blur"}
  ],
  artistName: [{required: true, message: "歌手姓名不能为空", trigger: "blur"}],
  description: [{required: true, message: "描述不能为空", trigger: "blur"}]
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("data/mv/" + id);
  form.value = res.data.mvItem;
  posterPicUrl.value = getServerUrl() + 'image/mvPicture/' + form.value.posterPic;
  thumbnailPicUrl.value = getServerUrl() + 'image/mvPicture/' + form.value.thumbnailPic;
  url.value = getServerUrl() + 'video/mv/' + form.value.url;
  form.value.oldMvAreaId = form.value.mvArea.id;
};

const initAreaData = async () => {
  const areasRes = await requestUtil.get("mv_areas");
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
          artistName: '',
          description: '',
          mvArea: {
            id: -1,
            name: '',
            code: ''
          },
          posterPic: '',
          thumbnailPic: '',
          regdate: Date,
          videoSourceTypeName: '',
          url: '',
          hdUrl: '',
          uhdUrl: '',
          videoSize: 0,
          hdVideoSize: 0,
          uhdVideoSize: 0,
          duration: Date,
          status: 0,
          oldMvAreaId: -1,
          sysUser: {}
        };
        url.value = null;
        posterPicUrl.value = null;
        thumbnailPicUrl.value = null;
        form.value.regdate = new Date();
      }
    }
);

const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value !== '';
}

const handleDeleteUploadFileCache = async () => {
  let result = await requestUtil.post("data/mv/deleteUploadFileCache", form.value);
  let data = result.data;
  if (data.code === 200) {
    form.value.posterPic = "";
    form.value.thumbnailPic = "";
    form.value.url = "";
    ElMessage.success("文件上传缓存删除成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const emits = defineEmits(['update:modelValue', 'initMVList']);

const handleClose = () => {
  emits('update:modelValue', false);
  if (form.value.id === -1) {
    if (isNotEmpty(form.value.posterPic) || isNotEmpty(form.value.thumbnailPic)
        || isNotEmpty(form.value.url)) {
      handleDeleteUploadFileCache();
    }
  }
};

const handleConfirmUploadPosterPicture = async () => {
  let result = await requestUtil.post("data/mv/updatePosterPicture", form.value);
  let data = result.data;
  if (data.code === 200) {
    ElMessage.success("执行成功！");
    store.commit("SET_USERINFO", form.value);
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirmUploadThumbnailPicture = async () => {
  let result = await requestUtil.post("data/mv/updateThumbnailPicture", form.value);
  let data = result.data;
  if (data.code === 200) {
    ElMessage.success("执行成功！");
    store.commit("SET_USERINFO", form.value);
  } else {
    ElMessage.error(data.msg);
  }
}

const handleConfirmUploadVideo = async () => {
  let result = await requestUtil.post("data/mv/updateVideo", form.value);
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
        form.value.sysUser = currentUser;
      }
      let result = await requestUtil.post("data/mv/save", form.value);
      let data = result.data;
      if (data.code === 200) {
        ElMessage.success("执行成功！");
        formRef.value.resetFields();
        emits("initMVList");
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
