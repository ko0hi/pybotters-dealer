export function roundBy(x, roundby){
    return Math.round(x / roundby) * roundby
}


export function randInt(max: number, min: number){
    return Math.floor(Math.random() * (max - min + 1)) + min
}
