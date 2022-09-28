import pybotters
import json
from fastapi import FastAPI, WebSocket

import utils


app = FastAPI()
server: utils.DealerServer = None


@app.post("/market")
async def market(item: utils.MarketOrder):
    return {"id": await server.market(item)}


@app.post("/limit")
async def limit(item: utils.LimitOrder):
    return {"id": await server.limit(item)}


@app.post("/cancel")
async def cancel(item: utils.CancelOrder):
    return await server.cancel(item)


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    pips: int = 500,
    lower: int = 2700000,
    upper: int = 2800000,
    symbol="FX_BTC_JPY",
    exchange="bitflyer"
):
    await websocket.accept()

    async with pybotters.Client() as client:
        global server
        server = await utils.DealerServer.build(exchange, client, symbol, pips,
        lower, upper)

        while True:
            item = await server.get()
            try:
                await websocket.send_text(json.dumps(item))
            except ConnectionError as e:
                server.stop()
                server = None


