require("dotenv").config()

const { Connection } = require("@solana/web3.js");
const {pumpfunSwapTransaction, swapTokenAccounts}=require("./swap")

const connection=new Connection(process.env.RPC_API)

const accounts=[
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    '4Ea9DVXgQTotuTEuYw1NiMn3QmyoMwwxmMXwtNhNZDQ2',
    '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    'GDyNr2c9nbwZ9dy3Sr6PNkMUh3rjwpmwWjnaSK4KMqk4',
    '9DCxsMizn3H1hprZ7xWe6LDzeUeZBksYFpBWBtSf1PQX',
    '2qpaVMf4gvwcLPTXhkkb51r4PNLEnoypL8Tby8wTHcZA',
    'AuLnckDZDgSVchjee2BKU23fLgu3SKgQsRqb5yApGNQd',
    'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',
    'EHDQsyJmKjju9PrNoarNh5Zt3hMFChHzLHBbE5ewZ8uX',
    '9w2ABaJm2Dxut5sKGWtjGYeLTtAiyfz7baX85M1bM5B2',
    '5F1UZo4Epc5xTqWEmxgXfRS8kN2fio4TD6roqhRTXeL4',
    'CeidZP1s5kqi6cjadhJ8u1D3SvqkgMand19Yv7MrLrrL',
    'DpkDLHzdUGPfuL1bYpJfPS5J87WMzV61uSoMExXQHdN1',
    'BsKJTZzXykGrGPcEHY5HdASN2tJsNoEyeZ1LVKwdDKc',
    '8FbLon3joBFR3xinPGNaZ4YLRsVB2G1RXNCYSeq8Kyda',
    '4ou194cB7sK1PfwzEqRusEXyESPLGc6pButTPg9Z31ea',
    'BzUaMeT1Rn6K2xc8bepcPne66DnrG1hKVdKTFpAmdQdw',
    'Cap9FMVS9AV8qKnnQTd7eVS6oqcVaMa1Mn4ATE6Xjcua'
  ]

setTimeout(async () => {
    await swapTokenAccounts(connection,"AZnZjNctmBwzPb5aS2GYWhGVzv658Ae2e6X3yFMSpump",accounts,0.0001,true);
}, 0);