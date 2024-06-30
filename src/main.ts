import { FetchRawTransferEvent } from "./data-fetcher";

import { contractConstants } from './constants';

FetchRawTransferEvent(contractConstants.rpcUrl, contractConstants.contractAddress, contractConstants.explorerAddress);