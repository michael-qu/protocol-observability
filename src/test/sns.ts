// Unit test for ../aws/sns.ts

import { GetTokenData } from "../get-token-data";
import type { TokenData } from "../get-token-data";
import { GetRecentTxnHashWithLargestAmount } from "../get-events";
import { PublishMessage } from "../aws/sns";

import { modeConstants } from "../shared/modeConstants";
import { ironcladAddresses } from "../shared/ironcladAddresses";
import { awsConstants } from "../shared/awsConstants";

import { protocolDataProviderAbi } from "../abi/protocol-data-provider";

async function main(): Promise<void> {
    const assetName = "IronUSDC";
    const topicArn = awsConstants.topicArn;

    const tokenData: TokenData[] = await GetTokenData(modeConstants.rpcUrl, ironcladAddresses.ProtocolDataProvider, protocolDataProviderAbi);
    const txnHash = await GetRecentTxnHashWithLargestAmount(modeConstants.rpcUrl, tokenData, assetName, modeConstants.MAX_RANGE);
    const url = `${modeConstants.txAddressPrefix}${txnHash}`;
    const subject = `${assetName} Transaction Found Related to Recent Alarm`;
    const message = `Hi we notice that there is an alarm triggered by our anomaly detection algorithm. The URL of the relevant ${assetName} transaction is ${url} for your reference. Thank you.`;
    
    await PublishMessage(subject, message, topicArn);
    console.log(`Email notification is sent to SNS topic ${topicArn}`);
    console.log(`Email content: ${message}`);
}

main().then(() => {
    console.log("Main function executed successfully.");
}).catch((error) => {
    console.error("Error during main execution:", error);
});