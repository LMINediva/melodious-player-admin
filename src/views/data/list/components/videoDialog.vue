<template>
  <el-dialog
      v-bind="dialogVisible"
      :title="dialogTitle"
      width="30%"
      @close="handleClose">
    <el-form
        ref="formRef"
        :model="form"
        label-width="100px">
      <el-form-item v-for="mv in form.mvList" :label="mv.title">
        <video :src="getServerUrl() + 'video/mv/' + mv.url" width="320" height="240" controls>
          您的浏览器不支持video元素。
        </video>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import {defineEmits, defineProps, ref, watch} from 'vue';
import requestUtil, {getServerUrl} from '@/util/request';
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
  mvList: []
});

const headers = ref({
  token: store.getters.GET_TOKEN
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("data/list/" + id);
  form.value = res.data.playItem;
};

watch(
    () => props.dialogVisible,
    () => {
      let id = props.id;
      console.log("id=" + id);
      initFormData(id);
    }
);

const handleClose = () => {
};
</script>

<style scoped>
.text-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
