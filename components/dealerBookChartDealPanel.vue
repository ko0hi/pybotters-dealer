<script lang="ts" setup>
import {useBookStore} from "~/store/bookStore";

const bookStore = useBookStore();
</script>

<template>
  <h4>Deal Panel</h4>
  <dealer-form></dealer-form>
  <p>Market Order</p>
  <market-order-buttons></market-order-buttons>
  <el-row>
    <el-col :span="6">
    <p>Best Order</p>

    </el-col>
    <el-col :span="18">
      <el-tag type="success">Ask: {{bookStore.best.ask.price}}</el-tag>
      <el-tag type="info">{{bookStore.mid1}} | {{bookStore.spread}}</el-tag>
      <el-tag type="danger">{{bookStore.best.bid.price}} :Bid</el-tag>
    </el-col>
  </el-row>
  <best-order-buttons></best-order-buttons>
  <p>Cancel Order</p>
  <cancel-order-buttons></cancel-order-buttons>
  <p>Close Position Order</p>
  <close-position-button></close-position-button>
</template>

<style scoped>
.el-tag {
  margin: 0px 10px 0px 0px;
}

.el-row {
  justify-content: center;
  margin: 10px 0px 0px 0px;
  align-items: center;
}

.el-col .el-button {
  width: 100%;
}
</style>

