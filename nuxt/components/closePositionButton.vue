<script lang="ts" setup>
import {useDealerStore} from "~/store/dealerStore";
import {computed} from "#imports";

const dealerStore = useDealerStore();
const hasPosition = computed(() => {
  return dealerStore.position["size"] > 0
})

</script>

<template>
  <el-row>
    <el-col>
      <el-button @click="dealerStore.closePositionOrder"
                 type="warning"
                 :disabled="!hasPosition">CLOSE POSITION
      </el-button>
    </el-col>
  </el-row>
</template>



<style scoped>.el-row {
  justify-content: center;
  margin: 10px 0px 0px 0px;
}

.el-col .el-button {
  width: 100%;
}

</style>
