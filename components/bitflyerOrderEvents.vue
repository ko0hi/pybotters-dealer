<script setup lang="ts">
const props = defineProps<{
  orderEvents: {}[]
}>()

const tableRowClassName = ({
                             row,
                             rowIndex
                           }: { row: {}, rowIndex: number }) => {
  const et = row["event_type"]
  if (et === "ORDER") {
    return 'order_row'
  } else if (et === "CANCEL") {
    return 'cancel-row'
  } else {
    return 'execution-row'
  }
}
</script>

<template>
  <div>
    <el-table
        :data="orderEvents"
        :row-class-name="tableRowClassName"
        size="small"
        max-height="500"
        style="width: 1000px"
    >
      <el-table-column prop="event_type" label="Event"
                       align="center"></el-table-column>
      <el-table-column prop="child_order_acceptance_id" label="Order ID"
                       align="center"></el-table-column>
      <el-table-column prop="side" label="Side"
                       align="center"></el-table-column>
      <el-table-column prop="size" label="Size"
                       align="center"></el-table-column>
      <el-table-column prop="price" label="Price"
                       align="center"></el-table-column>
    </el-table>
  </div>
</template>



<style>

</style>
