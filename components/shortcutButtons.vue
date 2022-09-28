<script lang="ts" setup>
import {useBookStore} from "~/store/bookStore";
import {Refresh, Delete, Close} from "@element-plus/icons-vue";
import {useDealerStore} from "~/store/dealerStore";

const bookStore = useBookStore()
const dealerStore = useDealerStore()
</script>

<template>
  <el-space>
      <el-button @click="bookStore.updateClip"
                 :disabled="!bookStore.isClipUpdatable"
                 :icon="Refresh"
                 circle
      ></el-button>
      <span> Refresh chart</span>
<!--    <el-button @click="dealerStore.cancelOrderAll()"-->
<!--               :icon="Delete"-->
<!--               circle-->

<!--    ></el-button>-->
<!--    <el-button @click="dealerStore.closePositionOder()"-->
<!--      :icon="Close"-->
<!--               circle-->
<!--    ></el-button>-->
  </el-space>

</template>



<style scoped>

</style>
