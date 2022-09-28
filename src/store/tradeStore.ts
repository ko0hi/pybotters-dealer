import {defineStore} from "pinia";
import {roundBy} from "~/composables/utils";
import {Ref} from "@vue/reactivity";
import {computed} from "#imports";
import {useBookStore} from "~/store/bookStore";

interface TradeItem {
    side: string
    price: number
    size: number
    timestamp?: string
}

export const useTradeStore = defineStore('tradeStore', () =>{
    const buyVolumes = ref({});
    const sellVolumes = ref({});
    const history = ref([]) as Ref<TradeItem[]>
    const historyLength = ref(500);

    function update(item: TradeItem){
        if (bucket.value == null) {
            throw Error("Missing bucket")
        }

        const n = history.value.length;

        if (n > historyLength.value){
            const h = history.value.shift()
            let vols = getVolumes(h.side);
            vols[roundBy(h.price, bucket.value)] -= h.size;
        }

        const bucketPrice = roundBy(item.price, bucket.value)
        let vols = getVolumes(item.side)
        vols[bucketPrice] = (vols[bucketPrice] || 0) + item.size

        if (ltp.value != item.price){
            history.value.push(item)
        }
    }

    function getHistory(i: number = 0){
        return history.value[Math.max(historyNum.value-i-1, 0)]
    }
    function getVolumes(side: string){
        return side.toLowerCase() == 'buy' ? buyVolumes.value : sellVolumes.value;
    }

    const historyNum = computed(() => {
        return history.value.length;
    })

    const lastTrade = computed(() => {
        return historyNum.value == 0 ? null : history.value[historyNum.value-1]
    })

    const ltp = computed(() => {
        return historyNum.value == 0 ? 0 : lastTrade.value.price;
    })

    const ltpDiff = computed( () => {
        return historyNum.value < 2 ? 0 : getHistory(0).price - getHistory(1).price
    })

    const bucket = computed(() => {
        return useBookStore().bucket;
    })

    return {buyVolumes, sellVolumes, history, ltp, ltpDiff, update, getHistory}
})
