<script lang="ts" setup>
import {useDealerStore} from "~/store/dealerStore";

const dealerStore = useDealerStore();

</script>

<template>
    <el-row>
      <el-col :span="12">
        <el-button @click="dealerStore.cancelOrderAll('BUY')" type="success">BUY
        </el-button>
      </el-col>
      <el-col :span="12">
        <el-button @click="dealerStore.cancelOrderAll('SELL')"
                   type="danger">SELL
        </el-button>
      </el-col>
    </el-row>
  <el-row>
    <el-col :span="24">
      <el-button @click="dealerStore.cancelOrderAll()">BOTH</el-button>
    </el-col>
  </el-row>
<!--    <el-button @click="dealerStore.cancelOrderAll()">ALL</el-button>-->
<!--    <el-button @click="dealerStore.cancelOrderAll('BUY')" type="success">-->
<!--      BUY-->
<!--    </el-button>-->
<!--    <el-button @click="dealerStore.cancelOrderAll('SELL')" type="danger">-->
<!--      SELL-->
<!--    </el-button>-->
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
