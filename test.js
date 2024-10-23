const { pumpfunSwapTransactionFaster, pumpfunSwapTransaction } = require("./swap");

setTimeout(async () => {
    await pumpfunSwapTransaction("9Lzee8WAod9FA37gSTqj6DKYPaJwebtFMorgYr5vUY1A",0.01,false)
}, 0);