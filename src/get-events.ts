import { Web3 } from "web3";
import type { Contract } from "web3-eth-contract";

import type { TokenData } from "./get-token-data";

import { PutItem } from "./aws/put-item-into-dynamo";
import { GetItem } from "./aws/get-item-from-dynamo";

import { ironATokenContractAbi } from "./abi/iron-atoken";

// Function to get contract events
async function getContractEvents(
  contract: Contract<any>,
  fromBlock: bigint,
  toBlock: bigint,
): Promise<EventData[]> {
  // Get all "Transfer" events from the contract
  const transferEvents = await contract.getPastEvents("Transfer", {
    fromBlock: Number(fromBlock),
    toBlock: Number(toBlock),
  });
  return transferEvents as EventData[];
}

async function FetchRawTransferEvent(
  rpcUrl: string,
  contractAddress: string,
  contractAbi: any,
  txAddressPrefix: string,
  MAX_RANGE: bigint,
): Promise<void> {
  const tableName = "BlockchainDataFetcher";
  const pkName = "BlockType";
  const key = "LastFetched";
  const attributeName = "BlockNumber";

  // Create a Web3 instance to connect to the blockchain
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  // Get the contract instance
  const contract = new web3.eth.Contract(contractAbi, contractAddress);
  // Get the last-fetched block number from DynamoDB
  let response = await GetItem(tableName, pkName, key);

  // Error handling for empty table
  if (response == null) {
    throw new Error("Response is null!");
  } else {
    if (response.Item === undefined) {
      // Reset the starting block
      const resetLastBlock =
        BigInt(await web3.eth.getBlockNumber()) - MAX_RANGE;
      await PutItem(tableName, pkName, key, attributeName, resetLastBlock);
      console.log("Reset the starting block at: ", resetLastBlock);
      response = await GetItem(tableName, pkName, key);
    }
    if (response == null) {
      throw new Error("Response is null!");
    } else {
      const lastFetchedBlockNumber = BigInt(response.Item.BlockNumber);

      // Calculate the range
      const latestBlock = BigInt(await web3.eth.getBlockNumber());
      const fromBlock = lastFetchedBlockNumber + BigInt(1);
      const toBlock =
        lastFetchedBlockNumber + MAX_RANGE >= latestBlock
          ? latestBlock
          : lastFetchedBlockNumber + MAX_RANGE;

      // Get all "Transfer" events from the contract
      const transferEvents = await getContractEvents(
        contract,
        fromBlock,
        toBlock,
      );
      console.log(
        "There are: ",
        transferEvents.length,
        " Transfer events found from ",
        fromBlock,
        " to ",
        toBlock,
      );

      if (transferEvents.length > 0) {
        console.log("All Transfer events: \n", transferEvents);
        // For test: return one of the transactions
        console.log(
          `One of the Txn: ${txAddressPrefix}${transferEvents[0].transactionHash}`,
        );
      }

      // Write the last block fetched into DynamoDB
      await PutItem(tableName, pkName, key, attributeName, toBlock);
      console.log(toBlock, " is written into DynamoDB!");
    }
  }
}

// Return the URL of the most recent txn of a given asset
async function GetRecentTxnHashWithLargestAmount(
  rpcUrl: string,
  tokenData: TokenData[],
  assetName: string,
  MAX_RANGE: bigint,
): Promise<string> {

    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    // Get AToken address for the given asset
    const token = tokenData.find(t => t.symbol === assetName);
    if (token === undefined) {
      return `Unexpected asset: ${assetName}`;
    }
    // Create the contract instance
    const contract: Contract<typeof ironATokenContractAbi> = new web3.eth.Contract(ironATokenContractAbi, token.aTokenAddress);
    
    const latestBlock = BigInt(await web3.eth.getBlockNumber());
    const fromBlock = latestBlock - MAX_RANGE;
    // Get all "Transfer" events from the contract
    const transferEvents = await getContractEvents(contract, fromBlock, latestBlock);
    if (transferEvents.length === 0) {
      return `No transaction is found for ${assetName} in the latest ${MAX_RANGE} blocks`;
    }
    
    let largestAmount: number = 0;
    let txnHash: string = "";
    for (const event of transferEvents) {
      if (event.returnValues.value > largestAmount) {
        largestAmount = event.returnValues.value;
        txnHash = event.transactionHash;
      }
    }

    const decimals = await contract.methods.decimals().call();
    const formattedLargestAmount = Number(largestAmount) / Math.pow(10, Number(decimals));
    
    console.log(`Txn hash of the recent ${assetName} transaction with the largest amount is ${txnHash}, which transfered ${formattedLargestAmount} ${assetName}.`);
    return txnHash;
}

export { FetchRawTransferEvent, GetRecentTxnHashWithLargestAmount };

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
  returnValues: Record<string, any>;  // {from: string; to: string; value: number}
  signature: string | null;
  transactionHash: string;
  transactionIndex: number;
}
