<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="box-card">
          <template v-slot:header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <avatar :user="currentUser"/>
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon="user"/>&nbsp;&nbsp;用户名称
                <div class="pull-right">{{ currentUser.username }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon="phone"/>&nbsp;&nbsp;手机号码
                <div class="pull-right">{{ currentUser.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon="email"/>&nbsp;&nbsp;用户邮箱
                <div class="pull-right">{{ currentUser.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon="peoples"/>&nbsp;&nbsp;所属角色
                <div class="pull-right">{{ currentUser.roles }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon="date"/>&nbsp;&nbsp;创建日期
                <div class="pull-right">{{ formatDate(currentUser.loginDate) }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card>
          <template v-slot:header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="currentUser"/>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd :user="currentUser"/>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import avatar from './avatar';
import userInfo from './userInfo';
import resetPwd from './resetPwd';
import {ref} from 'vue';
import store from '@/store';
import {formatDate} from '@/util/formatDate.js';

const currentUser = ref(store.getters.GET_USERINFO);
const activeTab = ref("userinfo");
</script>

<style lang="scss" scoped>
.list-group-striped > .list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
}

.list-group-item {
  border-bottom: 1px solid #e7eaec;
  border-top: 1px solid #e7eaec;
  margin-bottom: -1px;
  padding: 11px 0;
  font-size: 13px;
}

.pull-right {
  float: right !important;
}

::v-deep .el-card__body {
  height: 230px;
}

::v-deep .box-card {
  height: 450px;
}
</style>