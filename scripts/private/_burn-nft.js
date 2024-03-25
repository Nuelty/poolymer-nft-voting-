
const hre = require('hardhat');
const fs = require('fs');
const { getIbcApp } = require('../private/_vibc-helpers.js');

async function main() {
    const accounts = await hre.ethers.getSigners();
    const account = accounts[0];
    const networkName = hre.network.name;

    const ibcApp = await getIbcApp(networkName);

    const tokenID = await ibcApp.connect(account).tokenID();
    const burn = await ibcApp.connect(account).burn(tokenID);
    console.log({
        Status: 'The NFT on Optimism is burnt',
        Explorer: `https://optimism-sepolia.blockscout.com/tx/${burn.hash}`,
    })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});