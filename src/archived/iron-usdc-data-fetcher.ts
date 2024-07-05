// Import the Web3 library
import { Web3 } from 'web3';
import { ironUsdcContractAbi } from '../abi/iron-usdc';

// RPC url for your network
const rpcUrl = 'https://mainnet.mode.network/';

// Create a Web3 instance to connect to the blockchain
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

// Contract address and ABI
const contractAddress = "0xe7334Ad0e325139329E747cF2Fc24538dD564987";
// The result can be verified in
// https://explorer.mode.network/address/0xe7334Ad0e325139329E747cF2Fc24538dD564987?tab=logs

// Get the contract instance
const contract = new web3.eth.Contract(ironUsdcContractAbi, contractAddress);

// Function to get contract events
async function getContractEvents(blockRange: number): Promise<EventData[]> {
    // Get the latest block number
    const latestBlock = await web3.eth.getBlockNumber();    //bigint
    const fromBlock = latestBlock - BigInt(blockRange);
    console.log("from block:", fromBlock);
    console.log("to block:", latestBlock);

    // Get all "Transfer" events from the contract
    const events = await contract.getPastEvents('Transfer', {
        fromBlock: Number(fromBlock),
        toBlock: 'latest'
    });
    return events as EventData[];
}

// Function to process and print event data
// async function getEventData(events: any) {
//     for (const event of events) {
//         const owner = event.returnValues.owner;
//         const asset1 = event.returnValues.amount0;
//         const asset2 = event.returnValues.amount1;
//         const tickLower = event.returnValues.tickLower;
//         const tickUpper = event.returnValues.tickUpper;
//         const txHash = event.transactionHash;
//         const blockNumber = event.blockNumber;

//         const blockData = await web3.eth.getBlock(blockNumber);
//         const txTimestamp = blockData.timestamp;

//         console.log({
//             owner,
//             asset1,
//             asset2,
//             tickLower,
//             tickUpper,
//             txHash,
//             blockNumber,
//             txTimestamp
//         });
//     }
// }

// // Function to read data from the contract
// async function readContractReadFunctionData() {
//     const fee = await contract.methods.fee().call();
//     return fee;
// }

// Main function to execute the above functions
async function main() {
    try {
        const blockRange = 1000;
        const events = await getContractEvents(blockRange);
        console.log("There are: ", events.length, " events found in the past ", blockRange, " blocks");
        console.log("All Transfer events:", events);
        //await getEventData(events);

        //const fee = await readContractReadFunctionData();
        //console.log('Contract fee:', fee);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the main function
main();

interface EventData {
    address: string;
    blockHash: string;
    blockNumber: number;
    event: string;
    id: string;
    logIndex: number;
    raw: {
        data: string;
        topics: string[];
    };
    returnValues: Record<string, unknown>;
    signature: string | null;
    transactionHash: string;
    transactionIndex: number;
}

export {};