require("dotenv").config()

const {Connection, PublicKey, Keypair}=require("@solana/web3.js")
const fs=require('fs')
const path=require('path')
const WebSocket = require('ws');
const { pumpfunSwapTransactionFaster, swapTokenAccounts, swapPumpfunFaster, swapTokenFastest } = require("./swap");
const { getAssociatedTokenAddressSync } = require("@solana/spl-token");

const {Bot,Context,session}=require("grammy");
const { getSwapMarket, getSwapMarketFaster } = require("./utils");

const wallets=fs.readdirSync(path.resolve(__dirname,"wallets"));
console.log(wallets)

const connection=new Connection(process.env.RPC_API);

const PUMPFUN_RAYDIUM_MIGRATION="39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg"
const RAYDIUM_OPENBOOK_AMM="675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
const PUMPFUN_BONDINGCURVE="6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
const SOL_MINT_ADDRESS = 'So11111111111111111111111111111111111111112';
const RAYDIUM_AUTHORITY="5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1";
const BSD_CONTRACT="BSfD6SHZigAfDWSjzD5Q41jw8LmKwtmjskPH9XW1mrRW"

const PRIVATE_KEY =new  Uint8Array(JSON.parse(process.env.PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(PRIVATE_KEY);

// const bot = new Bot(process.env.TELEGRAM_TOKEN);
// bot.start()

function connectWebsocket(){
    var ws = new WebSocket(process.env.RPC_WEBSOCKET);
    function sendRequest(ws) {
        const request = {
            jsonrpc: "2.0",
            id: 420,
            method: "transactionSubscribe",
            params: [
                {   failed: false,
                    accountInclude:    wallets
                },
                {
                    commitment: "processed",
                    encoding: "jsonParsed",
                    transactionDetails: "full",
                    maxSupportedTransactionVersion: 0
                }
            ]
        };
        if(wallets.length==0) return;
        ws.send(JSON.stringify(request));
    }
    
    
    ws.on('open', function open() {
        console.log('WebSocket is open');
        sendRequest(ws);
    });
    
    ws.on('message', async function incoming(data) {
        const messageStr = data.toString('utf8');
        try {
            const messageObj = JSON.parse(messageStr);
    
            const result = messageObj.params.result;
            const logs = result.transaction.meta.logMessages;
            const signature = result.signature; // Extract the signature
            console.log(`https://solscan.io/tx/${signature}`)
            const accountKeys = result.transaction.transaction.message.accountKeys.map(ak => ak.pubkey);
            const signers=result.transaction.transaction.message.accountKeys.filter(ak=>ak.signer==true).map(ak=>ak.pubkey);

            const SOLBalanceChange=result.transaction.meta.postBalances[0]-result.transaction.meta.preBalances[0]
            console.log({SOLBalanceChange})
            const userPreWSOLBalance=result.transaction.meta.preTokenBalances.find(ba=>((ba.mint==SOL_MINT_ADDRESS)&&(ba.owner==signers[0])));
            const userPostWSOLBalance=result.transaction.meta.postTokenBalances.find(ba=>((ba.mint==SOL_MINT_ADDRESS)&&(ba.owner==signers[0])));
            const WSOLBalChange=userPostWSOLBalance?(userPostWSOLBalance.uiTokenAmount.uiAmount-(userPreWSOLBalance?userPreWSOLBalance.uiTokenAmount.uiAmount:0)):(0-userPreWSOLBalance?userPreWSOLBalance.uiTokenAmount.uiAmount:0);
            console.log({WSOLBalChange})
            const userPreTokenBalance=result.transaction.meta.preTokenBalances.find(ba=>((ba.mint!=SOL_MINT_ADDRESS)&&(ba.owner==signers[0])));
            const userPostTokenBalance=result.transaction.meta.postTokenBalances.find(ba=>((ba.mint!=SOL_MINT_ADDRESS)&&(ba.owner==signers[0])));
            console.log({userPreTokenBalance,userPostTokenBalance})

            if((!userPreTokenBalance)&&(!userPostTokenBalance)) {
                console.log("!!!!!===NOT SWAP TX===!!!!!");
                return;
            }
            
            const targetToken=userPreTokenBalance?userPreTokenBalance.mint:userPostTokenBalance.mint;
            console.log({targetToken})

            const userTokenBalanceChange=userPostTokenBalance?(userPostTokenBalance.uiTokenAmount.uiAmount-(userPreTokenBalance?userPreTokenBalance.uiTokenAmount.uiAmount:0)):(0-userPreTokenBalance?userPreTokenBalance.uiTokenAmount.uiAmount:0);
            console.log(userTokenBalanceChange)

            if(userTokenBalanceChange==0){
                console.log(":::!!!NOT SWAPPING!!!:::")
            }

            if(accountKeys.includes(RAYDIUM_OPENBOOK_AMM)){
                const swapInstruction=(result.transaction?.transaction.message.instructions).find(instruction =>instruction.programId==RAYDIUM_OPENBOOK_AMM);
                console.log(swapInstruction)
                if(swapInstruction){
                    if(userTokenBalanceChange>0){
                        console.log(`::::BUY:::::`)
                        await swapTokenAccounts(connection,targetToken,swapInstruction.accounts,0.06,false);
                        await bot.api.sendMessage(`noierrdevcopytrading_channel`,`<b>Raydium copied!</b>\n<code>${signers[0]}</code>\n<a href="https://solscan.io/tx/${signature}" >Photon</a>`,{parse_mode:"HTML",link_preview_options:{is_disabled:true}})
                    }else{
                        console.log(`::::SELL::::`);
                        await swapTokenAccounts(connection,targetToken,swapInstruction.accounts,0.06,true);
                    }
                }else{
                    const swapMarket=await getSwapMarketFaster(connection,targetToken);
                    if(userTokenBalanceChange>0){
                        console.log(`::::BUY:::::`)
                        await swapTokenFastest(connection,targetToken,swapMarket.poolKeys,0.06,false);
                        // await bot.api.sendMessage(`noierrdevcopytrading_channel`,`<b>Raydium copied!</b>\n<code>${signers[0]}</code>\n<a href="https://solscan.io/tx/${signature}" >Photon</a>`,{parse_mode:"HTML",link_preview_options:{is_disabled:true}})
                    }else{
                        console.log(`::::SELL::::`);
                        await swapTokenFastest(connection,targetToken,swapMarket.poolKeys,0.05,true)
                    }
                }
            }
            else if(accountKeys.includes(PUMPFUN_BONDINGCURVE)){
                if(userTokenBalanceChange>0){
                    console.log(`::::BUY:::::`)
                    const tokenToBuy=Math.floor(userTokenBalanceChange*((0.1*(10**9))/(0-SOLBalanceChange)))
                    await pumpfunSwapTransactionFaster(connection,targetToken,0.15,true);
                    // await bot.api.sendMessage(`noierrdevcopytrading_channel`,`<b>Pumpfun copied!</b>\n<code>${signers[0]}</code>\n<a href="https://solscan.io/tx/${signature}" >Photon</a>`,{parse_mode:"HTML",link_preview_options:{is_disabled:true}})
                }
                else {
                    console.log(`::::SELL:::::`)
                    await pumpfunSwapTransactionFaster(connection,targetToken,0.15,false);
                    
                }
                // var bondingCurve=null;
                // var bondingCurveVault=null;

                // if(accountKeys.includes(BSD_CONTRACT)){
                //     const swapInstruction=(result.transaction?.transaction.message.instructions).find(instruction =>instruction.programId==BSD_CONTRACT);
                //     console.log(swapInstruction)
                //     bondingCurve=swapInstruction.accounts[4];
                //     bondingCurveVault=swapInstruction.accounts[5];
                // }else{
                //     const swapInstruction=(result.transaction?.transaction.message.instructions).find(instruction =>instruction.programId==PUMPFUN_BONDINGCURVE);
                //     console.log(swapInstruction)
                //     bondingCurve=swapInstruction?.accounts[3];
                //     bondingCurveVault=swapInstruction?.accounts[4];
                // }
                // if(!bondingCurve||!bondingCurveVault){
                //     if(userTokenBalanceChange>0){
                //         console.log(`::::BUY:::::`)
                //     }
                //     else {
                //         console.log(`::::SELL:::::`)
                //     }
                //     return;
                // }
                // if(userTokenBalanceChange>0){
                //     console.log(`::::BUY:::::`)
                //     const tokenToBuy=Math.floor(userTokenBalanceChange*((0.01*(10**9))/(0-SOLBalanceChange)))
                //     await swapPumpfunFaster(connection,targetToken,bondingCurve,bondingCurveVault,tokenToBuy,true);
                    
                // }else{
                //     console.log(`::::SELL::::`);
                //     if((!userPostTokenBalance)||(userPostTokenBalance.uiTokenAmount.uiAmount==0)){
                //         await pumpfunSwapTransactionFaster(connection,targetToken,0.01,false);
                //     }else{
                //         const myTokenAccount=getAssociatedTokenAddressSync(new PublicKey(targetToken),wallet.publicKey);
                //         try {
                //             const myTokenBalance=await connection.getTokenAccountBalance(myTokenAccount);
                //             const tokenToSell=Number((myTokenBalance.value.uiAmount*(userTokenBalanceChange/userPreTokenBalance.uiTokenAmount.uiAmount)).toFixed(0));
                //             await swapPumpfunFaster(connection,targetToken,bondingCurve,bondingCurveVault,tokenToSell,false)
                //         } catch (error) {
                //             console.log(error)
                //             await pumpfunSwapTransactionFaster(connection,targetToken,0.01,false);
                //         }
                        
                //     }
                    
                // }
            }

            
        } catch (e) {
            console.log(e)
            console.log(messageStr)
        }
    });
    
    ws.on('error', function error(err) {
        console.error('WebSocket error:', err);
    });
    
    ws.on('close', function close() {
        console.log('WebSocket is closed');
        ws=null
        setTimeout(async () => {
            await connectWebsocket()
        }, 300);
        
    });
    setTimeout(() => {
        ws.close();
    }, 180000);
}

connectWebsocket()