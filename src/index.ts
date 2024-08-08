import type { Handler, Context } from "aws-lambda";

import { GetTokenData } from "./get-token-data";
import type { TokenData } from "./get-token-data";
import { FetchRawTransferEvent } from "./get-events";
import { GetBalance, GetTotalSupply } from "./get-state-variables";
import { PublishMetric } from "./aws/publish-metric";
// import { GetRecentTxnURLWithLargestAmount } from "./get-recent-txn-with-largest-amount";

import { modeConstants } from "./shared/modeConstants";
import { ironcladAddresses } from "./shared/ironcladAddresses";

import { protocolDataProviderAbi } from "./abi/protocol-data-provider"
import { reserveContractAbi } from "./abi/reserve";
import { ironATokenContractAbi } from "./abi/iron-atoken";

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
        ironATokenContractAbi,
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
          reserveContractAbi,
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
          ironATokenContractAbi,
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
          ironATokenContractAbi,
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
          ironATokenContractAbi,
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
          ironATokenContractAbi,
          td.symbol,
        );
        const debt = await GetTotalSupply(
          modeConstants.rpcUrl,
          td.variableDebtTokenAddress,
          ironATokenContractAbi,
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

    // case "searchAnomaly": {
    //   const assetName = event.payload.assetName;
    //   const txnHash = await GetRecentTxnURLWithLargestAmount(modeConstants.rpcUrl, tokenData, assetName, modeConstants.MAX_RANGE);
    //   console.log(`${modeConstants.txAddressPrefix}${txnHash}`);
    //   break;
    // }

    default:
      console.log(`Unknown operation: ${operation}`);
  }
};
