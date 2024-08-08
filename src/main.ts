import { GetBalance, GetTotalSupply } from "./get-state-variables";
import { GetTokenData, TokenData } from "./get-token-data";

import { modeConstants } from "./shared/modeConstants";
import { ironcladAddresses } from "./shared/ironcladAddresses";

import { reserveContractAbi } from "./abi/reserve";
import { ironATokenContractAbi } from "./abi/iron-atoken";
import { protocolDataProviderAbi } from "./abi/protocol-data-provider";
import { GetRecentTxnURLWithLargestAmount } from "./get-events";

async function main() {
    const tokenData: TokenData[] = await GetTokenData(modeConstants.rpcUrl, ironcladAddresses.ProtocolDataProvider, protocolDataProviderAbi);

    // console.log(tokenData);
    console.log(await GetRecentTxnURLWithLargestAmount(modeConstants.rpcUrl, tokenData, "IronUSDC", modeConstants.MAX_RANGE));
}

main();