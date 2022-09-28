import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "./pybotters-wrapper"))


from typing import Union

import asyncio
import pybotters
import numpy as np
import pandas as pd

import pybotters_wrapper as pbw

from pydantic import BaseModel


class MarketOrder(BaseModel):
    exchange: str
    symbol: str
    side: str
    size: float


class LimitOrder(BaseModel):
    exchange: str
    symbol: str
    side: str
    size: float
    price: Union[int, float]


class CancelOrder(BaseModel):
    symbol: str
    id: str


class DealerServer:
    """取引所間の差分吸収用のベースクラス。現状bitflyerしか実装していないのでbitflyerバイアスのかかっ
    た実装になってる可能性大。他の取引所に拡張するときに見直す。


    """

    def __init__(
        self,
        client: pybotters.Client,
        symbol: str,
        pips: int = 100,
        lower: int = 0,
        upper: int = 1000000,
    ):
        """

        :param client:
        :param symbol: 取引通過
        :param pips: 価格最小丸め単位
        :param lower: 価格下限
        :param upper: 価格上限
        """
        self._client = client

        self._symbol = symbol
        self._pips = pips
        self._lower = lower
        self._upper = upper

        # initializeメソッドで要初期化
        self._api = None
        self._store = None
        self._book = None

        self._queue: asyncio.Queue = None
        self._tasks: asyncio.Task = []

    def __del__(self):
        for t in self._tasks:
            t.cancel()

    async def initialize(self):
        await self._initialize()

        self._queue = asyncio.Queue()
        self._tasks = [
            asyncio.create_task(self._book_channel()),
            asyncio.create_task(self._trade_channel()),
            asyncio.create_task(self._event_channel()),
            asyncio.create_task(self._position_channel()),
        ]

    async def _initialize(self):
        raise NotImplementedError

    async def _book_channel(self) -> dict:
        """

        :return:  以下のメッセージを配信

        ```
            {
                # チャンネル名
                "channel": "book",
                # 板
                "book": [
                    {"price": 100, "ask": 0.1, "bid": 0},
                    {"price":  99, "ask": 0.2, "bid": 0},
                    ...
                    {"price": 1, "ask":0, "bid": 0.1},
                ],
                # 仲値
                "mid": 50,
                # 最良気配値
                "best": {
                    "ask": 51,
                    "bid": 49
                }
            }
        ```
        """
        while True:
            await self._book.store.wait()

            if self._book.mid is None:
                continue

            # best ask/bidを取ってくるためだけにpybottersの板ストアを使っている
            # Bookにその辺りも実装すればいいのだが横着している
            asks, bids = self._store.board.sorted().values()

            ask_prices, ask_sizes = self._book.asks(
                lower=self._lower, upper=self._upper, non_zero_only=False
            )
            bid_prices, bid_sizes = self._book.bids(
                lower=self._lower, upper=self._upper, non_zero_only=False
            )

            ask_prices = ask_prices[::-1]
            ask_sizes = ask_sizes[::-1]

            # pandas使って横着している
            # どうせ手動なのでそんなに速さいらんだろ、と。
            df = pd.DataFrame(
                np.hstack(
                    [
                        np.hstack(
                            [
                                ask_prices[:, np.newaxis],
                                ask_sizes[:, np.newaxis],
                                bid_sizes[:, np.newaxis],
                            ]
                        )
                    ]
                )
            )
            df.columns = ["price", "ask", "bid"]

            dic = {
                "channel": "book",
                "book": df.to_dict(orient="records"),
                "mid": self._book.mid,
                "best": {"ask": asks[0], "bid": bids[0]},
            }

            self._queue.put_nowait(dic)

    def _transform_trade_msg(self, msg: dict) -> dict:
        return msg

    async def _trade_channel(self):
        """取引配信チャンネル。

        :return: 以下のメッセージ （余分なものを含みうる）

        ```
            {
                "channel": "trade"
                "price": 10000
                "side": "BUY" or "ASK"
                "size": 0.01
            }
        ```
        """
        with self._store.trades.watch() as stream:
            async for msg in stream:
                if msg.operation == "insert":

                    self._queue.put_nowait(
                        # 念の為transform関数にはコピーを渡しておく
                        {"channel": "trade", **self._transform_trade_msg({**msg.data})}
                    )

    def _transform_event_msg(self, msg: dict) -> dict:
        return msg

    async def _event_channel(self):
        """イベント（注文とか約定とか）配信チャンネル。

        :param queue: メッセージ配信用のキュー
        :return: 以下のメッセージ （余分なものを含みうる）

        ```
            {
                "channel": "event",
                # 現状frontで使用しているのはEXECUTIONのみ
                "name": "EXECUTION", "ORDER", "CANCEL"
                "orderId": "xxxxxx"
            }

        ```

        """
        with self._store.events.watch() as stream:
            async for msg in stream:
                if msg.operation == "insert":
                    self._queue.put_nowait(
                        {"channel": "event", **self._transform_event_msg({**msg.data})}
                    )

    def _transform_position_msg(self, positions: list) -> dict:
        raise NotImplementedError

    async def _position_channel(self, interval=0.5) -> dict:
        """watchを使った実装と迷ったが、定期的にポジションの全情報を
        送った方が使い勝手いいだろうと思い、このようにした。
        ここだけ_transform_position_msgのoverrideが必須なことに注意。

        :param interval: メッセージ配信間隔
        :return: 以下のメッセージ

        ```
            {
                "channel": "position",
                "side": "BUY" or "SELL"
                "size": 0.1
                "price": 100000
            }
        ```
        """
        # dummy
        self._queue.put_nowait(
            {"channel": "position", "size": 0, "price": 0, "side": None}
        )

        while True:
            await asyncio.sleep(interval)
            positions = self._store.position.find()
            self._queue.put_nowait(self._transform_position_msg(positions))

    async def limit(self, item: LimitOrder) -> str:
        """

        :param item:
        :return: order id
        """
        raise NotImplementedError

    async def market(self, item: MarketOrder) -> str:
        """

        :param item:
        :return: order id
        """
        raise NotImplementedError

    async def cancel(self, item: CancelOrder) -> None:
        """

        :param item:
        :return:
        """
        raise NotImplementedError

    async def get(self):
        return await self._queue.get()

    @classmethod
    async def build(
        cls,
        exchange: str,
        client: pybotters.Client,
        symbol: str,
        pips: int = 100,
        lower: int = 0,
        upper: int = 1000000,
    ):
        if exchange == "bitflyer":
            server_cls = BitflyerServer
        else:
            raise RuntimeError(f"Unsupported exchange: {exchange}")

        server = server_cls(client, symbol, pips, lower, upper)
        await server.initialize()

        return server

    def stop(self):
        for t in self._tasks:
            t.cancel()



class BitflyerServer(DealerServer):
    async def _initialize(self):
        self._api = pbw.bitflyer.BitflyerAPI(self._client)
        self._store = pbw.bitflyer.BitflyerDataStoreWrapper()
        await self._store.connect(
            self._client,
            self._store.socket.all_channels(symbol=self._symbol),
            waits=["board"],
        )
        self._book = pbw.bitflyer.plugins.book(self._symbol, self._store, pips=self._pips)
        await self._book.initialize(self._client)

    def _transform_event_msg(self, msg):
        msg["name"] = msg["event_type"]
        if msg["event_type"] == "EXECUTION":
            msg["orderId"] = msg["child_order_acceptance_id"]
        return msg

    def _transform_position_msg(self, positions):
        agg = {"channel": "position", "size": 0, "price": 0, "side": None}
        for p in positions:
            agg["size"] += p["size"]
            agg["price"] += p["price"] * p["size"]
            agg["side"] = p["side"]

        if agg["price"]:
            agg["price"] = agg["price"] / agg["size"]
        return agg

    async def limit(self, item: LimitOrder) -> str:
        return await self._api.limit_order(
                item.symbol, item.side, item.size, item.price
            )

    async def market(self, item: MarketOrder):
        return await self._api.market_order(item.symbol, item.side, item.size)

    async def cancel(self, item: CancelOrder):
        await self._api.cancel_order(item.symbol, item.id)
