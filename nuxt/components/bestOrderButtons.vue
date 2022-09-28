<script lang="ts" setup>

import {useDealerStore} from "~/store/dealerStore";
import {useBookStore} from "~/store/bookStore";
const dealerStore = useDealerStore();
const bookStore = useBookStore();
</script>

<template>
  <el-row>
    <el-col :span="12">
    <el-button @click="dealerStore.bestLimitOrder('BUY')" type="success">BUY
    </el-button>
    </el-col>
    <el-col :span="12">
    <el-button @click="dealerStore.bestLimitOrder('SELL')" type="danger">SELL
    </el-button>
    </el-col>
  </el-row>
  <el-row>
    <el-col>
      <el-button @click="dealerStore.bestLimitOrder('BOTH')" >BOTH</el-button>
    </el-col>
  </el-row>
</template>


<style scoped>
.el-tag {
  margin: 0px 10px 0px 0px;
}

.el-row {
  justify-content: center;
  margin: 10px 0px 0px 0px;
}

.el-col .el-button {
  width: 100%;
}
</style>
