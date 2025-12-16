<template>
  <el-dialog
      v-bind="dialogVisible"
      :title="dialogTitle"
      width="50%"
      @close="handleClose">
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
      <el-form-item label="悦单名" prop="title">
        <el-input v-model.trim="form.title"/>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-mention v-model.trim="form.description" type="textarea"/>
      </el-form-item>
      <el-form-item label="类型" prop="category">
        <el-input v-model.trim="form.category" placeholder="如：华语流行音乐、说唱等"/>
      </el-form-item>
      <el-form-item label="缩略图" prop="thumbnailPic">
        <el-upload
            :headers="headers"
            class="picture-uploader"
            :action="getServerUrl() + 'data/list/uploadImage'"
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
      <el-form-item label="MV" prop="mvList">
        <el-button v-if="form.id !== -1" type="success" :icon="DocumentAdd"
                   @click="handleDialogValue(null)">新增
        </el-button>
        <el-table v-if="form.id !== -1"
                  :data="form.mvList.slice((queryForm.pageNum - 1) * queryForm.pageSize,
            (queryForm.pageNum - 1) * queryForm.pageSize + queryForm.pageSize)"
                  stripe style="width: 100%">
          <el-table-column prop="title" label="MV名" width="100" align="center"/>
          <el-table-column prop="artistName" label="歌手名称" width="100" align="center"/>
          <el-table-column prop="videoSourceTypeName" label="视频类型" width="100" align="center"/>
          <el-table-column label="海报图片" prop="posterPic">
            <template v-slot="scope">
              <img :src="getServerUrl() + 'image/mvPicture/' + scope.row.posterPic" width="50" height="50"
                   alt="海报图片"/>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="操作" width="200" align="center">
            <template v-slot="scope">
              <el-popconfirm title="您确定要删除这条悦单吗？" @confirm="handleDelete(scope.row.id)">
                <template #reference>
                  <el-button type="danger" :icon="Delete"/>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-table v-else ref="multipleTableRef" :data="tableData" row-key="id" stripe style="width: 100%"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"/>
          <el-table-column prop="title" label="MV名" width="100" align="center"/>
          <el-table-column prop="artistName" label="歌手名称" width="100" align="center"/>
          <el-table-column prop="videoSourceTypeName" label="视频类型" width="100" align="center"/>
          <el-table-column label="海报图片" prop="posterPic">
            <template v-slot="scope">
              <img :src="getServerUrl() + 'image/mvPicture/' + scope.row.posterPic" width="50" height="50"
                   alt="海报图片"/>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            v-model:current-page="queryForm.pageNum"
            v-model:page-size="queryForm.pageSize"
            :page-sizes="[10, 20, 30, 40]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
            v-model="form.createTime"
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
    <AddMVDialog v-model="dialogVisible" :dialogVisible="dialogVisible" :dialogTitle="dialogTitle"
                 :mvs="mvs" @updateSelection="handleSelection" @closeDialog="handleCloseDialog"/>
  </el-dialog>
</template>

<script setup>
import {defineEmits, defineProps, nextTick, ref, watch} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
import {ElMessage} from 'element-plus';
import {Delete, DocumentAdd, Plus} from "@element-plus/icons-vue";
import store from "@/store";
import AddMVDialog from "./dialog/addMVDialog.vue";
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
  title: '',
  thumbnailPic: '',
  videoCount: 0,
  mvList: [],
  description: '',
  category: '',
  status: 0,
  totalViews: 0,
  totalFavorites: 0,
  updateTime: Date,
  createTime: Date,
  integral: 0,
  weekIntegral: 0,
  totalUser: 0,
  rank: 0,
  sysUser: {}
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const tableData = ref([]);
const total = ref(0);
const queryForm = ref({
  query: '',
  pageNum: 1,
  pageSize: 10
});

const thumbnailPicUrl = ref("");
const formRef = ref(null);
const id = ref(-1);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const mvs = ref([]);
const multipleSelection = ref([]);
const multipleTableRef = ref(null);
const currentUser = ref(store.getters.GET_USERINFO);
const uploadThumbnailPicProgress = ref(0);
const uploadThumbnailPicStatus = ref("");

const handleThumbnailPicProgress = (event, file, fileList) => {
  uploadThumbnailPicProgress.value = event.percent;
  uploadThumbnailPicStatus.value = "";
};

const handleThumbnailPicSuccess = (res) => {
  uploadThumbnailPicStatus.value = "success";
  thumbnailPicUrl.value = getServerUrl() + res.data.src;
  form.value.thumbnailPic = res.data.title;
  setTimeout(() => {
    uploadThumbnailPicProgress.value = 0;
  }, 2000);
};

const handleThumbnailPicError = (error, file, fileList) => {
  uploadThumbnailPicStatus.value = "exception";
  ElMessage.error("音乐缩略图图片上传失败，请重试！");
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
    {min: 1, max: 80, message: '悦单名长度在1到80个字符之间', trigger: 'blur'},
    {required: true, validator: checkTitle, trigger: "blur"}
  ],
  description: [
    {required: true, message: "描述不能为空", trigger: "blur"},
    {min: 1, max: 220, message: '描述长度在1到220个字符之间', trigger: 'blur'}
  ],
  category: [
    {required: true, message: '请输入类型', trigger: "blur"},
    {min: 2, max: 10, message: '类型长度在2到10个字符之间', trigger: 'blur'}
  ]
});

const initFormData = async (id) => {
  const res = await requestUtil.get("data/list/" + id);
  form.value = res.data.playItem;
  thumbnailPicUrl.value = getServerUrl() + 'image/listPicture/' + form.value.thumbnailPic;
  total.value = res.data.playItem.mvList.length;
  mvs.value = res.data.playItem.mvList;
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
          title: '',
          thumbnailPic: '',
          videoCount: 0,
          mvList: [],
          description: '',
          category: '',
          status: 0,
          totalViews: 0,
          totalFavorites: 0,
          updateTime: Date,
          createTime: Date,
          integral: 0,
          weekIntegral: 0,
          totalUser: 0,
          rank: 0,
          sysUser: {}
        };
        thumbnailPicUrl.value = null;
        form.value.createTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        initMVList();
      }
    }
);

const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value !== '';
}

const handleDeleteUploadFileCache = async () => {
  let result = await requestUtil.post("data/list/deleteUploadFileCache", form.value);
  let data = result.data;
  if (data.code === 200) {
    form.value.thumbnailPic = "";
    ElMessage.success("文件上传缓存删除成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const emits = defineEmits(['update:modelValue', 'initList']);

const handleClose = () => {
  multipleSelection.value = [];
  emits('update:modelValue', false);
  if (form.value.id === -1) {
    if (isNotEmpty(form.value.thumbnailPic)) {
      handleDeleteUploadFileCache();
    }
  }
};

const handleConfirmUploadThumbnailPicture = async () => {
  let result = await requestUtil.post("data/list/updateThumbnailPicture", form.value);
  let data = result.data;
  if (data.code === 200) {
    ElMessage.success("执行成功！");
  } else {
    ElMessage.error(data.msg);
  }
}

const handleSelectionChange = (selection) => {
  console.log("勾选了");
  console.log(selection);
  if (selection.length > 0) {
    multipleSelection.value = [...multipleSelection.value, ...selection].reduce((acc, current) => {
      if (!acc.includes(current)) {
        acc.push(current);
      }
      return acc;
    }, []);
  }
};

const handleSizeChange = (pageSize) => {
  queryForm.value.pageNum = 1;
  queryForm.value.pageSize = pageSize;
  if (form.value.id === -1) {
    initMVList();
  }
};

const handleCurrentChange = (pageNum) => {
  queryForm.value.pageNum = pageNum;
  if (form.value.id === -1) {
    initMVList();
  }
};

const handleSelection = (selection) => {
  form.value.mvList = form.value.mvList.concat(selection);
  mvs.value = mvs.value.concat(selection);
  total.value = total.value + selection.length;
  dialogVisible.value = false;
};

const handleCloseDialog = () => {
  dialogVisible.value = false;
};

const initMVList = async () => {
  const res = await requestUtil.post("data/mv/list", queryForm.value);
  tableData.value = res.data.mvList;
  total.value = res.data.total;
  await nextTick(() => {
    if (multipleSelection.value.length > 0) {
      multipleSelection.value.forEach((selection) => {
        multipleTableRef.value.toggleRowSelection(selection, true);
      });
    }
  });
};

const handleDelete = (id) => {
  for (let i = 0; i < form.value.mvList.length; i++) {
    if (form.value.mvList[i].id === id) {
      form.value.mvList.splice(i, 1);
    }
  }
  for (let i = 0; i < mvs.value.length; i++) {
    if (mvs.value[i].id === id) {
      mvs.value.splice(i, 1);
    }
  }
};

const handleDialogValue = () => {
  dialogTitle.value = "在线悦单添加MV";
  dialogVisible.value = true;
};

const handleConfirm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (form.value.id === -1) {
        if (multipleSelection.value.length > 0) {
          if (multipleSelection.value.length >= 3 && multipleSelection.value.length <= 50) {
            form.value.id = null;
            form.value.sysUser = currentUser;
            form.value.mvList = multipleSelection.value;
          } else {
            ElMessage.error("MV数量最少选3部，最多选50部！");
            return;
          }
        } else {
          ElMessage.error("MV数量不能为0部！");
          return;
        }
      }
      form.value.videoCount = form.value.mvList.length;
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

.progress-container {
  padding-left: 20px;
  padding-right: 20px;
}
</style>
