
<template>
    <div :style="{ width: width + 'px', height: height + 'px' }">
        <canvas ref="canvas"></canvas>
    </div>
</template>
  
<script>
import { Chart, Title, Legend, LineController, LineElement, PointElement, LinearScale, CategoryScale, TimeScale } from 'chart.js';
// import moment from 'moment';
import 'chartjs-adapter-moment';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(Title, Legend, LineController, LineElement, PointElement, LinearScale, CategoryScale, TimeScale, annotationPlugin);


export default {
    props: {
        width: {
            type: [Number, String],
            default: 800
        },
        height: {
            type: [Number, String],
            default: 400
        },
        chartData: {
            type: Object,
            required: true
        },
        title: {
            type: String,
            default: '제목 지정'
        },
        xLabel: {
            type: String,
            default: "X축 지정"
        },
        yLabel: {
            type: String,
            default: "Y축 지정"
        },
        useRightYAxis: {
            type: Boolean,
            default: false
        },
        yLabelRight: {
            type: String,
            default: 'Y축 지정'
        }
    },
    data() {
        return {
            myChart: null,
            isUpdating: false
        };
    },
    methods: {
        updateChart() {
            console.log(">>>>>>>isUpadting 1111111111");  // 디버깅

            if (this.isUpdating) {
                console.log(">>>>>>>isUpadting 222222222");  // 디버깅

                return;  // 플래그 변수를 사용하여 무한 루프 방지
            }
            this.isUpdating = true;

            console.log("Updating chart...");  // 디버깅
            if (this.myChart) {
                this.myChart.data = JSON.parse(JSON.stringify(this.chartData));

                console.log(">>>>>>>> mychart 확인1...");  // 디버깅
                try {
                    this.myChart.update();
                } catch (error) {
                    console.error('Error updating the chart:', error);
                }
                console.log(">>>>>>>> mychart 확인2...");  // 디버깅
            }
            this.isUpdating = false;
        }
    },
    watch: {
        chartData() {
            this.updateChart();
            
        }
    },

    mounted() {
        console.log(">>>> Initial chart data:", this.chartData);  // 디버깅
        if (this.chartData) {
            const ctx = this.$refs.canvas.getContext('2d');

            let scalesOptions = {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year'
                    },
                    title: {
                        display: true,
                        text: this.xLabel
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: this.yLabel
                    }
                }
            };
            
            if (this.useRightYAxis) {
                scalesOptions.yRight = {
                    id: 'yRight',
                    position: 'right',
                    title: {
                        display: true,
                        text: this.yLabelRight
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                };

                // 데이터셋의 yAxisID 설정
                this.chartData.datasets.forEach(dataset => {
                    if (dataset.label === '선행-물가지수') {
                        dataset.yAxisID = 'yRight';
                    }
                });
            }
            
            if (!this.myChart) {
                this.myChart = new Chart(ctx, {
                    type: 'line',
                    data: this.chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 3,
                        layout: {
                            padding: {
                                top: 50
                            }
                        },
                        elements: {
                            point: {
                                radius: 0  // 원 마커 
                            }
                        },
                        scales: scalesOptions,
                        plugins: {
                            title: {
                                display: true,
                                text: this.title,
                                font: {
                                    size: 24
                                }
                            },
                            legend: {
                                display: true,
                                position: 'top',
                                align: 'start',
                                labels: {
                                    padding: 50
                                }
                            },
                            annotation: {
                                drawTime: 'beforeDatasetsDraw',
                                annotations: [{
                                    type: 'line',
                                    mode: 'horizontal',
                                    scaleID: 'y',
                                    value: 0,
                                    borderColor: 'black',
                                    borderWidth: 2
                                }]
                                // ,{
                                //     type: 'line',
                                //     mode: 'horizontal',
                                //     scaleID: 'y',
                                //     value: 0,
                                //     borderColor: 'black',
                                //     borderWidth: 2
                                // }]
                            }
                        }
                    }
                });
            } else {
                this.myChart.data = JSON.parse(JSON.stringify(this.chartData));
                this.myChart.update();
            }
        }
    }
}
</script>
