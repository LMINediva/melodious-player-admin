<template>
  <el-dialog
      v-bind="dialogVisible"
      :title="dialogTitle"
      width="40%"
      @close="handleClose">
    <el-form
        ref="formRef"
        :model="form"
        label-width="200px">
      <el-form-item label="反馈内容：">
        <el-text class="mx-1">{{ form.content }}</el-text>
      </el-form-item>
      <el-form-item label="反馈图片：">
        <el-image :src="getServerUrl() + 'image/feedbackPicture/' + form.picture"
                  :preview-src-list="[getServerUrl() + 'image/feedbackPicture/' + form.picture]"
                  class="image" alt="反馈图片"/>
      </el-form-item>
      <el-form-item label="反馈用户：">
        <el-text class="mx-1">{{ form.sysUser.username }}</el-text>
      </el-form-item>
      <el-form-item label="提交时间：">
        <el-text class="mx-1">{{ formatDateTime(form.submissionTime) }}</el-text>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import {defineProps, ref, watch} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
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
  sysUser: {
    username: ""
  }
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("sys/feedback/" + id);
  form.value = res.data.feedback;
};

watch(
    () => props.dialogVisible,
    () => {
      let id = props.id;
      initFormData(id);
    }
);

const formatDateTime = (time) => {
  if (!time) {
    return '';
  }
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
};

const handleClose = () => {
};
</script>

<style scoped>
.image {
  width: 150px;
  height: 150px;
}
</style>
