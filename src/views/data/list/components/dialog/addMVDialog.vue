<template>
  <el-dialog
      v-bind="dialogVisible"
      :title="dialogTitle"
      width="50%"
      @close="handleClose">
    <el-table :data="tableData" stripe style="width: 100%"
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
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleConfirm">确认</el-button>
        <el-button @click="handleClose">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import {computed, defineEmits, defineProps, ref, watch} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
import store from "@/store";

const props = defineProps(
    {
      mvs: {
        type: Array,
        default: [],
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

const multipleSelection = ref([]);

watch(
    () => props.dialogVisible,
    () => {
      initMVList();
    }
);

const handleSelectionChange = (selection) => {
  console.log("勾选了");
  console.log(selection);
  multipleSelection.value = selection;
};

const handleSizeChange = (pageSize) => {
  queryForm.value.pageNum = 1;
  queryForm.value.pageSize = pageSize;
  initMVList();
};

const handleCurrentChange = (pageNum) => {
  queryForm.value.pageNum = pageNum;
  initMVList();
};

const initMVList = async () => {
  const res = await requestUtil.post("data/mv/list", queryForm.value);
  tableData.value = res.data.mvList;
  total.value = res.data.total - props.mvs.length;
  for (let i = 0; i < tableData.value.length; i++) {
    for (let j = 0; j < props.mvs.length; j++) {
      if (tableData.value[i].id === props.mvs[j].id) {
        tableData.value.splice(i, 1);
      }
    }
  }
};

initMVList();

const emit = defineEmits(['updateSelection', 'closeDialog']);

const handleClose = () => {
  emit('closeDialog');
};

const handleConfirm = () => {
  emit('updateSelection', multipleSelection.value);
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
