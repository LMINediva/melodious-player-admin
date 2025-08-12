<template>
  <div class="app-wrapper">
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar-container">
        <div class="toggle-menu" @click="toggleCollapse">
          <el-icon v-if="isCollapse" :size="25">
            <Expand/>
          </el-icon>
          <el-icon v-else :size="25">
            <Fold/>
          </el-icon>
        </div>
        <Menu :collapse="isCollapse"/>
      </el-aside>
      <el-container>
        <el-header>
          <Header/>
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
import {Fold, Expand} from '@element-plus/icons-vue';
import {ref} from 'vue';

const isCollapse = ref(false);

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};
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

.toggle-menu {
  background: rgb(65, 109, 131);
  text-align: center;
  color: white;
  cursor: pointer;
}

.toggle-menu:hover {
  background: rgb(76, 127, 152);
}

</style>
