<script lang="ts" setup>
import {useBookStore} from "~/store/bookStore";

const bookStore = useBookStore()
</script>

<template>
  <el-row :gutter="12">
    <el-tag type="success">Ask: {{bookStore.best.ask.price}}</el-tag>
    <el-tag type="info">{{bookStore.mid1}} | {{bookStore.spread}}</el-tag>
    <el-tag type="danger">{{bookStore.best.bid.price}} :Bid</el-tag>
  </el-row>
</template>


<style scoped>
.el-tag {
  margin: 0px 10px 0px 0px;
}
</style>
