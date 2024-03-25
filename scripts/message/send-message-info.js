// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');
const { getConfigPath } = require('../private/_helpers.js');
const { getIbcApp } = require('../private/_vibc-helpers.js');

const fs = require('fs');
const path = require('path');

const configPath = 'message-config.json';
const configData = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configData);
const messageValue = config.content;
console.log(`message: ${messageValue}`);



async function main() {
    const accounts = await hre.ethers.getSigners();
    const config = require(getConfigPath());
    const sendConfig = config.sendPacket;

    const networkName = hre.network.name;

    // Get the contract type from the config and get the contract
    const ibcApp = await getIbcApp(networkName);

    const voteAccount = accounts[0];

    const channelId = sendConfig[`${networkName}`]["channelId"];
    const channelIdBytes = hre.ethers.encodeBytes32String(channelId);
    const timeoutSeconds = sendConfig[`${networkName}`]["timeout"];
    const voterAddress = voteAccount.address;
    const recipient = voterAddress;
    //const str = "yura1998";

    // Send the packet
    await ibcApp.connect(accounts[0]).sendPacket(
        channelIdBytes,
        timeoutSeconds,
        voterAddress,
        //recipient,
        messageValue
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});