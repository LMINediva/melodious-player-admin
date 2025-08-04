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
      <el-form-item label="MV" prop="mvList">
        <el-table v-if="form.id !== -1"
                  :data="form.mvList.slice((queryForm.pageNum - 1) * queryForm.pageSize,
            (queryForm.pageNum - 1) * queryForm.pageSize + queryForm.pageSize)"
                  stripe style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"/>
          <el-table-column prop="title" label="MV名" width="100" align="center"/>
          <el-table-column prop="artistName" label="歌手名称" width="100" align="center"/>
          <el-table-column prop="videoSourceTypeName" label="视频源类型名" width="100" align="center"/>
        </el-table>
        <el-table v-else :data="tableData" stripe style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"/>
          <el-table-column prop="title" label="MV名" width="100" align="center"/>
          <el-table-column prop="artistName" label="歌手名称" width="100" align="center"/>
          <el-table-column prop="videoSourceTypeName" label="视频源类型名" width="100" align="center"/>
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
  mvList: [],
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

const tableData = ref([]);
const total = ref(0);
const queryForm = ref({
  query: '',
  pageNum: 1,
  pageSize: 10
});

const thumbnailPicUrl = ref("");
const formRef = ref(null);
const multipleSelection = ref([]);

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
  form.value = res.data.playItem;
  thumbnailPicUrl.value = getServerUrl() + 'image/listPicture/' + form.value.thumbnailPic;
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
          type: '',
          title: '',
          thumbnailPic: '',
          mvList: [],
          description: '',
          status: 0,
          createdTime: Date,
          integral: 0,
          weekIntegral: 0,
          totalUser: 0,
          rank: 0
        };
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

const handleSelectionChange = (selection) => {
  console.log("勾选了");
  console.log(selection);
  multipleSelection.value = selection;
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

const initMVList = async () => {
  const res = await requestUtil.post("data/mv/list", queryForm.value);
  tableData.value = res.data.mvList;
  total.value = res.data.total;
};

if (form.value.id === -1) {
  initMVList();
}

const handleConfirm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (form.value.id === -1) {
        form.value.id = null;
      }
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
