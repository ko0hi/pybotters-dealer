<script lang="ts" setup>
import {useDealerStore} from "~/store/dealerStore";
import {useSocketStore} from "~/store/socketStore";

const dealerStore = useDealerStore();
const socketStore = useSocketStore();

</script>

<template>
  <div>
    <el-form
        label-position="left"
        label-width="100px"
    >
      <el-form-item label="Exchange">
        <el-select v-model="dealerStore.exchange">
          <el-option v-for="e in dealerStore.availableExchanges"
                     :key="e" :label="e" :value="e"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Symbol">
        <el-select v-model="dealerStore.symbol">
          <el-option v-for="s in dealerStore.availableSymbols"
            :key="s" :label="s" :value="s"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Lot">
        <el-input-number v-model="dealerStore.size"
                         step="0.01"></el-input-number>
      </el-form-item>
    </el-form>
    <el-row justify="center">
      <el-button @click="socketStore.connect"> Reconnect </el-button>
    </el-row>
  </div>
</template>


<style scoped>

</style>
