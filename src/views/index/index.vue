<template>
  <div class="home">
    <el-row :gutter="10">
      <el-col :span="12">
        <span>系统公告</span>
        <el-collapse v-model="activeName" accordion>
          <el-collapse-item
              v-for="item in noticeData"
              :key="item.id"
              :title="item.name"
              :name="item.id">
            <div class="notice">
              <strong>公告内容：</strong>
              {{ item.content }}
            </div>
            <div class="notice">
              <strong>发布时间：</strong>
              {{ item.pubDate }}
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-col>
      <el-col :span="4" class="statistic">
        <el-statistic title="用户数量" :value="268500"/>
      </el-col>
      <el-col :span="4" class="statistic">
        <el-statistic title="音乐数量" :value="172000"/>
      </el-col>
      <el-col :span="4" class="statistic">
        <el-statistic title="MV数量" :value="123213"/>
      </el-col>
    </el-row>
    <el-row :gutter="10" class="row">
      <el-col :span="12">
        <e-charts class="lineChart" :option="lineOption"/>
      </el-col>
      <el-col :span="12">
        <e-charts class="pieChart" :option="pieOption"/>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {defineComponent, ref} from 'vue';

const noticeData = [
  {id: 1, name: "公告标题1", content: "公告内容1", pubDate: "2024-04-11"},
  {id: 2, name: "公告标题2", content: "公告内容2", pubDate: "2024-04-11"},
  {id: 3, name: "公告标题3", content: "公告内容3", pubDate: "2024-04-11"},
  {id: 4, name: "公告标题4", content: "公告内容4", pubDate: "2024-04-11"},
  {id: 5, name: "公告标题5", content: "公告内容5", pubDate: "2024-04-11"},
];

const activeName = ref(noticeData.length > 0 ? noticeData[0].id : "");

const lineOption = ref({
  title: {
    text: '近7年用户数量'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['2019', '2020', '2021', '2022', '2023', '2024', '2025']
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

const pieOption = ref({
  title: {
    text: '音乐类型数量',
    subtext: '截至到2025年8月14日',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '类型',
      type: 'pie',
      radius: '50%',
      data: [
        {value: 1048, name: '音乐'},
        {value: 735, name: 'MV'},
        {value: 580, name: '悦单'}
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
});
</script>

<style lang="scss" scoped>
.home {
  padding: 10px;
}

.notice {
  padding: 0 20px;
}

.el-collapse-item {
  --el-collapse-header-font-size: 16px;
}

.el-statistic {
  --el-statistic-content-font-size: 38px;
  --el-statistic-title-font-size: 18px;
}

.statistic {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
}

.row {
  margin-top: 10px;
}

.lineChart {
  width: 100%;
  height: 400px;
}

.pieChart {
  width: 100%;
  height: 400px;
}
</style>