import type { Handler, Context } from "aws-lambda";

import { GetTokenAddresses } from "./get-addresses";
import type { TokenAddresses } from "./get-addresses";
import { FetchRawTransferEvent } from "./data-fetcher";
import { GetBalance, GetTotalSupply } from "./get-state-variables";
import { PublishMetric } from "./publish-metric";

import { modeConstants } from "./shared/modeConstants";
import { ironcladAddresses } from "./shared/ironcladAddresses";

import { protocolDataProviderAbi } from "./abi/ProtocolDataProvider"
import { usdcContractAbi } from "./abi/usdc";
import { ironUsdcContractAbi } from "./abi/iron-usdc";

/**
 * Provide an event that contains the following keys:
 * - operation: one of 'fetchRawTransferEvent', 'fetchTVL', 'fetchRevenue', 'fetchDeposit', 'fetchDebt' or 'fetchTMS'
 */

export const handler: Handler = async (
  event,
  context: Context,
): Promise<void> => {
  const operation = event.operation;

  const tokenAddresses: TokenAddresses[] = await GetTokenAddresses(modeConstants.rpcUrl, ironcladAddresses.ProtocolDataProvider, protocolDataProviderAbi);
  
  const nameSpace = "Contract-Metrics";

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
      for (const ta of tokenAddresses) {
        const tvl = await GetBalance(
          modeConstants.rpcUrl,
          ta.reserveTokenAddress,
          usdcContractAbi,
          ta.aTokenAddress,
          ta.symbol,
        );
        await PublishMetric(
          nameSpace,
          "TVL",
          ta.symbol,
          `${ta.symbol} TVL`,
          tvl,
        );
      }

      break;
    }

    case "fetchRevenue": {
      for (const ta of tokenAddresses) {
        const revenue = await GetBalance(
          modeConstants.rpcUrl,
          ta.aTokenAddress,
          ironUsdcContractAbi,
          ironcladAddresses.Treasury,
          ta.symbol,
        );
        await PublishMetric(
          nameSpace,
          "Revenue",
          ta.symbol,
          `${ta.symbol} Revenue`,
          revenue,
        );
      }

      break;
    }

    case "fetchDeposit": {
      for (const ta of tokenAddresses) {
        const deposit = await GetTotalSupply(
          modeConstants.rpcUrl,
          ta.aTokenAddress,
          ironUsdcContractAbi,
          ta.symbol,
        );
        await PublishMetric(
          nameSpace,
          "Deposit",
          ta.symbol,
          `${ta.symbol} Deposit`,
          deposit,
        );
      }
      
      break;
    }

    case "fetchDebt": {
      // https://docs.aave.com/developers/tokens/debttoken
      // Returns the most up to date total debt accrued by all protocol users for that specific type (stable or variable rate) of debt token.
      for (const ta of tokenAddresses) {
        const debt = await GetTotalSupply(
          modeConstants.rpcUrl,
          ta.variableDebtTokenAddress,
          ironUsdcContractAbi,
          ta.symbol,
        );
        await PublishMetric(
          nameSpace,
          "Debt",
          ta.symbol,
          `${ta.symbol} Debt`,
          debt,
        );
      }

      break;
    }

    case "fetchTMS": {

      for (const ta of tokenAddresses) {
        const deposit = await GetTotalSupply(
          modeConstants.rpcUrl,
          ta.aTokenAddress,
          ironUsdcContractAbi,
          ta.symbol,
        );
        const debt = await GetTotalSupply(
          modeConstants.rpcUrl,
          ta.variableDebtTokenAddress,
          ironUsdcContractAbi,
          ta.symbol,
        );
        const tms = deposit + debt;
        await PublishMetric(
          nameSpace,
          "TMS",
          ta.symbol,
          `${ta.symbol} TMS`,
          tms,
        );
      }
      
      break;
    }

    default:
      console.log(`Unknown operation: ${operation}`);
  }
};
