<template>
  <div class="navbar">
    <div class="toggle-menu" @click="toggleCollapse">
      <el-icon v-if="isCollapse" :size="25">
        <Expand/>
      </el-icon>
      <el-icon v-else :size="25">
        <Fold/>
      </el-icon>
    </div>
    <Breadcrumb/>
    <div class="navbar-right">
      <Avatar/>
    </div>
  </div>
</template>

<script setup>
import Breadcrumb from './components/breadcrumb.vue';
import Avatar from './components/avatar.vue';
import {Expand, Fold} from "@element-plus/icons-vue";
import {ref, defineEmits} from "vue";

const isCollapse = ref(false);

const emits = defineEmits(['updateValue', 'initCollapse']);

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
  emits('updateValue', isCollapse.value);
};
</script>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 60px;
  overflow: hidden;
  background-color: #F5F5F5;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 16px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  position: relative;

  .navbar-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    :deep(.navbar-item) {
      display: inline-block;
      margin-left: 18px;
      font-size: 22px;
      color: #5a5e66;
      box-sizing: border-box;
      cursor: pointer;
    }
  }
}

.toggle-menu {
  text-align: center;
  color: black;
  cursor: pointer;
}

.toggle-menu:hover {
  color: rgb(76, 127, 152);
}
</style>