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

- 黄の実線：仲値
- 緑・赤の点線：最新歩値と売買方向（緑が買・赤が売）
- 緑・赤の実線：指値とポジション（数字が右端に出ているものが指値・中央に出ているものがポジション）
- チャートクリックで注文：仲値より上で売・下で買
- 注文の実践をクリックで取消（同じ価格帯での注文は一つしか出せない）
- 右上のボタン：チャートの上限・下限をリフレッシュ
- その他注文ボタン：成行・最良気配・一斉取消・ポジション解消

#### どこかにdeployしといてくれないの？
シークレットキーを必要とするので、使用者の安全のためそういった措置は考えていません。

#### 注意は？
- 注文状態・ポジション状態は厳密に管理していませんので、必ず公式のツールと併用して意図せぬ注文・ポジションに注意してください
- 仲値より上で売・下で買という仕様上、仲値近辺はクリック箇所の判定により意図せぬ方向の注文が入ることがあります
- 個人で遊ぶようですので見にくい・使いにくいUIが多々ありますが、ご了承ください

## ライセンス
MIT

自己責任でご使用ください。
