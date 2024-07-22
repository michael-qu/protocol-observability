import type { Handler, Context } from "aws-lambda";

import { FetchRawTransferEvent } from "./data-fetcher";
import { GetBalance, GetTotalSupply } from "./get-state-variables";
import { PublishMetric } from "./publish-metric";

import { modeConstants } from "./shared/modeConstants";
import { ironcladAddresses } from "./shared/ironcladAddresses";

import { usdcContractAbi } from "./abi/usdc";
import { ironUsdcContractAbi } from "./abi/iron-usdc";

/**
 * Provide an event that contains the following keys:
 * - operation: one of 'fetchRawTransferEvent', 'fetchTVL', or 'fetchRevenue'
 */

export const handler: Handler = async (
  event,
  context: Context,
): Promise<void> => {
  const operation = event.operation;
  const nameSpace = "Contract-Metrics";
  const dimensionValueName = "USDC";
  const tokenName = "IronUSDC";

  switch (operation) {
    case "fetchRawTransferEvent":
      await FetchRawTransferEvent(
        modeConstants.rpcUrl,
        ironcladAddresses.ATokens.ironUSDC,
        ironUsdcContractAbi,
        modeConstants.txAddressPrefix,
        modeConstants.MAX_RANGE,
      );
      break;
    case "fetchTVL": {
      const tvl = await GetBalance(
        modeConstants.rpcUrl,
        ironcladAddresses.Reserves.USDC,
        usdcContractAbi,
        ironcladAddresses.ATokens.ironUSDC,
        tokenName
      );
      await PublishMetric(nameSpace, "TVL", dimensionValueName, `${tokenName} TVL`, tvl);
      break;
    }
    case "fetchRevenue": {
      const revenue = await GetBalance(
        modeConstants.rpcUrl,
        ironcladAddresses.ATokens.ironUSDC,
        ironUsdcContractAbi,
        ironcladAddresses.Treasury,
        tokenName
      );
      await PublishMetric(nameSpace, "Revenue", dimensionValueName, `${tokenName} Revenue`, revenue);
      break;
    }
    case "fetchDeposit": {
      const deposit = await GetTotalSupply(modeConstants.rpcUrl, ironcladAddresses.ATokens.ironUSDC, ironUsdcContractAbi, tokenName);
      await PublishMetric(nameSpace, "Deposit", dimensionValueName, `${tokenName} Deposit`, deposit);
      break;
    }
    case "fetchDebt": {
      // https://docs.aave.com/developers/tokens/debttoken
      // Returns the most up to date total debt accrued by all protocol users for that specific type (stable or variable rate) of debt token.
      const debt = await GetTotalSupply(modeConstants.rpcUrl, ironcladAddresses.VariableDebtTokens.vUSDC, ironUsdcContractAbi, tokenName);
      await PublishMetric(nameSpace, "Debt", dimensionValueName, `${tokenName} Debt`, debt);
      break;
    }
    case "fetchTMS": {
      const deposit = await GetTotalSupply(modeConstants.rpcUrl, ironcladAddresses.ATokens.ironUSDC, ironUsdcContractAbi, tokenName);
      const debt = await GetTotalSupply(modeConstants.rpcUrl, ironcladAddresses.VariableDebtTokens.vUSDC, ironUsdcContractAbi, tokenName);
      const tms = deposit + debt;
      await PublishMetric(nameSpace, "TMS", dimensionValueName, `${tokenName} TMS`, tms);
      break;
    }
    default:
      console.log(`Unknown operation: ${operation}`);
  }
};
