require("dotenv").config()

const {Connection, PublicKey, Keypair}=require("@solana/web3.js")
const fs=require('fs')
const path=require('path')
const WebSocket = require('ws');
const { pumpfunSwapTransactionFaster, swapTokenAccounts, swapPumpfunFaster, swapTokenFastest, swapTokenFastestWallet, pumpfunSwapTransactionFasterWallet, swapTokenAccountsWallet, swapPumpfunFasterWallet, pumpfunSwapTransactionFasterWalletToken, pumpfunSwapTransactionFasterWalletStaked, swapPumpfunFasterWalletStaked, swapTokenAccountsWalletFaster, swapTokenAccountsWalletFasterPercent, swapPumpfunWalletFastest, swapPumpfunWalletFastestPercent, swapPumpfunWalletTokenFastest, swapTokenAccountsWalletTokenFaster } = require("./swap");
const { getAssociatedTokenAddressSync } = require("@solana/spl-token");

const { getSwapMarket, getSwapMarketFaster } = require("./utils");
const Client=require("@triton-one/yellowstone-grpc");
const bs58=require("bs58")



const connection=new Connection(process.env.RPC_API);
const stakedConnection=new Connection(process.env.STAKED_RPC)

const PUMPFUN_RAYDIUM_MIGRATION="39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg"
const RAYDIUM_OPENBOOK_AMM="675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
const PUMPFUN_BONDINGCURVE="6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
const SOL_MINT_ADDRESS = 'So11111111111111111111111111111111111111112';
const RAYDIUM_AUTHORITY="5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1";
//Some on-chain swap programs
const BSD_CONTRACT="BSfD6SHZigAfDWSjzD5Q41jw8LmKwtmjskPH9XW1mrRW"
const MINT_CONTRACT="minTcHYRLVPubRK8nt6sqe2ZpWrGDLQoNLipDJCGocY"

const PRIVATE_KEY =new  Uint8Array(JSON.parse(process.env.PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(PRIVATE_KEY);

console.log({wallet:wallet.publicKey.toBase58()})

//If not exist logs directory, create logs directory
if(!fs.existsSync(path.resolve(__dirname,"logs"))){
    fs.mkdirSync(path.resolve(__dirname,"logs"))
}

//If not exist wallets directory, create wallets directory
if(!fs.existsSync(path.resolve(__dirname,"wallets"))){
    fs.mkdirSync(path.resolve(__dirname,"wallets"))
}

var wallets=fs.readdirSync(path.resolve(__dirname,"wallets"));
console.log({wallets})


var logs=fs.readdirSync(path.resolve(__dirname,"logs"));

var allTrades={

}


//This functions is invoked recursively when grpc connection is closed or crashed.
//So that we dont have to restart bot when grpc is crashed...
function connectGeyser(){
    const client =new Client.default("http://127.0.0.1:10000/","",undefined);
    client.getVersion()
    .then(async version=>{
        try {
            console.log(version)
            const request =Client.SubscribeRequest.fromJSON({
                accounts: {},
                slots: {},
                transactions: {
                    pumpfun: {
                        vote: false,
                        failed: false,
                        signature: undefined,
                        accountInclude: [PUMPFUN_BONDINGCURVE, RAYDIUM_OPENBOOK_AMM],
                        accountExclude: [],
                        accountRequired: [],
                    },
                },
                transactionsStatus: {},
                entry: {},
                blocks: {},
                blocksMeta: {},
                accountsDataSlice: [],
                ping: undefined,
                commitment: Client.CommitmentLevel.PROCESSED
            })
        
            const stream =await client.subscribe();
            stream.on("data", async (data) => {
                if(data.transaction&&data.transaction.transaction&&data.transaction.transaction.signature) {
                        const transaction=data.transaction.transaction;
                        const sig=bs58.encode(data.transaction.transaction.signature);
                        const allAccounts=[];
                        var detected=false; 
                        transaction.transaction.message.accountKeys.map((account,index)=>{
                            if(!account) return;
                            const accountID=bs58.encode(account);
                            if((!detected)&&wallets.includes(accountID)) detected=true;
                            allAccounts.push(accountID);
                        })
                        if(allAccounts.includes(wallet.publicKey.toBase58())) detected=true;
                        if(!detected) return;

                        transaction.meta.loadedWritableAddresses.map((account,index)=>{
                            if(!account) return;
                            const accountID=bs58.encode(account);
                            allAccounts.push(accountID);
                        })
                        transaction.meta.loadedReadonlyAddresses.map((account,index)=>{
                            if(!account) return;
                            const accountID=bs58.encode(account);
                            allAccounts.push(accountID);
                        })

                        const signers=[allAccounts[0]]//signer's wallet

                        //filter out txs from only Raydium and Pumpfun
                        if(allAccounts.includes(PUMPFUN_BONDINGCURVE)||allAccounts.includes(RAYDIUM_OPENBOOK_AMM)){
                            

                            //collecting all instructions even inner instructions, that is helpful, if wallet uses on-chain program for swap.
                            var allInstructions=transaction.transaction.message.instructions

                            for(var oneInnerInstruction of transaction.meta.innerInstructions){
                                for(var oneInstruction of oneInnerInstruction.instructions){
                                    allInstructions.push(oneInstruction);
                                }
                            }
                            
                            const SOLBalanceChange=transaction.meta.postBalances[0]-transaction.meta.preBalances[0];

                            //extract Wrapped sol balance change
                            const userPreWSOLBalance=transaction.meta.preTokenBalances.find(ba=>((ba.mint==SOL_MINT_ADDRESS)&&(ba.owner==signers[0])));
                            const userPostWSOLBalance=transaction.meta.postTokenBalances.find(ba=>((ba.mint==SOL_MINT_ADDRESS)&&(ba.owner==signers[0])));
                            const WSOLBalChange=userPostWSOLBalance?(userPostWSOLBalance.uiTokenAmount.uiAmount-(userPreWSOLBalance?userPreWSOLBalance.uiTokenAmount.uiAmount:0)):(0-userPreWSOLBalance?userPreWSOLBalance.uiTokenAmount.uiAmount:0);

                            //Maybe not SOL token is spl meme token
                            const userPreTokenBalance=transaction.meta.preTokenBalances.find(ba=>((ba.mint!=SOL_MINT_ADDRESS)&&(ba.owner==signers[0])));
                            const userPostTokenBalance=transaction.meta.postTokenBalances.find(ba=>((ba.mint!=SOL_MINT_ADDRESS)&&(ba.owner==signers[0])));

                            //If token balance change is not existing, exit;
                            if((!userPreTokenBalance)&&(!userPostTokenBalance)) {
                                return;
                            }
                            
                            //token mint address
                            const targetToken=userPreTokenBalance?userPreTokenBalance.mint:userPostTokenBalance.mint;
                
                            //token balance change
                            const userTokenBalanceChange=userPostTokenBalance?(userPostTokenBalance.uiTokenAmount.uiAmount-(userPreTokenBalance?userPreTokenBalance.uiTokenAmount.uiAmount:0)):(0-(userPreTokenBalance?userPreTokenBalance.uiTokenAmount.uiAmount:0));
                
                            var userTokenBalanceChangePercent=0;
                            if(!userPostTokenBalance) userTokenBalanceChangePercent=100;
                            else if(userTokenBalanceChange<0) userTokenBalanceChangePercent=(100*userTokenBalanceChange/userPreTokenBalance.uiTokenAmount.uiAmount);

                            //Logging my buy trades -  That will decrease time latency when sell!
                            if((signers[0]==wallet.publicKey.toBase58())){
                                if(allAccounts.includes(PUMPFUN_BONDINGCURVE)){
                                    if(userTokenBalanceChange>0){
                                        // MY PUMPFUN BUY
                                        const swapInstruction=transaction.transaction.message.instructions.find(instruction=>allAccounts[instruction.programIdIndex]==PUMPFUN_BONDINGCURVE);
                                        if(!swapInstruction) return;
                                        const targetToken=allAccounts[swapInstruction.accounts[2]];
                                        const userPostTokenBalance=transaction.meta.postTokenBalances.find(ba=>((ba.mint==targetToken)&&(ba.owner==wallet.publicKey.toBase58())));
                                        allTrades[targetToken].amount=userPostTokenBalance.uiTokenAmount.uiAmount;
                                    }else if(userTokenBalanceChange<0){
                                        // MY PUMPFUN SELL
                                        if((!userPostTokenBalance)&&(allTrades[targetToken])) delete allTrades[targetToken];
                                        if(userPostTokenBalance) allTrades[targetToken].amount=userPostTokenBalance.uiTokenAmount.uiAmount; 
                                    }
                                    
                                }else if(allAccounts.includes(RAYDIUM_OPENBOOK_AMM)){
                                    
                                    if(userTokenBalanceChange>0){
                                        // MY RAYDIUM BUY
                                        const swapInstruction=transaction.transaction.message.instructions.find(instruction=>allAccounts[instruction.programIdIndex]==RAYDIUM_OPENBOOK_AMM);
                                        if(!swapInstruction) return;
                                        const targetToken=allAccounts[swapInstruction.accounts[2]];
                                        const userPostTokenBalance=transaction.meta.postTokenBalances.find(ba=>((ba.mint==targetToken)&&(ba.owner==wallet.publicKey.toBase58())));
                                        allTrades[targetToken].amount=userPostTokenBalance.uiTokenAmount.uiAmount;
                                    }else if(userTokenBalanceChange<0){
                                        // MY RAYDIUM SELL
                                        if((!userPostTokenBalance)&&(allTrades[targetToken])) delete allTrades[targetToken];
                                        if(userPostTokenBalance) allTrades[targetToken].amount=userPostTokenBalance.uiTokenAmount.uiAmount; 
                                    }
                                }
                                //Please return, if not, I may copy my trades :D
                                return;
                                
                            }
                
                            //RAYDIUM
                            if(allAccounts.includes(RAYDIUM_OPENBOOK_AMM)){
                                console.log(`RAYDIUM`)
                                const swapInstruction=allInstructions.find(instruction =>allAccounts[instruction.programIdIndex]==RAYDIUM_OPENBOOK_AMM);

                                //if swap instruction is existing
                                if(swapInstruction){
                                    //collect accounts of swap instruction
                                    var swapAccounts=[]
                                    for(var oneAccount of swapInstruction.accounts){
                                        swapAccounts.push(allAccounts[oneAccount])
                                    }

                                    console.log(swapAccounts)

                                    if(userTokenBalanceChange>0){
                                        console.log(`https://solscan.io/tx/${sig}`)
                                        console.log(`::::BUY:::::`)
                                        await swapTokenAccountsWalletFaster(connection,stakedConnectioon,wallet,targetToken,swapAccounts,0.001,false);
                                    }else{
                                        console.log(`https://solscan.io/tx/${sig}`)
                                        console.log(`::::SELL::::`);
                                        console.log(`${userTokenBalanceChangePercent.toFixed(2)}% SOLD!`)
                                        if(allTrades[targetToken]&&allTrades[targetToken].amount){
                                            await swapTokenAccountsWalletTokenFaster(connection,stakedConnectioon,wallet,targetToken,swapAccounts,Math.abs(Math.floor(Number(allTrades[targetToken].amount)*userTokenBalanceChangePercent/100)),true)
                                        }
                                        else {
                                            await swapTokenAccountsWalletTokenFaster(connection,stakedConnectioon,wallet,targetToken,swapAccounts,allTrades[targetToken].amount,true)
                                        }
                                    }
                                }
                                //Sometimes, when trader uses unknown on-chain swap program, swap instruction is not extracted.
                                else{
                                    const swapMarket=await getSwapMarketFaster(connection,targetToken);
                                    if(userTokenBalanceChange>0){
                                        console.log(`https://solscan.io/tx/${sig}`)
                                        console.log(`::::BUY:::::`)
                                        console.log(`NOT FOUND SWAP INSTRUCTION!!!`)
                                    }else{
                                        console.log(`https://solscan.io/tx/${sig}`)
                                        console.log(`::::SELL::::`);
                                        console.log(`${userTokenBalanceChangePercent.toFixed(2)}%`)
                                        console.log(`NOT FOUND SWAP INSTRUCTION!!!`)
                                    }
                                }
                            }
                            //PUMPFUN
                            else if(allAccounts.includes(PUMPFUN_BONDINGCURVE)){
                                console.log(`PUMPFUN`)
                                const swapInstruction=allInstructions.find(instruction =>allAccounts[instruction.programIdIndex]==PUMPFUN_BONDINGCURVE);
                                if(swapInstruction){
                                    var bondingCurve=null;
                                    var bondingCurveVault=null;
                                    bondingCurve=allAccounts[swapInstruction.accounts[3]];
                                    bondingCurveVault=allAccounts[swapInstruction.accounts[4]];
                                    console.log({targetToken,bondingCurve,bondingCurveVault})
                                    if(userTokenBalanceChange>0){
                                        console.log(`https://solscan.io/tx/${sig}`)
                                        console.log(`::::BUY:::::`)
                                        const tokenToBuy=Math.floor(userTokenBalanceChange*((0.001*(10**9))/(0-SOLBalanceChange)))
                                        await swapPumpfunWalletFastest(connection,stakedConnectioon,wallet,targetToken,bondingCurve,bondingCurveVault,tokenToBuy,true);
                                    }
                                    else {
                                        console.log(`https://solscan.io/tx/${sig}`)
                                        console.log(`::::SELL:::::`)
                                        console.log(`${userTokenBalanceChangePercent.toFixed(2)}% SOLD`)
                                        if(allTrades[targetToken]&&allTrades[targetToken].amount){
                                            // await swapPumpfunWalletTokenFastest(connection,stakedConnectioon,wallet,targetToken,bondingCurve,bondingCurveVault,Math.abs(Math.floor(Number(allTrades[targetToken].amount)*userTokenBalanceChangePercent/100)),false)
                                        }
                                        else {
                                            // await swapPumpfunWalletFastestPercent(connection,stakedConnectioon,wallet,targetToken,bondingCurve,bondingCurveVault,0.1,userTokenBalanceChangePercent,false)
                                        }
                                    }
                                }
                                //Sometimes, when trader uses unknown on-chain swap program, swap instruction is not extracted.
                                else{
                                    if(userTokenBalanceChange>0){
                                        console.log(`https://solscan.io/tx/${sig}`)
                                        console.log(`::::BUY:::::`)
                                        console.log(`NOT FOUND SWAP INSTRUCTION!!!`)
                                    }
                                    else {
                                        console.log(`https://solscan.io/tx/${sig}`)
                                        console.log(`::::SELL:::::`)
                                        console.log(`${userTokenBalanceChangePercent.toFixed(2)}%`)
                                        console.log(`NOT FOUND SWAP INSTRUCTION!!!`)
                                    }
                                }
                            }

                        }


                }
            });
            await new Promise((resolve, reject) => {
                stream.write(request, (err) => {
                    if (err === null || err === undefined) {
                    resolve();
                    } else {
                    reject(err);
                    }
                });
            }).catch((reason) => {
                console.error(reason);
                throw reason;
            });
        } catch (error) {
            console.log(error)
            console.log("RECONNECTING!!!")
            setTimeout(() => {
                //attempt reconnect recursively
                connectGeyser()
            }, 2000);
            
        }

    });
}

connectGeyser()