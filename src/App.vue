<template>
  <router-view/>
</template>

<script setup>
import store from '@/store';
import {ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';

const route = useRoute();
const router = useRouter();
const whitePath = ['/login', '/index', '/'];

watch(route, (to, from) => {
  console.log("to" + to.name);
  console.log(to.path);
  if (whitePath.indexOf(to.path) === -1) {
    console.log("to.path=" + to.path)
    let obj = {
      name: to.name,
      path: to.path
    };
    store.commit("ADD_TABS", obj);
  }
}, {deep: true, immediate: true});
</script>

<style>
html, body, #app {
  height: 100%;
}

.app-container {
  padding: 20px;
}
</style>
