const { Keypair, Connection, PublicKey } = require("@solana/web3.js");
const { pumpfunSwapTransactionFasterWallet, pumpfunSwapTransactionFasterWalletToken, swapPumpfunFasterWallet, swapPumpfunFasterWalletStaked, pumpfunSwapTransactionFasterWalletStaked, pumpfunSwapTransactionFasterWalletTokenStaked, swapTokenAccountsWalletTokenFaster, swapTokenAccountsWalletFaster } = require("./swap");
const { getAssociatedTokenAddressSync } = require("@solana/spl-token");

require("dotenv").config();
const connection=new Connection(process.env.RPC_API)
const stakedConnection=new Connection(process.env.STAKED_RPC)
const PRIVATE_KEY =new  Uint8Array(JSON.parse(process.env.PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(PRIVATE_KEY);

const targetToken="3q9ww3C9AP2Jrq5JcS38oRDAqjrehZo3HXehThjupump"
const bondingCurve="5P3gR9zAujZyDwyxYMa3QUfXpQAW5ZeXKJmM7aKRC2MK"
const bondingCurveVault="2xTpNUhJdsm29CaCQWufb3kE1AiyvWiHB1J6Sc7AqL9V"

const swapAccounts=[
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    '6XJGsowXsVwwUX5C8SJDPiQaBMhhu1rKGqVvk1fo75LF',
    '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    'CJJMzzuHGD9Jd8JezzoD71TqWvQesBD1UfMgTkH3o5wX',
    '9NJyDLp77ymAfLJE5XRqg6gFz3nzuV2AxnuAeKKAF9Am',
    'D5UivoWz2AfRVjTNDxqpyChByZ88zfNbFgxir14b99U2',
    'C4MjLN4AuyinS5iBZbEVRKYgCWoxJYr6GGb1oM9JPKDn',
    'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',
    '66W6gXrcp6G21QXf5QSQAgwtkZvB3aNzB4Xcy9wCJMwp',
    '6vuZdUp8NqiBhbg5qgA815TT1VWuWBGZtbqnshFtr6ku',
    'ELEsiH6jjvMUefPbU9y8UNC63M8bCbQwR1fx9QFZh8Vk',
    'HrwcVPHzAQGuagS81JFX7ToEUwkcAenzc11XstmUsbNn',
    'ENLJTUyY35wdnWcDMj95FrV4u9Mae99t9TMWS3JfzYDF',
    '2ZziidB4Xb7x73EhMeSj8amF7de99KwJZ6SrGs5Jyiig',
    'B7np8tyqeE3vsNmMiWDnGSTQPHPeDrqqMTpSCxW5xhrS',
    'B7Hsk4qRWGcBRNSi9MRUtHyqf3U7uhswQN6afGE8kG8T',
    'GGA4Eme5cHsTBEfg5mg3igMWMquF2WAwXtGVaFYtRGkb',
    '5iywveQKkidqPDKt2CExJcWKex2EXz9kbGcYiZvhuXWs'
  ]
  

setTimeout(async () => {
    await swapTokenAccountsWalletFaster(connection,stakedConnection,wallet,targetToken,swapAccounts,0.001,false)
}, 0);