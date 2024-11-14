const { Keypair, Connection } = require("@solana/web3.js");
const { pumpfunSwapTransactionFasterWallet, pumpfunSwapTransactionFasterWalletToken, swapPumpfunFasterWallet, swapPumpfunFasterWalletStaked, pumpfunSwapTransactionFasterWalletStaked } = require("./swap");

require("dotenv").config();
const connection=new Connection(process.env.RPC_API)
const stakedConnection=new Connection(process.env.STAKED_RPC)
const PRIVATE_KEY =new  Uint8Array(JSON.parse(process.env.PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(PRIVATE_KEY);

const targetToken="CVrL6nvTt3KS8KSQo1SrXtqdjDdDW23XDz6bEXkxpump"
const bondingCurve="3mm3P9fC899FzM5BQrt5SQRyMZD5aeFS9ywxUDMLW4cK"
const bondingCurveVault="5masFP6hcRRaqYp92pGkGi8zQj1WSxXZj9iVg8vP1kcT"

setTimeout(async () => {
    await pumpfunSwapTransactionFasterWalletStaked(connection,stakedConnection,wallet,"2WwUfbtxoQdaf9W7CSs5BmSXaFBRUvMsufHC566upump",0.001,false)
    // await swapPumpfunFasterWalletStaked(connection,stakedConnection,wallet,targetToken,bondingCurve,bondingCurveVault,100,false)
    // await swapPumpfunFasterWallet(connection,wallet,targetToken,bondingCurve,bondingCurveVault,100,false)
}, 0);