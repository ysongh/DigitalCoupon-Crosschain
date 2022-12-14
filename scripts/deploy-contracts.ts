import fs from 'fs/promises';
import { getDefaultProvider, utils } from 'ethers';
import { isTestnet, wallet } from '../config/constants';

const {
    utils: { deployContract },
} = require('@axelar-network/axelar-local-dev');
const { deployUpgradable } = require('@axelar-network/axelar-gmp-sdk-solidity');

// load contracts
const ExampleProxy = require('../artifacts/contracts/Proxy.sol/ExampleProxy.json');
const DigitalCoupon = require('../artifacts/contracts/DigitalCoupon.sol/DigitalCoupon.json');
const ERC721 = require('../artifacts/contracts/ERC721demo.sol/ERC721Demo.json');

let chains = isTestnet ? require('../config/testnet.json') : require('../config/local.json');

// get chains
const moonbeamChain = chains.find((chain: any) => chain.name === 'Moonbeam');
const avalancheChain = chains.find((chain: any) => chain.name === 'Avalanche');

const nftTokenId = 0;

// deploy script
async function deployNFTContracts(chain: any) {
    console.log(`\n*****${chain.name.toUpperCase()}*****`);
    const provider = getDefaultProvider(chain.rpc);
    const walletConnectedToProvider = wallet.connect(provider);

    const digitalCoupon = await deployUpgradable(
        chain.constAddressDeployer,
        walletConnectedToProvider,
        DigitalCoupon,
        ExampleProxy,
        [chain.gateway, chain.gasReceiver],
        [],
        utils.defaultAbiCoder.encode(['string'], [chain.name]),
        'digitalCoupon',
    );

   
    console.log(`DigitalCoupon deployed on ${chain.name}: ${digitalCoupon.address}`);
    chain.digitalCoupon = digitalCoupon.address;

    // if (chain.name === "Avalanche") {
    //     await digitalCoupon.createCoupon("https://dweb.link/ipfs/bafybeihcfd2bojowzxy6frpl54xqyt6cpk2wlp52avpetgj7yrcgx3m7ky", "7", "1000000000000000000", "10");
    //     console.log(`Coupon #1 is created on Avalanche`);
    //     await digitalCoupon.createCoupon("https://dweb.link/ipfs/bafybeigqj4in4bpiovytwo6ubsjc2myek6psciscszyozch3jlzs2hv3ra", "10", "1500000000000000000", "10");
    //     console.log(`Coupon #2 is created on Avalanche`);
    // }

}

async function main() {

    for await (let chain of [avalancheChain, moonbeamChain]) {
        await deployNFTContracts(chain);
    }

    // update chains
    const updatedChains = [moonbeamChain, avalancheChain];
    if (isTestnet) {
        await fs.writeFile('config/testnet.json', JSON.stringify(updatedChains, null, 2));
    } else {
        await fs.writeFile('config/local.json', JSON.stringify(updatedChains, null, 2));
    }
}

main();
