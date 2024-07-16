import { GetBalance, GetTotalSupply } from "./get-state-variables";

import { modeConstants } from "./shared/modeConstants";
import { ironcladAddresses } from "./shared/ironcladAddresses";

import { usdcContractAbi } from "./abi/usdc";
import { ironUsdcContractAbi } from "./abi/iron-usdc";

async function main() {
    const tvl = await GetBalance(
        modeConstants.rpcUrl,
        ironcladAddresses.Reserves.USDC,
        usdcContractAbi,
        ironcladAddresses.ATokens.ironUSDC,
        "IronUSDC"
      );
    console.log(`Revenue is: ${tvl}`);
    const revenue = await GetBalance(
        modeConstants.rpcUrl,
        ironcladAddresses.ATokens.ironUSDC,
        ironUsdcContractAbi,
        ironcladAddresses.Treasury,
        "IronUSDC"
      );
    console.log(`Revenue is: ${revenue}`);
    const deposits = await GetTotalSupply(modeConstants.rpcUrl, ironcladAddresses.ATokens.ironUSDC, ironUsdcContractAbi, "IronUSDC");
    console.log(`Deposit is: ${deposits}`);

    const debts = await GetTotalSupply(modeConstants.rpcUrl, ironcladAddresses.VariableDebtTokens.vUSDC, ironUsdcContractAbi, "IronUSDC");
    console.log(`Dept is: ${debts}`);




}

main();