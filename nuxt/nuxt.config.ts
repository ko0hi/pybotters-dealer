// https://v3.nuxtjs.org/api/configuration/nuxt.config

const lifecycle = process.env.npm_lifecycle_event

export default defineNuxtConfig({
    css: ['~/assets/scss/elementPlus.scss'],

    modules: [
        '@pinia/nuxt'
    ],

    build: {
        transpile: lifecycle === 'build' ? ['element-plus'] : []
    },

    runtimeConfig: {
        public: {
            fastapiUrl: 'http://localhost:8000'
        }
    },


})
