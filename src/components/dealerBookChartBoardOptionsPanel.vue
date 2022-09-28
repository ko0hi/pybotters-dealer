<script lang="ts" setup>
import {useBookChartStore} from "~/store/bookChartStore";
import {Refresh} from "@element-plus/icons-vue"
import {useBookStore} from "~/store/bookStore";

const optionStore = useBookChartStore();
const bookStore = useBookStore()

</script>

<template>
  <h4>Board Options</h4>
    <el-form
        label-position="left"
        label-width="100px"
    >
      <el-form-item label="XMAX">
        <el-radio-group v-model="optionStore.xMax"
                        v-for="p in optionStore.xMaxs"
                        :key="p">
          <el-radio :label="p"> {{ p }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="BUCKET">
        <el-radio-group v-model="bookStore.bucket"
                        v-for="b in optionStore.buckets"
                        :key="b">
          <el-radio :label="b"> {{ b }}</el-radio>
        </el-radio-group>

      </el-form-item>
      <el-form-item label="CLIP">
        <el-radio-group v-model="bookStore.clip" v-for="c in optionStore.clips"
                        :key="c" @change="bookStore.updateClip">
          <el-radio :label="c">{{ c }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
</template>

<style>
.el-radio {
  margin: 0 10px 0 10px;
}

</style>
