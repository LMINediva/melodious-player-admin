<template>
  <el-dialog
      model-value="menuDialogVisible"
      title="分配权限"
      width="30%"
      @close="handleClose">
    <el-form
        ref="formRef"
        :model="form"
        label-width="100px">
      <el-tree
          ref="treeRef"
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          :default-expand-all=true
          node-key="id"
          :check-strictly=true
      />
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

const defaultProps = {
  children: 'children',
  label: 'name'
};

const props = defineProps(
    {
      id: {
        type: Number,
        default: -1,
        required: true
      },
      menuDialogVisible: {
        type: Boolean,
        default: false,
        required: true
      }
    }
);

const treeRef = ref(null);


const form = ref({
  id: -1
});

const formRef = ref(null);
const treeData = ref([]);

const initFormData = async (id) => {
  const res = await requestUtil.get("sys/menu/treeList");
  treeData.value = res.data.treeMenu;
  form.value.id = id;
  const res2 = await requestUtil.get("sys/role/menus/" + id);
  treeRef.value.setCheckedKeys(res2.data.menuIdList);
};

watch(
    () => props.menuDialogVisible,
    () => {
      let id = props.id;
      console.log("id=" + id);
      if (id !== -1) {
        initFormData(id);
      }
    }
);

const emits = defineEmits(['update:modelValue', 'initRoleList']);

const handleClose = () => {
  emits('update:modelValue', false);
};

const handleConfirm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      var menuIds = treeRef.value.getCheckedKeys();
      let result = await requestUtil.post("sys/role/updateMenus/" + form.value.id, menuIds);
      let data = result.data;
      if (data.code === 200) {
        ElMessage.success("执行成功！");
        emits("initRoleList");
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

<style lang="scss" scoped>

</style>