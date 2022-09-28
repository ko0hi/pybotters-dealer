import {defineStore} from "pinia";
import {computed} from "#imports";
import {useDealerStore} from "~/store/dealerStore";
import {useBookStore} from "~/store/bookStore";
import {useTradeStore} from "~/store/tradeStore";

export const useBookChartStore = defineStore('bookChartOptionsStore',
    () => {
        const xMax = ref(10);
        const xMaxs = ref([0.5, 10, 20, 30]);
        const yTickFontSize = ref(10);
        const dataLabelFontSize = ref(10);
        const colorAsk = ref("rgb(87,196,255)");
        const colorBid = ref("rgb(255,173,84)");
        const colorBuy = ref("green");
        const colorSell = ref("red");
        const colorMid = ref("gold");
        const xGridDisplay = ref(true);
        const yGridDisplay = ref(false);
        const chartHeight = ref(1000);
        const chartWidth = ref(800);

        const buckets = ref([0, 100, 200, 500, 1000, 3000, 5000]);
        const clips = ref([1000, 2000, 3000, 5000, 10000, 20000, 30000]);
        const midRanges = ref([1000, 3000, 5000])

        function getColorBuySell(which: string) {
            return which.toLowerCase() == "buy" ? colorBuy.value : colorSell.value
        }

        const ltpAnnotations = computed(() => {
            const tradeStore = useTradeStore();
            const bookStore = useBookStore();
            const h = tradeStore.getHistory();
            if (h == null) {
                return {}
            } else {
                return {
                    "ltp": {
                        type: "line",
                        mode: "horizontal",
                        scaleID: "y",
                        borderWidth: 2,
                        value: bookStore.bucketize(tradeStore.ltp).toString(),
                        borderColor: getColorBuySell(h.side),
                        borderDash: [1, 3],
                        label: {
                            display: true,
                            backgroundColor: getColorBuySell(h.side),
                            color: "white",
                            content: `${tradeStore.ltpDiff}`,
                        }
                    }
                }
            }
        })

        const orderAnnotations = computed(() => {
            let annotations = {}
            const bookStore = useBookStore();
            useDealerStore().activeOrders.map((o, index) => {
                const c = getColorBuySell(o.side);
                annotations[o.id] = {
                    type: "line",
                    mode: "horizontal",
                    scaleID: "y",
                    borderWidth: 2,
                    value: bookStore.bucketize(bookStore.clipPrice(o['price'])).toString(),
                    borderColor: c,
                    // borderDash: [10, 10],
                    position: 'end',
                    label: {
                        display: true,
                        content: `${o["price"]}`,
                        backgroundColor: c,
                        color: 'white',
                        position: 'end',
                        // hoverRadius: 5,
                        yAdjust: -5,
                        font: {
                            size: '9px'
                        }
                    },
                }
            })
            return annotations
        });

        const positionAnnotations = computed(() => {
            const dealerStore = useDealerStore();

            const price = dealerStore.position['price']
            const pnl = dealerStore.position['pnl']
            const size = dealerStore.position['size']
            const side = dealerStore.position['side']

            if (price == 0) {
                return {}
            } else {
                const bookStore = useBookStore()
                let v = bookStore.bucketize(bookStore.clipPrice(price));
                const color = pnl > 0 ? 'white' : 'skyblue';
                return {
                    "position": {
                        type: "line",
                        mode: "horizontal",
                        scaleID: "y",
                        borderWidth: 1,
                        value: v.toString(),
                        borderColor: getColorBuySell(side),
                        borderDash: [1, 3],
                        label: {
                            display: true,
                            content: `PnL=${pnl} Size=${size}`,
                            backgroundColor: getColorBuySell(side),
                            color: color,
                            position: 'center',
                            font: {
                                size: '11px'
                            },
                            onHover: function (c, e) {
                                console.log(c, e)
                            }
                        }
                    }
                }
            }
        });

        const midAnnotations = computed(() => {
            const bookStore = useBookStore();
            let commonConfig = {
                type: "line",
                mode: "horizontal",
                scaleID: "y",
                borderWidth: 5,
                borderColor: colorMid.value,
                // borderDash: [1, 3],
                label: {
                    display: true,
                    backgroundColor: colorMid.value,
                    color: "black",
                    position: "start",
                    xAdjust: 30,
                    content: `${bookStore.mid} (${bookStore.spread})`,
                    font: {
                        size: '12px'
                    }
                }
            }
            let annotations = {}
            annotations['mid'] = {
                value: bookStore.bucketize(bookStore.mid).toString(),
                ...commonConfig
            }

            // midRanges.value.map(x => {
            //     for (let op of [1, -1]) {
            //         annotations[`midRange${op}${x}`] = {
            //             value: bookStore.bucketize(bookStore.mid + x * op).toString(),
            //             ...commonConfig,
            //             ...{
            //                 borderColor: 'gray',
            //                 borderWidth: 0.75,
            //                 label: {
            //                     display: true,
            //                     content: `${op == 1 ? '+' : '-'}${Math.round(x / 1000)}K`,
            //                     position: 'start',
            //                     color: 'white',
            //                     backgroundColor: 'gray',
            //                     font: {
            //                         size: '8px'
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // })

            return annotations;
        })


        return {
            xMax,
            xMaxs,
            yTickFontSize,
            dataLabelFontSize,
            colorAsk,
            colorBid,
            colorMid,
            xGridDisplay,
            yGridDisplay,
            chartHeight,
            chartWidth,

            buckets,
            clips,
            midRanges,

            ltpAnnotations,
            positionAnnotations,
            orderAnnotations,
            midAnnotations,

            getColorBuySell,
        }
    })
