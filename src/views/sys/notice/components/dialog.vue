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
      <el-form-item label="公告标题" prop="title">
        <el-input v-model.trim="form.title"/>
      </el-form-item>
      <el-form-item label="公告内容" prop="content">
        <el-mention v-model.trim="form.content" type="textarea"/>
      </el-form-item>
      <el-form-item label="发布时间" prop="publishTime">
        <el-date-picker
            v-model="form.publishTime"
            type="datetime"
            placeholder="请选择一个日期"
            format="YYYY-MM-DD HH:mm:ss"
            date-format="MMM DD, YYYY"
            time-format="HH:mm"/>
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
  title: "",
  content: "",
  publishTime: Date
});

const checkTitle = async (rule, value, callback) => {
  if (form.value.id === -1) {
    const res = await requestUtil.post("sys/notice/checkTitle", {title: form.value.title});
    if (res.data.code === 500) {
      callback(new Error("公告标题已存在！"));
    } else {
      callback();
    }
  } else {
    callback();
  }
};

const rules = ref({
  title: [
    {required: true, message: '请输入公告标题'},
    {required: true, validator: checkTitle, trigger: "blur"}
  ],
  content: [{required: true, message: "公告内容不能为空", trigger: "blur"}]
});

const formRef = ref(null);

const initFormData = async (id) => {
  const res = await requestUtil.get("sys/notice/" + id);
  form.value = res.data.sysNotice;
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
          title: "",
          content: "",
          publishTime: Date
        };
      }
    }
);

const emits = defineEmits(['update:modelValue', 'initNoticeList']);

const handleClose = () => {
  emits('update:modelValue', false)
};

const handleConfirm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (form.value.id === -1) {
        form.value.id = null;
      }
      let result = await requestUtil.post("sys/notice/save", form.value);
      let data = result.data;
      if (data.code === 200) {
        ElMessage.success("执行成功！");
        formRef.value.resetFields();
        emits("initNoticeList");
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

<style lang="scss" scoped>

</style>
