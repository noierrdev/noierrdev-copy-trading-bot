const { pumpfunSwapTransactionFaster, pumpfunSwapTransaction } = require("./swap");
const bs58=require("bs58")
const key="5mQUz7XSLeXpjWaojSSgyagGkYB5NqnGaoD5Up4ztRAUrhbnBjatd1tr8Sw88PWYbDuyyunPHdfmc3r8EWYaJ6Ho"
setTimeout(async () => {
    const myKey=await bs58.decode(key)
    console.log(JSON.stringify(myKey))
}, 0);