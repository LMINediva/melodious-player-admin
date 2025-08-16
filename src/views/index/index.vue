<template>
  <div class="home">
    <el-row :gutter="10">
      <el-col :span="12">
        <span>系统公告</span>
        <el-scrollbar class="notice">
          <el-collapse v-model="activeName" class="notice-collapse" accordion>
            <el-collapse-item
                v-for="item in noticeData"
                :key="item.id"
                :title="item.title"
                :name="item.id">
              <div class="notice-item">
                <strong>公告内容：</strong>
                {{ item.content }}
              </div>
              <div class="notice-item">
                <strong>发布时间：</strong>
                {{ formatDateTime(item.publishTime) }}
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </el-col>
      <el-col :span="4" class="statistic">
        <el-statistic title="用户数量" :value="userQuantity"/>
      </el-col>
      <el-col :span="4" class="statistic">
        <el-statistic title="音乐数量" :value="musicQuantity"/>
      </el-col>
      <el-col :span="4" class="statistic">
        <el-statistic title="MV数量" :value="mvQuantity"/>
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
import requestUtil from "@/util/request";
import moment from "moment-timezone";

const noticeData = ref([]);
const total = ref(0);
const queryForm = ref({
  query: '',
  pageNum: 1,
  pageSize: 10
});

const userQuantity = ref(0);
const musicQuantity = ref(0);
const mvQuantity = ref(0);
const listQuantity = ref(0);
const pastYear = ref([]);
const pastUserQuantity = ref([]);

const initData = async () => {
  const res = await requestUtil.post("sys/notice/list", queryForm.value);
  noticeData.value = res.data.noticeList;
  total.value = res.data.total;
  const userRes = await requestUtil.get("sys/user/total");
  userQuantity.value = userRes.data.total;
  const musicRes = await requestUtil.get("data/music/total");
  musicQuantity.value = musicRes.data.total;
  const mvRes = await requestUtil.get("data/mv/total");
  mvQuantity.value = mvRes.data.total;
  const pastUserRes = await requestUtil.get("sys/user/pastUserQuantity");
  pastYear.value = pastUserRes.data.pastYear;
  pastUserQuantity.value = pastUserRes.data.pastUserQuantity;
  const musicListRes = await requestUtil.get("data/list/total");
  listQuantity.value = musicListRes.data.total;
};

initData();

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
    data: pastYear
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: pastUserQuantity,
      type: 'line',
      smooth: true
    }
  ]
});

const pieOption = ref({
  title: {
    text: '音乐类型数量',
    subtext: '截至到' + new Date().getFullYear() + '年'
        + String(new Date().getMonth() + 1).padStart(2, '0') + '月'
        + String(new Date().getDate()).padStart(2, '0') + '日',
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
        {value: musicQuantity, name: '音乐'},
        {value: mvQuantity, name: 'MV'},
        {value: listQuantity, name: '悦单'}
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

const formatDateTime = (cellValue) => {
  if (!cellValue) {
    return '';
  }
  return moment(cellValue).format("YYYY-MM-DD HH:mm:ss");
};
</script>

<style lang="scss" scoped>
.home {
  padding: 10px;
}

.notice {
  height: 250px;
  margin-top: 10px;
}

.notice-collapse {
  width: 98%;
}

.notice-item {
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