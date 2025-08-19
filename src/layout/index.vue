<template>
  <div class="app-wrapper">
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar-container">
        <div class="title"><span v-if="!isCollapse">悦听影音后台管理系统</span></div>
        <Menu :collapse="isCollapse"/>
      </el-aside>
      <el-container>
        <el-header>
          <Header @updateValue="initCollapse"/>
        </el-header>
        <el-main>
          <Tabs/>
          <router-view/>
        </el-main>
        <el-footer>
          <Footer/>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import Menu from '@/layout/menu';
import Header from '@/layout/header';
import Footer from '@/layout/footer';
import Tabs from '@/layout/tabs';
import {ref} from 'vue';

const isCollapse = ref(false);

const initCollapse = (value) => {
  isCollapse.value = value;
}
</script>

<style scoped>

.app-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.sidebar-container {
  background-color: #2d3a4b;
  height: 100%;
}

.el-container {
  height: 100%
}

.el-header {
  padding-left: 0px;
  padding-right: 0px;
}

:deep(ul.el-menu) {
  border-right-width: 0px
}

.title {
  background: rgb(65, 109, 131);
  text-align: center;
  color: white;
  height: 60px;
  line-height: 60px;
  font-size: medium;
  font-weight: bold;
}
</style>
