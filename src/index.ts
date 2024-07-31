import type { Handler, Context } from "aws-lambda";

import { GetTokenData } from "./get-token-data";
import type { TokenData } from "./get-token-data";
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

  const tokenData: TokenData[] = await GetTokenData(modeConstants.rpcUrl, ironcladAddresses.ProtocolDataProvider, protocolDataProviderAbi);
  
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
      const dimensionName = "TVL";
      let totalTVL = 0;

      for (const td of tokenData) {
        const tvl = await GetBalance(
          modeConstants.rpcUrl,
          td.reserveTokenAddress,
          usdcContractAbi,
          td.aTokenAddress,
          td.symbol,
        );
        await PublishMetric(
          nameSpace,
          dimensionName,
          td.symbol,
          `${td.symbol} ${dimensionName}`,
          tvl,
        );
        totalTVL += tvl * td.price;
      }

      await PublishMetric(
        nameSpace,
        dimensionName,
        `Total`,
        `Total ${dimensionName}`,
        totalTVL,
      );
      break;
    }

    case "fetchRevenue": {
      const dimensionName = "Revenue";
      let totalRevenue = 0;

      for (const td of tokenData) {
        const revenue = await GetBalance(
          modeConstants.rpcUrl,
          td.aTokenAddress,
          ironUsdcContractAbi,
          ironcladAddresses.Treasury,
          td.symbol,
        );
        await PublishMetric(
          nameSpace,
          dimensionName,
          td.symbol,
          `${td.symbol} ${dimensionName}`,
          revenue,
        );
        totalRevenue += revenue * td.price;
      }

      await PublishMetric(
        nameSpace,
        dimensionName,
        `Total`,
        `Total ${dimensionName}`,
        totalRevenue,
      );

      break;
    }

    case "fetchDeposit": {
      const dimensionName = "Deposit";
      let totalDeposit = 0;

      for (const td of tokenData) {
        const deposit = await GetTotalSupply(
          modeConstants.rpcUrl,
          td.aTokenAddress,
          ironUsdcContractAbi,
          td.symbol,
        );
        await PublishMetric(
          nameSpace,
          dimensionName,
          td.symbol,
          `${td.symbol} ${dimensionName}`,
          deposit,
        );
        totalDeposit += deposit * td.price;
      }

      await PublishMetric(
        nameSpace,
        dimensionName,
        `Total`,
        `Total ${dimensionName}`,
        totalDeposit,
      );
      
      break;
    }

    case "fetchDebt": {
      // https://docs.aave.com/developers/tokens/debttoken
      // Returns the most up to date total debt accrued by all protocol users for that specific type (stable or variable rate) of debt token.
      const dimensionName = "Debt";
      let totalDebt = 0;

      for (const td of tokenData) {
        const debt = await GetTotalSupply(
          modeConstants.rpcUrl,
          td.variableDebtTokenAddress,
          ironUsdcContractAbi,
          td.symbol,
        );
        await PublishMetric(
          nameSpace,
          dimensionName,
          td.symbol,
          `${td.symbol} ${dimensionName}`,
          debt,
        );
        totalDebt += debt * td.price;
      }

      await PublishMetric(
        nameSpace,
        dimensionName,
        `Total`,
        `Total ${dimensionName}`,
        totalDebt,
      );

      break;
    }

    case "fetchTMS": {
      const dimensionName = "TMS";
      let totalTMS = 0;

      for (const td of tokenData) {
        const deposit = await GetTotalSupply(
          modeConstants.rpcUrl,
          td.aTokenAddress,
          ironUsdcContractAbi,
          td.symbol,
        );
        const debt = await GetTotalSupply(
          modeConstants.rpcUrl,
          td.variableDebtTokenAddress,
          ironUsdcContractAbi,
          td.symbol,
        );
        const tms = deposit + debt;
        await PublishMetric(
          nameSpace,
          dimensionName,
          td.symbol,
          `${td.symbol} ${dimensionName}`,
          tms,
        );
        totalTMS += tms * td.price;
      }

      await PublishMetric(
        nameSpace,
        dimensionName,
        `Total`,
        `Total ${dimensionName}`,
        totalTMS,
      );
      
      break;
    }

    default:
      console.log(`Unknown operation: ${operation}`);
  }
};
