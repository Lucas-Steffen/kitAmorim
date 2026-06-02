export function randomNumbersToCode(qtd = 6){
    const max = Math.pow(10, qtd)
    return Math.floor(Math.random() * max).toString().padStart(qtd, "0");
}