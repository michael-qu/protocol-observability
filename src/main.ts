import { FetchRawTransferEvent } from "./data-fetcher";
import { GetBalance } from "./get-balance";

import { contractConstants } from './shared/constants';
import { ironTokenAddresses } from "./shared/ironTokenAddresses";

import { usdcContractAbi } from './abi/usdc';
import { ironUsdcContractAbi } from './abi/iron-usdc';

// FetchRawTransferEvent(contractConstants.rpcUrl, ironTokenAddresses.ironUSDC, ironUsdcContractAbi, contractConstants.explorerAddress);
GetBalance(contractConstants.rpcUrl, contractConstants.usdcAddress, usdcContractAbi, ironTokenAddresses.ironUSDC);
GetBalance(contractConstants.rpcUrl, ironTokenAddresses.ironUSDC, ironUsdcContractAbi, contractConstants.treasuryAddress);