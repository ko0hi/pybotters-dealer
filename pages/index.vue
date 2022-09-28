<script lang="ts" setup>
import {useBookStore} from "~/store/bookStore";
import {onMounted} from "#imports";
import {useDealerStore} from "~/store/dealerStore";
import {useSocketStore} from "~/store/socketStore";

const bookStore = useBookStore();
const dealerStore = useDealerStore();
const socketStore = useSocketStore();

onMounted(async () => {await socketStore.connect()})

</script>

<template>
  <div>
    <el-row>
      <h1>pybotters dealer</h1>
    </el-row>
    <el-container class="dealer-container"
                  v-loading="!socketStore.isReady"
                  element-loading-text="Connecting">
      <el-space direction="vertical">

        <dealer-book-chart v-if="socketStore.isReady"></dealer-book-chart>
      </el-space>
    </el-container>
  </div>

</template>


<style scoped>
.el-row {
  justify-content: center;
  align-items: center;
  margin: 20px 20px 20px 20px;
}

.el-radio {
  margin: 10px;
}

.dealer-container {
  justify-content: center;
}


</style>
