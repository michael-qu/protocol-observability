import type { Handler, Context } from 'aws-lambda';

import { FetchRawTransferEvent } from './data-fetcher';
import { GetBalance } from "./get-balance";

import { contractConstants } from './shared/constants';
import { ironTokenAddresses } from './shared/ironTokenAddresses';

import { usdcContractAbi } from './abi/usdc';
import { ironUsdcContractAbi } from './abi/iron-usdc';

export const handler: Handler = async (event, context: Context): Promise<void> => {

    await FetchRawTransferEvent(contractConstants.rpcUrl, ironTokenAddresses.ironUSDC, ironUsdcContractAbi, contractConstants.explorerAddress, contractConstants.MAX_RANGE);
    // TVL of Ironclad USDC
    await GetBalance(contractConstants.rpcUrl, contractConstants.usdcAddress, usdcContractAbi, ironTokenAddresses.ironUSDC);
    // Revenue
    await GetBalance(contractConstants.rpcUrl, ironTokenAddresses.ironUSDC, ironUsdcContractAbi, contractConstants.treasuryAddress);
};