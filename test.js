const { Keypair, Connection, PublicKey } = require("@solana/web3.js");
const { pumpfunSwapTransactionFasterWallet, pumpfunSwapTransactionFasterWalletToken, swapPumpfunFasterWallet, swapPumpfunFasterWalletStaked, pumpfunSwapTransactionFasterWalletStaked, pumpfunSwapTransactionFasterWalletTokenStaked } = require("./swap");
const { getAssociatedTokenAddressSync } = require("@solana/spl-token");

require("dotenv").config();
const connection=new Connection(process.env.RPC_API)
const stakedConnection=new Connection(process.env.STAKED_RPC)
const PRIVATE_KEY =new  Uint8Array(JSON.parse(process.env.PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(PRIVATE_KEY);

const targetToken="2WwUfbtxoQdaf9W7CSs5BmSXaFBRUvMsufHC566upump"
const bondingCurve="5P3gR9zAujZyDwyxYMa3QUfXpQAW5ZeXKJmM7aKRC2MK"
const bondingCurveVault="2xTpNUhJdsm29CaCQWufb3kE1AiyvWiHB1J6Sc7AqL9V"

setTimeout(async () => {
    // await pumpfunSwapTransactionFasterWalletStaked(connection,stakedConnection,wallet,targetToken,0.001,false)
    await swapPumpfunFasterWalletStaked(connection,stakedConnection,wallet,targetToken,bondingCurve,bondingCurveVault,10000,false)
    // await swapPumpfunFasterWallet(connection,wallet,targetToken,bondingCurve,bondingCurveVault,100,false)
    const tokenAccount=getAssociatedTokenAddressSync(new PublicKey(targetToken),wallet.publicKey);
    var intervalId=setInterval(async () => {
        try {
            const tokenBalance=await connection.getTokenAccountBalance(tokenAccount);
            console.log(tokenBalance.value.amount)
            clearInterval(intervalId)
        } catch (error) {
            console.log(error)
        }
        
    }, 500);
}, 0);