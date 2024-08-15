import { GetTokenData } from "../get-token-data";
import type { TokenData } from "../get-token-data";

import { modeConstants } from "../shared/modeConstants";
import { ironcladAddresses } from "../shared/ironcladAddresses";

import { protocolDataProviderAbi } from "../abi/protocol-data-provider";
import { GetRecentTxnHashWithLargestAmount } from "../get-events";

async function main(): Promise<void> {
    const tokenData: TokenData[] = await GetTokenData(modeConstants.rpcUrl, ironcladAddresses.ProtocolDataProvider, protocolDataProviderAbi);
    console.log(await GetRecentTxnHashWithLargestAmount(modeConstants.rpcUrl, tokenData, "IronUSDC", modeConstants.MAX_RANGE));
}

// Promises are either awaited, have a rejection handler, or are explicitly ignored.
main().then(() => {
    console.log("Main function executed successfully.");
}).catch((error) => {
    console.error("Error during main execution:", error);
});