<script lang="ts" setup>
import {Bar} from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import chartjsPluginAnnotation from 'chartjs-plugin-annotation'
import {computed, ref, toRef, watch} from "#imports";
import {useBookStore} from "~/store/bookStore";
import {useTradeStore} from "~/store/tradeStore";
import {useBookChartStore} from "~/store/bookChartStore";
import {useDealerStore} from "~/store/dealerStore";
import BookChartDealPanel from "~/components/dealerBookChartDealPanel.vue";
import ShortcutButtons from "~/components/shortcutButtons.vue";

ChartJS.register(
    BarElement,
    LineElement,
    CategoryScale,
    Legend,
    LinearScale,
    LineController,
    PointElement,
    Title,
    Tooltip,
    ChartDataLabels,
    chartjsPluginAnnotation
)

const dealerStore = useDealerStore();
const bookStore = useBookStore();
const tradeStore = useTradeStore();
const chartStore = useBookChartStore();

const hoveringPrice = ref(null);


function getVolumes(vols) {
  let rtn = []
  for (let p of bookStore.prices) {
    rtn.push((vols[p] || 0) * -1)
  }
  return rtn
}

function getPriceFromCoordinate(e) {
  return bookStore.prices[e.chart.scales.y.getValueForPixel(e.y)];
}

const buyVolumes = computed(() => {
  return getVolumes(tradeStore.buyVolumes)
})
const sellVolumes = computed(() => {
  return getVolumes(tradeStore.sellVolumes)
})


const chartDataLabels = computed(() => {
  return {
    align: 'end',
    anchor: 'end',
    font: {
      size: chartStore.dataLabelFontSize
    },
    formatter: function (value, context) {
      return Math.round((value * 1000)) / 1000
    },
    display: function (context) {
      return context.dataset.data[context.dataIndex] > 0;
    },
  }
})

const chartData = computed(() => {
  return {
    type: "line",
    labels: bookStore.prices.map(x => x.toString()),
    datasets: [
      {
        label: 'Ask',
        data: bookStore.asks,
        backgroundColor: chartStore.colorAsk,
        datalabels: chartDataLabels.value,
      },
      {
        label: 'Bid',
        data: bookStore.bids,
        backgroundColor: chartStore.colorBid,
        datalabels: chartDataLabels.value,
      },
      {
        label: 'Buy Volumes',
        backgroundColor: "rgba(0,128,0,0.5)",
        data: buyVolumes.value,
        yAxisID: 'y1',
        xAxisID: 'x1',
        datalabels: {display: false}
      },
      {
        label: 'Sell Volumes',
        backgroundColor: "rgb(255,0,0, 0.5)",
        data: sellVolumes.value,
        yAxisID: 'y1',
        xAxisID: 'x1',
        datalabels: {display: false}
      },
      {
        type: 'line',
        label: "cumAsk",
        data: bookStore.cumAsks,
        datalabels: {display: false},
        radius: 0,
        borderColor: chartStore.colorAsk,
        fill: true,
        segment: {
          borderWidth: ctx => bookStore.cumAsks[ctx.p0DataIndex]
          > 0 ? 1.5 : 0,
          borderColor: ctx => bookStore.cumAsks[ctx.p0DataIndex]
          > 0 ? chartStore.colorAsk : "rgb(255,0,0, 0)"
        },
        tension: 0.4,
      },
      {
        type: 'line',
        label: "cumBid",
        data: bookStore.cumBids,
        datalabels: {display: false},
        radius: 0,
        borderColor: chartStore.colorBid,
        segment: {
          borderWidth: ctx => bookStore.cumBids[ctx.p0DataIndex]
          > 0 ? 1.5 : 0,
          borderColor: ctx => bookStore.cumBids[ctx.p0DataIndex]
          > 0 ? chartStore.colorBid : "rgb(255,0,0, 0)"
        },
        tension: 0.4,
      }
    ]
  }
})


const chartHoveringPriceAnnotation = computed(() => {
  if (hoveringPrice.value == null) {
    return {}
  } else {
    return {
      "hoveringPrice": {
        type: 'box',
        xMin: 0,
        xMax: chartStore.xMax,
        yMin: bookStore.bucketize(hoveringPrice.value).toString(),
        yMax:
            bookStore.bucketize(hoveringPrice.value + bookStore.bucket).toString(),
        backgroundColor: "rgba(238,233,167,0.5)",
        borderColor: "rgba(238,233,167,0.5)",
        font: {
          size: '10px'
        }
      }
    }
  }
})

const chartAnnotations = computed(() => {
  return {
    ...chartStore.ltpAnnotations,
    ...chartStore.midAnnotations,
    ...chartStore.positionAnnotations,
    ...chartStore.orderAnnotations,
    ...chartHoveringPriceAnnotation.value,
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        min: 0,
        max: chartStore.xMax,
        grid: {
          display: chartStore.xGridDisplay
        }
      },

      y: {
        ticks: {
          font: {
            size: chartStore.yTickFontSize
          },
        },
        grid: {
          display: chartStore.yGridDisplay
        }
      },
      x1: {
        display: false,
        min: -chartStore.xMax,
        max: 0,
        grid: {
          display: chartStore.xGridDisplay
        }
      },
      y1: {
        display: false,
        grid: {
          display: chartStore.yGridDisplay
        }
      }
    },
    plugins: {
      annotation: {
        annotations: chartAnnotations.value,
        animation: {
          duration: 0, // general animation time
        },
      }
    },
    animation: {
      duration: 200
    },
    onClick: async (e) => {
      const price = getPriceFromCoordinate(e);
      const side = price > bookStore.mid ? "SELL" : "BUY";
      const orders = dealerStore.getActiveOrder(price, side)

      if (orders.length == 0) {
        await dealerStore.limitOrder(price, side)
      } else {
        orders.map(async (o) => await dealerStore.cancelOrder(o.id))
      }
    },
    onHover: async (e) => {
      hoveringPrice.value = getPriceFromCoordinate(e);
    }
  }
})


</script>

<template>
  <div>
    <el-row>
      <el-col :span="14">
        <Bar
            :chartData="chartData"
            :chartOptions="chartOptions"
            :height="chartStore.chartHeight"
            :width="chartStore.chartWidth"
        >
        </Bar>
      </el-col>
      <el-col :span="8">
        <shortcut-buttons></shortcut-buttons>
        <el-divider></el-divider>
        <dealer-book-chart-deal-panel></dealer-book-chart-deal-panel>
        <dealer-book-chart-board-options-panel></dealer-book-chart-board-options-panel>
      </el-col>
    </el-row>

  </div>
</template>

<style scoped>
.el-row {
  margin: 10px 0px 0px 0px;
}

.el-col {
  margin: 0px 10px 0px 10px;
}
</style>
