// import web3 object
const { Web3 } = require("web3");

// initialize web3 with a provider
const rpc_url = 'https://arb1.arbitrum.io/rpc';
//const rpc_url = 'https://mainnet.mode.network';
const web3 = new Web3(rpc_url);

const contract_address = "0xb05Ea3cD21ec0cC3BEf7BDD83FfAc60a552B9272";
//const contract_abi = "";

// promises
//web3.eth.getBlockNumber().then(console.log);

async function main() {
    console.log(await web3.eth.getBlockNumber());
    console.log(await web3.eth.getChainId());
}

main()