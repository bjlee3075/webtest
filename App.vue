
<template>
  <div id="app">
    <!-- 그래프 1 기간 선택 및 데이터 가져오기 버튼 추가 -->
    <div class="date-selector">
      <label>그래프 1 시작 날짜: </label>
      <input type="date" v-model="startDate1">
      <label>그래프 1 종료 날짜: </label>
      <input type="date" v-model="endDate1">
      <button @click="fetchDataForChart1">데이터 가져오기</button>
    </div>

    <LineChart v-if="dataForChart1" 
      ref="chart1"  
      :width="900" :height="450"
      :chartData="dataForChart1" 
      title="소비자물가 상승률 추이"
      xLabel="시점"
      yLabel="전년동월비(%)" />

    
    <!-- 그래프 2 기간 선택 및 데이터 가져오기 버튼 추가 -->
    <div class="date-selector">
      <label>그래프 2 시작 날짜: </label>
      <input type="date" v-model="startDate2">
      <label>그래프 2 종료 날짜: </label>
      <input type="date" v-model="endDate2">
      <button @click="fetchDataForChart2">데이터 가져오기</button>
    </div>

    <!-- 2번재 그래프는 y축 우측도 사용 -->
    <LineChart v-if="dataForChart2" 
      ref="chart2"  
      :width="900" :height="450"
      :chartData="dataForChart2" 
      title="주가와 선행지수-물가상승률"
      xLabel="시점"
      yLabel="KOSPI 전년동월비(%)"
      
      useRightYAxis 
      yLabelRight="선행-물가 전년동월비(%)" />
  </div>
</template>


<script>
import axios from 'axios';
import LineChart from './LineChart.vue';

export default {
  components: {
    LineChart
  },
  data() {
    return {
      startDate1: '2010-01-01',  // 그래프 1 시작 날짜
      endDate1: new Date().toISOString().split('T')[0],    // 그래프 1 종료 날짜
      startDate2: '2010-01-01',  // 그래프 2 시작 날짜
      endDate2: new Date().toISOString().split('T')[0],    // 그래프 2 종료 날짜
      dataForChart1: null,
      dataForChart2: null
    };
  },
  watch: {
    dataForChart1(newData, oldData) {
      if (newData !== oldData && this.$refs.chart1 && typeof this.$refs.chart1.updateChart === 'function') {
        this.$refs.chart1.updateChart();  // 차트1 갱신
      }
    },
    dataForChart2(newData, oldData) {
      if (newData !== oldData && this.$refs.chart2 && typeof this.$refs.chart2.updateChart === 'function') {
        this.$refs.chart2.updateChart();  // 차트2 갱신
      }
    }
  },



  methods: {
    async fetchDataForChart1() {
      console.log("fetchDataForChart1 called");

      console.log("fetchDataForChart1: 시작");

      const dateParam1Start = this.startDate1;
      const dateParam1End = this.endDate1;  

      console.log("Selected dates for Chart1:", dateParam1Start, dateParam1End);

      try {
        // 선택된 날짜를 API 호출에 사용
        console.log("API 호출하기 전");
        
        const response1 = await axios.get(`http://localhost:5000/graph1data?startDate=${dateParam1Start}&endDate=${dateParam1End}`);
        console.log("Response for Chart1:", response1.data);

        // 데이터 처리
        this.dataForChart1 = {

          labels: response1.data.data15_1.map(item => item.시점),
          datasets: [
            {
              label: '소비자물가지수',
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              data: response1.data.data15_1.map(item => item.전년동월비),
              fill: false
            },
            {
              label: '근원물가지수',
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              data: response1.data.data15_2.map(item => item.전년동월비),
              fill: false
            }
          ]
        };
        console.log("API 호출한 후");
        console.log("Data for Chart1 after processing:", this.dataForChart1);

      } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
      }

      console.log("fetchDataForChart1: 끝");
    },

    async fetchDataForChart2() {
      console.log("fetchDataForChart2 called");

      const dateParam2Start = this.startDate2;
      const dateParam2End = this.endDate2;  
      console.log("Selected dates for Chart2:", dateParam2Start, dateParam2End);

      try {
        const response2 = await axios.get(`http://localhost:5000/graph2data?startDate=${dateParam2Start}&endDate=${dateParam2End}`);
        console.log("Response for Chart2:", response2.data);

        // 데이터 처리
        this.dataForChart2 = {

          labels: response2.data.data16_1.map(item => item.시점),

          datasets: [
            {
              label: 'KOSPI지수',
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              data: response2.data.data16_1.map(item => item.전년동월비),
              fill: false
            },
            {
              label: '선행-물가지수',
              yAxisID: 'yRight',
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              data: response2.data.data16_2.map(item => item.선행물가),
              fill: false
            }
          ]
        };
        console.log("Data for Chart2 after processing:", this.dataForChart2);

      } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
      }
    }
  },
  mounted() {
    console.log('App.vue has been mounted!');
    this.fetchDataForChart1();
    this.fetchDataForChart2();
  }
}
</script>

<style scoped>
/* 날짜 선택 및 데이터 가져오기 버튼 스타일 추가 */
.date-selector {
  margin-bottom: 20px;
}
</style>
