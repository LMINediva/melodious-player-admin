<template>
  <div class="download-page">
    <el-image class="app-icon" style="width: 100px; height: 100px" :src="appIconUrl"/>
    <p class="title">悦听影音&nbsp;&nbsp;尽享精彩</p>
    <el-button type="primary" size="large" class="download-btn" @click="handleDownloadLatestAPK">立即下载</el-button>
    <p class="information">版本：{{ form.version }}&nbsp;更新时间：{{ formatDateTime(form.uploadTime) }}</p>
  </div>
</template>

<script setup>
import requestUtil, {getServerUrl} from "@/util/request";
import {ref} from "vue";
import moment from "moment-timezone";

const appIconUrl = getServerUrl() + "image/androidApplicationPicture/default.png";
const form = ref({
  id: -1,
  name: '',
  icon: 'default.png',
  code: 0,
  version: '',
  content: '',
  url: '',
  size: 0,
  uploadTime: Date,
  force: 0,
  status: 0
});

const initFormData = async () => {
  const res = await requestUtil.get("sys/android/findLatestAPK");
  form.value = res.data.androidApplication;
};

initFormData();

const handleDownloadLatestAPK = async () => {
  window.location.href = getServerUrl() + "sys/android/downloadLatestAPK";
};

const formatDateTime = (cellValue) => {
  if (!cellValue) {
    return '';
  }
  return moment(cellValue).format("YYYY-MM-DD");
};
</script>

<style>
.download-page {
  text-align: center;
  padding: 50px;
  height: 100%;
  background-image: url("../../assets/images/download-background.jpeg");
  background-size: 100% 100%;
}

.app-icon {
  margin-top: 50px;
}

.title {
  color: white;
  margin-top: 50px;
  font-size: 25px;
}

.download-btn {
  display: block;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 100px;
  font-size: 18px;
}

.information {
  margin-top: 40px;
  color: white;
  font-size: 13px;
}
</style>
