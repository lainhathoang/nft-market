# NFT-Market 

Welcome to the documentation for the NFT Market project! This repository is dedicated to creating a decentralized NFT (Non-Fungible Token) marketplace. 

## Table of contents
- Introduction
- Prerequisites
- Installation
- Demo

### Introduction
A small project about NFT Market aims to create a decentralized platform for buying and selling NFTs. 
### Prerequisites
- Node.js (v16.20.0)
- Git
- Metamask wallet (for testing on Testnet)
### Installation
1. Clone the repo
```
git clone https://github.com/lainhathoang/nft-market
cd nft-market
```
2. Install dependencies (for all)
```
yarn installl
```
3. Create a project on Infura and get your:
    - API KEY (is projectId)
    - API KEY SECRET (is projectSecret)
4. Open the file `Create.js` (directory: `src/frontend/components/Create.js`) and set value you got from your Infura project
5. Install [Metamask ](https://metamask.io/download/) and then create a wallet 
6. Create a file called `.env` on the rooth path and set the private key to the private key of this wallet u have just created
7. Open [Faucet of Sepolia](https://sepoliafaucet.com/), paste your wallet's public key and get some ETH testnet
8. Deploy new Smart contract to Testnet (I used Sepolia testnet)
```
yarn run deploy
```
9. Run the project on local host:
```
yarn run start
```
### Demo
[NFT Market Video Demo](https://youtu.be/IJY2syOw6Nk)
