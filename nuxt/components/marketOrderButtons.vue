<script lang="ts" setup>

import {useDealerStore} from "~/store/dealerStore";
const dealerStore = useDealerStore();
</script>

<template>
  <el-row>
    <el-col :span="12">
      <el-button @click="dealerStore.marketOrder('BUY')" type="success">BUY
      </el-button>
    </el-col>
    <el-col :span="12">
      <el-button @click="dealerStore.marketOrder('SELL')" type="danger">SELL
      </el-button>
    </el-col>
  </el-row>
</template>


<style scoped>
.el-row {
  justify-content: center;
  margin: 10px 0px 0px 0px;
}

.el-col .el-button {
  width: 100%;
}
</style>
