<template>
  <el-tabs
      v-model="editableTabsValue"
      type="card"
      class="demo-tabs"
      closable
      @tab-remove="removeTab"
      @tab-click="clickTab"
  >
    <el-tab-pane
        v-for="item in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
    >
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import {ref, watch} from 'vue';
import store from '@/store';
import {useRouter} from 'vue-router';

const router = useRouter();
const editableTabsValue = ref(store.state.editableTabsValue);
const editableTabs = ref(store.state.editableTabs);

const removeTab = (targetName) => {
  const tabs = editableTabs.value;
  let activeName = editableTabsValue.value;
  if (activeName === '/index') {
    return;
  }
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1];
        if (nextTab) {
          activeName = nextTab.name;
        }
      }
    });
  }
  editableTabsValue.value = activeName;
  editableTabs.value = tabs.filter((tab) => tab.name !== targetName);
  store.state.editableTabsValue = editableTabsValue.value;
  store.state.editableTabs = editableTabs.value;
  router.push({path: activeName});
};

const refreshTabs = () => {
  editableTabsValue.value = store.state.editableTabsValue;
  editableTabs.value = store.state.editableTabs;
};

const clickTab = (target) => {
  router.push({name: target.props.label});
};

watch(store.state, () => {
  refreshTabs();
}, {deep: true, immediate: true});
</script>

<style>
.demo-tabs > .el-tabs__content {
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.el-main {
  padding: 0;
}

.el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  background-color: lightgray;
}
</style>