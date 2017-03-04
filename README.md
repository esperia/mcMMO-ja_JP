# mcMMO-ja\_JP
mcMMO localization project for Japanese.

この翻訳プロジェクトは [MinecraftDay Server](https://minecraft.jp/servers/00mc.8x9.jp) でゲームを楽しんだユーザーが、気になった英語を順次翻訳し、それをmcMMOリポジトリに還元するものです。



## 翻訳に参加するには？

基本的には、本リポジトリへのPull Requestを頂ければ、反映致します。

もしくは、MinecraftDayのメインユーザーとなって頂ければ、メイン翻訳にご参加いただけます。



## How to build

```sh
# Clone repositories
git clone git@github.com:esperia/mcMMO-ja_JP.git
git submodule update --init

# Install dependencies
npm install

# Fetch translated data from MinecraftDay Wiki
npm start fetch

# Check to match keys between en_US and ja_JP
npm start match-keys

# Replace ja_JP in mcMMO
npm start build
```




