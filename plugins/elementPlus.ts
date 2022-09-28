// https://qiita.com/ddg171/items/0fd2bb72656126d7944e
import ElementPlus, {ID_INJECTION_KEY} from "element-plus";
import {defineNuxtPlugin} from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.provide(ID_INJECTION_KEY, {
        prefix: Math.random(), current: 0
    })
    nuxtApp.vueApp.use(ElementPlus)
})
