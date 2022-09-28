import {defineStore} from "pinia";
import {useBookStore} from "~/store/bookStore";
import {useTradeStore} from "~/store/tradeStore";
import {useDealerStore} from "~/store/dealerStore";

export const useSocketStore = defineStore('socketStore', () => {
    const ws = ref(null);
    const pips = ref(100);
    const lower = ref(2000000);
    const upper = ref(3000000);
    const isReady = ref(false);

    const bookStore = useBookStore();
    const tradeStore = useTradeStore();
    const dealerStore = useDealerStore();

    async function connect() {
        if (ws.value != null) {
            ws.value.close()
            isReady.value = false;
        }

        ws.value = new WebSocket(
            `ws://localhost:8000/ws?pips=${pips.value}&lower=${lower.value}&upper=${upper.value}&symbol=${dealerStore.symbol}&exchange=${dealerStore.exchange}`
        )

        ws.value.onmessage = async function (e) {
            const d = JSON.parse(e.data)
            if (d.channel == "book") {
                bookStore.$patch({
                    book: d.book,
                    mid1: d.mid,
                    best: d.best
                })
                bookStore.getBook();
                isReady.value = true;
            } else if (d.channel == "trade") {
                tradeStore.update(d);

                if ((tradeStore.ltp > bookStore.clipUpper) || (tradeStore.ltp <
                    bookStore.clipLower)) {
                    bookStore.updateClip()
                }
            } else if (d.channel == "position") {
                dealerStore.updatePosition(d)
            } else if (d.channel == "event") {
                dealerStore.updateEvent(d);
            }
        }
    }

    return {isReady, connect}
})
