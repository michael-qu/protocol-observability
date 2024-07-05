import { Web3 } from 'web3';
import type { Contract } from 'web3-eth-contract';


// import { PutItem } from "./put-item-into-dynamo";
// import { GetItem } from "./get-item-from-dynamo";

// import { contractConstants } from './constants';



const dbName = "BlockchainDataFetcher";

// Function to get contract events
async function getContractEvents(contract: Contract<any>, fromBlock: bigint, toBlock: bigint): Promise<EventData[]> {
    // Get all "Transfer" events from the contract
    const transferEvents = await contract.getPastEvents('Transfer', {
        fromBlock: Number(fromBlock),
        toBlock: Number(toBlock)
    });
    return transferEvents as EventData[];
}

async function FetchRawTransferEvent(rpcUrl: string, contractAddress: string, contractAbi: any, explorerAddress: string, MAX_RANGE: bigint): Promise<void> {
    try {
        // Create a Web3 instance to connect to the blockchain
        const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
        // Get the contract instance
        const contract = new web3.eth.Contract(contractAbi, contractAddress);

        // Get the last-fetched block number from DynamoDB
        // let response = await GetItem(dbName, "LastFetched");

        // Error handling for empty table
        // if (response == null) {
        //     console.log("Response is null!");
        // } else {
        //     if (response.Item === undefined) {
        //         // Reset the starting block
        //         const assumedLastBlock = BigInt(await web3.eth.getBlockNumber()) - contractConstants.MAX_RANGE;
        //         await PutItem(dbName, "LastFetched", assumedLastBlock);
        //         console.log("Reset the starting block at: ", assumedLastBlock);
        //         response = await GetItem(dbName, "LastFetched");
        //     }
        //     if (response == null) {
        //         console.log("Response is null!");
        //     } else {
        //         const lastFetchedBlockNumber = BigInt(response.Item.BlockNumber);

                // Calculate the range
                const latestBlock = BigInt(await web3.eth.getBlockNumber());
                // const fromBlock = lastFetchedBlockNumber + BigInt(1);
                // const toBlock = lastFetchedBlockNumber + contractConstants.MAX_RANGE >= latestBlock ? latestBlock : lastFetchedBlockNumber + contractConstants.MAX_RANGE;
                const fromBlock = latestBlock - BigInt(1000);
                const toBlock = latestBlock;

                // Get all "Transfer" events from the contract
                const transferEvents = await getContractEvents(contract, fromBlock, toBlock);
                console.log("There are: ", transferEvents.length, " Transfer events found from ", fromBlock, " to ", toBlock);

                if (transferEvents.length > 0) {
                    console.log('All Transfer events: \n', transferEvents);
                    // For test: return one of the transactions
                    console.log("One of the Txn: ", explorerAddress, transferEvents[0].transactionHash);
                }
                
                // Write the last block fetched into DynamoDB
                // await PutItem(dbName, "LastFetched", toBlock);
        //         console.log(toBlock, " is written into DynamoDB!");
        //     }
        // }    
    } catch (err) {
        console.log('Error: ', err);
    }
}


export { FetchRawTransferEvent };

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
    returnValues: Record<string, any>;
    signature: string | null;
    transactionHash: string;
    transactionIndex: number;
}