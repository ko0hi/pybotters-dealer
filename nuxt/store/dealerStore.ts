import {defineStore} from "pinia";
import {Ref} from "@vue/reactivity";
import {useTradeStore} from "~/store/tradeStore";
import {useBookStore} from "~/store/bookStore";
import {ElNotification} from "element-plus";
import {ref} from "#imports";
import {randInt} from "~/composables/utils";

interface Order {
    price: number
    side: string
    id: string
    size?: number
}

interface Position {
    price: number
    size: number
    side: string
    pnl?: number
}

interface Event {
    name: string
    orderId?: string
    size?: string
}

export const useDealerStore = defineStore('dealerStore', () => {
    const exchange = ref('bitflyer');
    const symbol = ref('FX_BTC_JPY');
    const size = ref(0.01);
    const position = ref({price: 0, size: 0, side: null}) as Ref<Position>;
    const activeOrders = ref([]) as Ref<Order[]>;
    const events = ref([]);
    const addNoiseToPrice = ref(true);
    const noiseMax = ref(50)
    const noiseMin = ref(1)

    const availableExchanges = ref(["bitflyer"])

    function getActiveOrder(price, side) {
        return activeOrders.value.filter(x => x.price == price && x.side == side)
    }

    function popActiveOrder(id) {
        activeOrders.value = activeOrders.value.filter(x => x.id != id)
    }
    async function marketOrder(side, siz=null) {
        const resp = await $fetch(
            "/api/market",
            {
                method: "POST",
                body: {
                    "symbol": symbol.value,
                    "side": side,
                    "size": siz || size.value,
                    "exchange": exchange.value
                }
            }
        )
    }
    async function limitOrder(price, side, siz=null) {
        let p = parseInt(price)
        if (addNoiseToPrice.value) {
            if (side.toLowerCase() == "buy") {
                p = p - randInt(noiseMax.value, noiseMin.value)
            } else {
                p = p + randInt(noiseMax.value, noiseMin.value)
            }
        }
        const resp = await $fetch(
            "/api/limit",
            {
                method: "POST",
                body: {
                    "symbol": symbol.value,
                    "side": side,
                    "size": siz || size.value,
                    "price": p,
                    "exchange": exchange.value,
                }
            }
        )

        console.log(resp)
        activeOrders.value.push({
            "price": price,
            "side": side,
            "size": size.value,
            "id": resp.id
        });
    }

    async function bestLimitOrder(side) {
        const bookStore = useBookStore();

        if (["BUY", "BOTH"].includes(side)) {
            await limitOrder(bookStore.best.bid.price, "BUY")
        }

        if (["SELL", "BOTH"].includes(side)) {
            await limitOrder(bookStore.best.ask.price, "SELL")
        }
    }

    async function closePositionOrder(){
        if (position.value['size'] == 0){
            return
        }
        const closeSide = position.value['side'].toLowerCase() == 'buy'? 'SELL': 'BUY'
        return await marketOrder(closeSide, position.value['size'])
    }

    async function cancelOrder(id) {
        const resp = await $fetch(
            "/api/cancel",
            {
                method: "POST",
                body: {
                    symbol: symbol.value,
                    id: id
                }
            }
        )
        activeOrders.value = activeOrders.value.filter(x => x.id != id)
    }

    async function cancelOrderAll(side: string = null) {
        let orders = activeOrders.value;
        if (side != null) {
            orders = orders.filter(x => x.side.toLowerCase() == side.toLowerCase());
        }
        orders.map(x => cancelOrder(x.id));
    }

    function updatePosition(d: Position) {
        const ltp = useTradeStore().ltp
        if (d["side"] == "BUY") {
            d["pnl"] = Math.round((ltp - d["price"]) * d["size"])
        } else {
            d["pnl"] = Math.round((d["price"] - ltp) * d["size"])

        }
        d["price"] = useBookStore().bucketize(d["price"])
        position.value = d
    }

    function updateEvent(e: Event) {
        if (e["name"] == "EXECUTION") {
            ElNotification({
                title: 'EXECUTION',
                message: e.orderId,
                type: 'success',
                duration: 3000
            })
            // TODO: 部分約定
            activeOrders.value
                .filter(x => x["id"] == e["orderId"])
                .map(o => popActiveOrder(o.id))
        }
        events.value.push(e)
    }

    const availableSymbols = computed(() => {
        return ["FX_BTC_JPY", "BTC_JPY"]
    })

    return {
        symbol,
        size,
        exchange,
        position,
        activeOrders,
        availableExchanges,

        getActiveOrder,
        marketOrder,
        limitOrder,
        bestLimitOrder,
        closePositionOrder,
        cancelOrder,
        cancelOrderAll,
        updatePosition,
        updateEvent,

        availableSymbols
    }
})
