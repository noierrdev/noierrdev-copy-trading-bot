const { Keypair, Connection, PublicKey } = require("@solana/web3.js");
const { pumpfunSwapTransactionFasterWallet, pumpfunSwapTransactionFasterWalletToken, swapPumpfunFasterWallet, swapPumpfunFasterWalletStaked, pumpfunSwapTransactionFasterWalletStaked, pumpfunSwapTransactionFasterWalletTokenStaked, swapTokenAccountsWalletTokenFaster, swapTokenAccountsWalletFaster, swapPumpfunWalletFastest } = require("./swap");
const { getAssociatedTokenAddressSync } = require("@solana/spl-token");

require("dotenv").config();
const connection=new Connection(process.env.RPC_API)
const stakedConnection=new Connection(process.env.STAKED_RPC)
const PRIVATE_KEY =new  Uint8Array(JSON.parse(process.env.PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(PRIVATE_KEY);

const targetToken="88FVZ1edJnoW8F2wryd4JjytmLCPmtR3dLrnnX9ipump"
const bondingCurve="Dh4m1KqRai2ZrY6pCL3ihPsQrnHWqzYbcMQRNc6hJ2mZ"
const bondingCurveVault="3mmFiZtkhReGxt1deByUVRQ3QowF9ukDBmvwAMU3kdcs"

const swapAccounts=[
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    'AThyA5TtVh9db1JrfSPzcKo5MgEhC9F9qz4qCZn9UqeW',
    '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    '7ArCGa3T8LJrHA9p97MbTTxggtFgWt74BiX83i43VFGF',
    '7UH9NVCMg983WFDwgr6noXz6927LRzZS8L5pKeHoccEj',
    'Hb4qeWdG5682fQmnsNqSXPNNJjRUWhW3eaEjshF2GBiP',
    '97FwinAgF2uRBx9qCrFaii7rekE6RRvZ824TGbtXLbEB',
    'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',
    'FL3vhMrYK9CpbaKGPfBAjeUqESRKevfA85k1bhi8Q5T4',
    'ATs893NSapYD8mBcXet6CouYLRumFvH8iSUQkwbbXAfs',
    'BMExySinZKhox2CdUcrw4KBQxiL1ekPtKfb9FE11jfFY',
    '2tCCawzwcWPDetWR2zt8oEJ8AeKcQnPZahjd2FcvKhxv',
    'E9LNNj7ZC2Bs38UvLUWfXNWxaBMqkFPuw4SQHeGMMXJe',
    '9MHDxuM3yw9NR3ELZDoo3Ybs33wV8aSxRfQaSwzaqXw3',
    '6mPRNMKcVMBp6xVFQSigWmvxZ8HAGpCWPALCLBJ6yqo9',
    'GGA4Eme5cHsTBEfg5mg3igMWMquF2WAwXtGVaFYtRGkb',
    '9qJSGD6Zku66EsBkfQrXi8mp4pTtHLXxsf7PgkBfQc9T',
    '5iywveQKkidqPDKt2CExJcWKex2EXz9kbGcYiZvhuXWs'
  ]
  
  

setTimeout(async () => {
    await swapPumpfunWalletFastest(connection,stakedConnection,wallet,targetToken,bondingCurve,bondingCurveVault,1000,true)
}, 0);