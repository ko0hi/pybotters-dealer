<script lang='ts' setup>
interface Status {
  size: number
  price: number
  pnl: number
}

const props = defineProps<{ status: Status }>()
</script>

<template>
  <el-row justify="space-around">
    <el-col :span="6">
      <h4>Price</h4>
      <p>{{ props.status.price }}</p>
    </el-col>
    <el-col :span="6">
      <h4>PnL</h4>
      <p>{{ props.status.pnl }}</p>
    </el-col>
    <el-col :span="6">
      <h4>Size</h4>
      <p>{{ Math.fround(props.status.size) }}</p>
    </el-col>
  </el-row>
</template>


<style scoped>
.el-card {
  font-size: 12px
}

</style>
