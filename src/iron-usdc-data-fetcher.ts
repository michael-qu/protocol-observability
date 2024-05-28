// Import the Web3 library
const { Web3 } = require('web3');

const { contractAbi } = require('../abi/iron-usdc.js');

// RPC url for your network
const rpcUrl = 'https://mainnet.mode.network/';

// Create a Web3 instance to connect to the blockchain
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

// Contract address and ABI
const contractAddress = "0xe7334Ad0e325139329E747cF2Fc24538dD564987";

// Get the contract instance
const contract = new web3.eth.Contract(contractAbi, contractAddress);

// Function to get contract events
async function getContractEvents(blockRange: number): Promise<Object[]> {
    // Get the latest block number
    const latestBlock = await web3.eth.getBlockNumber();    //bigint
    const fromBlock = latestBlock - BigInt(blockRange);
    console.log("from block:", fromBlock);
    console.log("to block:", latestBlock);

    // Get all events from the contract within the specified block range
    const events = await contract.getPastEvents('allEvents', {
        fromBlock: Number(fromBlock),
        toBlock: 'latest'
    });

    // // Filter events to only include 'Mint' events
    // const mintEvents = events.filter(event => event.event === 'Mint');

    // console.log("mint events: ", mintEvents);
    // return mintEvents;
    

    // Get the Mint events from the contract
    // const events = await contract.getPastEvents('Mint', {
    //     fromBlock: Number(fromBlock),
    //     toBlock: 'latest'
    // });

    // console.log("mint event: ", events);

    return events;
}

// Function to process and print event data
async function getEventData(events: any) {
    for (const event of events) {
        const owner = event.returnValues.owner;
        const asset1 = event.returnValues.amount0;
        const asset2 = event.returnValues.amount1;
        const tickLower = event.returnValues.tickLower;
        const tickUpper = event.returnValues.tickUpper;
        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;

        const blockData = await web3.eth.getBlock(blockNumber);
        const txTimestamp = blockData.timestamp;

        console.log({
            owner,
            asset1,
            asset2,
            tickLower,
            tickUpper,
            txHash,
            blockNumber,
            txTimestamp
        });
    }
}

// Function to read data from the contract
async function readContractReadFunctionData() {
    const fee = await contract.methods.fee().call();
    return fee;
}

// Main function to execute the above functions
async function main() {
    try {
        const blockRange = 500;
        const events = await getContractEvents(blockRange);
        console.log("There are: ", events.length, " events found in the past ", blockRange, " blocks");
        console.log("All events:", events);
        //await getEventData(events);

        //const fee = await readContractReadFunctionData();
        //console.log('Contract fee:', fee);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the main function
main();

export {};