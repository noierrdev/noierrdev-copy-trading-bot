const { Keypair, Connection } = require("@solana/web3.js");
const { pumpfunSwapTransactionFasterWallet } = require("./swap");

require("dotenv").config();
const connection=new Connection(process.env.RPC_API)
const PRIVATE_KEY =new  Uint8Array(JSON.parse(process.env.PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(PRIVATE_KEY);

setTimeout(async () => {
    await pumpfunSwapTransactionFasterWallet(connection,wallet,"9Z79XWVNpGKnaQ4Tiv5KWQFEhrC1g8SCyoLr44UBkKX",0.001,false)
}, 0);