import type { Handler, Context } from 'aws-lambda';

import { FetchRawTransferEvent } from './data-fetcher';
import { GetBalance } from "./get-balance";

import { contractConstants } from './shared/constants';
import { ironTokenAddresses } from './shared/ironTokenAddresses';

import { usdcContractAbi } from './abi/usdc';
import { ironUsdcContractAbi } from './abi/iron-usdc';

/**
 * Provide an event that contains the following keys:
 * - operation: one of 'fetchRawTransferEvent', 'fetchTVL', or 'fetchRevenue'
 */

export const handler: Handler = async (event, context: Context): Promise<void> => {

    const operation = event.operation;

    switch (operation) {
        case 'fetchRawTransferEvent':
            await FetchRawTransferEvent(contractConstants.rpcUrl, ironTokenAddresses.ironUSDC, ironUsdcContractAbi, contractConstants.explorerAddress, contractConstants.MAX_RANGE);
            break;
        case 'fetchTVL':
            await GetBalance(contractConstants.rpcUrl, contractConstants.usdcAddress, usdcContractAbi, ironTokenAddresses.ironUSDC);
            break;
        case 'fetchRevenue':
            await GetBalance(contractConstants.rpcUrl, ironTokenAddresses.ironUSDC, ironUsdcContractAbi, contractConstants.treasuryAddress);
            break;
        default:
            console.log(`Unknown operation: ${operation}`);
    }
};