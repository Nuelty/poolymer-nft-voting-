
const hre = require('hardhat');
const fs = require('fs');
const { getConfigPath } = require("./_helpers.js");
const { getIbcApp } = require('../private/_vibc-helpers.js');

async function main() {
    const accounts = await hre.ethers.getSigners();
    const account = accounts[0];
    const networkName = hre.network.name;
    let jokeLine1;
    let jokeLine2;

    await getJoke()

    const ibcApp = await getIbcApp(networkName);

    const mint = await ibcApp.connect(account).mint(`${jokeLine1}_______${jokeLine2}`);
    console.log({
        Status: 'NFT on Optimims is minted',
        Explorer: `https://optimism-sepolia.blockscout.com/tx/${mint.hash}`,
    })

    async function getJoke() {
        const apiUrl = 'https://official-joke-api.appspot.com/random_joke';

        await fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {

                jokeLine1 = data.setup;
                jokeLine2 = data.punchline;

                console.log(`
                        status: 'got one joke'
                ========================================================================
                - ${jokeLine1}
                - ${jokeLine2}
                ========================================================================
            `)
            })
            .catch(error => {
                // Handle any errors that occurred during the fetch
                console.error('There was a problem with the fetch operation:', error);
            });
        return
    }
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});