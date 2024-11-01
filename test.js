const { Keypair, Connection } = require("@solana/web3.js");
const { pumpfunSwapTransactionFasterWallet, pumpfunSwapTransactionFasterWalletToken, swapPumpfunFasterWallet, swapPumpfunFasterWalletStaked } = require("./swap");

require("dotenv").config();
const connection=new Connection(process.env.RPC_API)
const stakedConnection=new Connection(process.env.STAKED_RPC)
const PRIVATE_KEY =new  Uint8Array(JSON.parse(process.env.PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(PRIVATE_KEY);

const targetToken="9Z79XWVNpGKnaQ4Tiv5KWQFEhrC1g8SCyoLr44UBkKX"
const bondingCurve="3mm3P9fC899FzM5BQrt5SQRyMZD5aeFS9ywxUDMLW4cK"
const bondingCurveVault="5masFP6hcRRaqYp92pGkGi8zQj1WSxXZj9iVg8vP1kcT"

setTimeout(async () => {
    // await pumpfunSwapTransactionFasterWalletToken(connection,wallet,"4RXLAJQHhznjNaa4Auep3u1rA5XeKz4Ht2KWVf8ku2NK",100000,true)
    await swapPumpfunFasterWalletStaked(connection,stakedConnection,wallet,targetToken,bondingCurve,bondingCurveVault,100,false)
    // await swapPumpfunFasterWallet(connection,wallet,targetToken,bondingCurve,bondingCurveVault,100,false)
}, 0);