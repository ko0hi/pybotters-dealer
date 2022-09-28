# pybotters-dealer

![](img/sample.gif)

## 使い方

このレポジトリをクローン

```bash
git clone https://github.com/ko0hi/pybotters-dealer.git --recursive
```

`apis.json`にキーを記入

```json
{
  
  "bitflyer": [
    "xxx",  # API key
    "xxx"   # Secret key
  ]
}
```

### dockerで動かす場合

```bash
docker-compose up -d
```

[https://localhost:3000]()にアクセス 

注意
- 立ち上がりまで数分かかる場合があります
  - コンソールにURLが表示されて、`Nitro build in ...Vite client ...`という文言が出てきたらもうすぐです
- 注文レスポンスがホストで動かす場合（後述）よりも遅いです
- 立ち上がりもホストで動かした場合の方が圧倒的に速いです


### ホストで動かす場合
1. python環境の構築（pyenvなど）とnode.jsのインストール

2. 依存ライブラリのインストール
```bash
pip install -r python/requirements.txt
```

3. バックエンドサーバーの立ち上げ
```bash
# /YOUR/PATH/TO/pybotters-dealer/pythonで実行
cd python
PYBOTTERS_APIS=../apis.json python -m uvicorn python:server:app --port 0.0.0.0
```

4. フロントサーバーの立ち上げ
```bash
cd ../nuxt
yarn
export FASTAPI_URL=http://0.0.0.0:8000 && yarn dev
```
（バックエンドサーバーも立ち上げ続けるために別のターミナルから実行する）

5. [https://localhost:3000]() にアクセス


## QA

#### bitflyer以外は？
未実装です。一応拡張も視野にいれた作りにはしています。

#### python環境の構築の仕方教えて？
Anacondaとかpyenvで調べてください。

#### windows/linuxで動かないんだけど？
ホストOSはM1 Macでのみ動作確認しています。Dockerで動作させてください。

#### 操作の仕方は？
ゲームは説明書を見ずにやる派です。

## ライセンス
MIT

自己責任でご使用ください。
