import {defineStore} from "pinia";
import {computed, ref, roundBy, unref} from "#imports";
import {Ref} from "@vue/reactivity";
import {useDealerStore} from "~/store/dealerStore";


interface Item {
    price: number
    ask: number
    bid: number
}

interface PriceSize {
    price: number
    size: number
}

interface Best {
    ask: PriceSize
    bid: PriceSize
}


export const useBookStore = defineStore('bookStore', () => {
    const book = ref(null) as Ref<Item[]>
    const mid1 = ref(null)
    const nonZeroOnly = ref(false)
    const cachedGetBook = ref(null)
    const best = ref(null) as Ref<Best>


    const bucket = ref(100);
    const clip = ref(3000);

    const clipUpper = ref(null)
    const clipLower = ref(null)

    function getBook() {
        let rtnBook = unref(book);

        if (rtnBook == null) {
            return null
        }

        if (nonZeroOnly.value) {
            rtnBook = rtnBook.filter(
                x => x["ask"] > 0 || x["bid"] > 0 || x["price"] == mid.value)
        }

        if (clip.value != 0) {
            if (clipLower.value == null) {
                updateClip()
            }

            rtnBook = rtnBook.filter(
                x => (x["price"] < clipUpper.value && x["price"] > clipLower.value)
            )
        }

        if (bucket.value != 0) {
            let roundedBook: { [key: number]: Item } = {}

            rtnBook.map(x => {
                const bucketPrice = roundBy(x.price, bucket.value)
                // const bucket = Math.round((x.price / bucketSize.value)) * bucketSize.value
                if (!roundedBook.hasOwnProperty(bucketPrice)) {
                    roundedBook[bucketPrice] = {"price": 0, "ask": 0, "bid": 0}
                }
                roundedBook[bucketPrice]["price"] = bucketPrice
                roundedBook[bucketPrice]["ask"] += x.ask
                roundedBook[bucketPrice]["bid"] += x.bid
            })

            rtnBook = Object.keys(roundedBook).map(k => <Item>{
                price: roundedBook[k].price,
                ask: roundedBook[k].ask,
                bid: roundedBook[k].bid
            }).sort((lhs, rhs) => rhs["price"] - lhs["price"])
        }

        cachedGetBook.value = rtnBook

        return rtnBook;
    }

    function getClip(side: string): number {
        const base = bucketize(mid.value)
        if (side == "upper") {
            return base + clip.value
        } else {
            return base - clip.value
        }
    }
    function updateClip() {
        clipLower.value = getClip("lower")
        clipUpper.value = getClip("upper")
        // console.log("UPDATE CLIP", clipLower.value, clipUpper.value)
    }

    function clipPrice(x){
        return Math.max(Math.min(x, clipUpper.value), clipLower.value)
    }
    function isReady() {
        return this.book.value != null
    }

    function bucketize(x: number){
        return roundBy(x, bucket.value);
    }

    const mid = computed(() => {
        return bucketize(mid1.value)
    })

    const spread = computed(() => {
        return best.value.ask.price - best.value.bid.price
    })

    const prices = computed(() => {
        if (cachedGetBook.value == null) {
            getBook();
        }
        return cachedGetBook.value.map(x => x["price"])
    })

    const asks = computed(() => {
        if (cachedGetBook.value == null) {
            getBook();
        }
        return cachedGetBook.value.map(x => x["ask"])
    })

    const bids = computed(() => {
        if (cachedGetBook.value == null) {
            getBook();
        }
        return cachedGetBook.value.map(x => x["bid"])
    })

    const cumAsks = computed(() => {
        let cum = [];
        for (let i = asks.value.length-1; i >= 0; --i){
            cum[i] = asks.value[i] + cum[i+1] || 0;
        }

        return cum
    })

    const cumBids = computed(() => {
        return bids.value.map((sum => value => sum += value)(0))
    })

    const curBook = computed(() => {
        const curBook = getBook()
        return {
            "prices": curBook.map(x => x["price"]),
            "asks": curBook.map(x => x["asks"]),
            "bids": curBook.map(x => x["bids"])
        }
    })

    const isClipUpdatable = computed(() => {
        return getClip("upper") != clipUpper.value;
    })

    return {
        book,
        mid,
        mid1,
        best,
        bucket,
        spread,
        clip,
        clipUpper,
        clipLower,
        cachedGetBook,
        prices,
        asks,
        bids,
        cumAsks,
        cumBids,
        curBook,
        isClipUpdatable,
        getBook,
        updateClip,
        clipPrice,
        bucketize,
        isReady,
    }
})
