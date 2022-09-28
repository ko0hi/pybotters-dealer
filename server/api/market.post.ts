import {readBody} from "h3";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const res = await $fetch(
        process.env.FASTAPI_URL + "/market", {
            method: "POST",
            body:  body
        })
    return res
})
