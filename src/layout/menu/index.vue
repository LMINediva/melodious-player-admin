<template>
  <el-menu
      active-text-color="#ffd04b"
      background-color="#2d3a4b"
      class="el-menu-vertical-demo"
      text-color="#fff"
      router
      :default-active="activeIndex">
    <el-menu-item index="/index">
      <el-icon>
        <home-filled/>
      </el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-sub-menu :index="menu.path" v-for="menu in menuList">
      <template #title>
        <el-icon>
          <svg-icon :icon="menu.icon"/>
        </el-icon>
        <span>{{ menu.name }}</span>
      </template>
      <el-menu-item :index="item.path" v-for="item in menu.children" @click="openTab(item)">
        <el-icon>
          <svg-icon :icon="item.icon"/>
        </el-icon>
        <span>{{ item.name }}</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import {
  HomeFilled,
  User,
  Tickets,
  Goods,
  DocumentAdd,
  Management,
  Setting,
  Edit,
  SwitchButton,
  Promotion
} from '@element-plus/icons-vue';
import {ref, watch} from 'vue';
import store from '@/store';

const menuList = ref(store.getters.GET_MENULIST);
const openTab = (item) => {
  store.commit('ADD_TABS', item);
};

const activeIndex = ref("/index");

watch(store.state, () => {
  console.log("editableTabsValue=" + store.state.editableTabsValue);
  activeIndex.value = store.state.editableTabsValue;
}, {deep: true, immediate: true});

</script>

<style lang="scss" scoped>

</style>