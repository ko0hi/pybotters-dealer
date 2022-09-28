import {readBody} from "h3";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    return await $fetch(
        process.env.FASTAPI_URL + "/limit", {
            method: "POST",
            body:  body
        })
})
