<template>
  <div class="home">
    <el-row :gutter="10">
      <el-col :span="12">
        <el-card>
          <e-charts class="lineChart" :option="lineOption"/>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>

        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {defineComponent, ref} from 'vue';

const lineOption = ref({
  title: {
    text: 'Stacked Line'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }
  ]
});
</script>

<style lang="scss" scoped>
.home {
  padding: 10px;
  font-size: 30px;
  font-weight: bold;
}

.lineChart {
  width: 100%;
  height: 400px;
}
</style>