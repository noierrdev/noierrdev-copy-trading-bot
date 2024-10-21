const { Keypair } = require("@solana/web3.js");

require("dotenv").config()

const PRIVATE_KEY = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY));

const wallet = Keypair.fromSecretKey(PRIVATE_KEY);

console.log(wallet.publicKey.toBase58())