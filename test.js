const { Keypair } = require("@solana/web3.js");

require("dotenv").config();

const PRIVATE_KEY =new  Uint8Array(JSON.parse(process.env.PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(PRIVATE_KEY);

console.log(wallet.publicKey.toBase58())