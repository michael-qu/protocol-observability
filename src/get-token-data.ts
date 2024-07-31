import { CreateContractInstance } from "./get-state-variables";

import { ironcladAddresses } from "./shared/ironcladAddresses";
import { modeConstants } from "./shared/modeConstants";

import { oracleAbi } from "./abi/oracle";

// Return an array from ProtocolDataProvider which includes all the addresses of all Ironclad token assets
// @param address:  The address of ProtocolDataProvider smart contract
// @param abi:      The ABI of ProtocolDataProvider smart contract
async function GetTokenData(rpcUrl: string, address: string, abi: any): Promise<TokenData[]> {
    const protocolDataProviderContract = CreateContractInstance(rpcUrl, abi, address);
    const reserveTokenAddresses: ReserveTokenAddress[] = await protocolDataProviderContract.methods.getAllReservesTokens().call();
    const tokenAddresses: TokenData[] = [];

    for (const rta of reserveTokenAddresses) {
        const tokenData: TokenData = await protocolDataProviderContract.methods.getReserveTokensAddresses(rta.tokenAddress).call();
        // Remove the period "." globally in the string, to comply with name restrictions of Terraform ("^[0-9A-Za-z_-]+$")
        // Hyphen "-" is also removed to be consistent with AToken format
        tokenData.symbol = `Iron${rta.symbol.replace(/\./g, "").replace(/-/g, "")}`;
        tokenData.reserveTokenAddress = rta.tokenAddress;
        tokenData.price = await getAssetPrice(modeConstants.rpcUrl, ironcladAddresses.Oracle, oracleAbi, rta.tokenAddress);
        tokenAddresses.push(tokenData);
    }
    return tokenAddresses;
}

// Return the price of a specific asset from Oracle
// @param address:  The address of Oracle
// @param abi:      The ABI of Oracle
async function getAssetPrice(rpcUrl: string, address: string, abi: any, assetAddress: string): Promise<number> {
    const oracleContract = CreateContractInstance(rpcUrl, abi, address);
    const BASE_CURRENCY_UNIT: bigint = await oracleContract.methods.BASE_CURRENCY_UNIT().call();
    const price: bigint = await oracleContract.methods.getAssetPrice(assetAddress).call();
    // Multiply price by 10^6 to maintain precision using BigInt
    const precisionFactor: bigint = BigInt(1000000);
    return Number(price * precisionFactor / BASE_CURRENCY_UNIT) / Number(precisionFactor);
}

// struct ProtocolDataProvider.TokenData
interface ReserveTokenAddress {
    symbol: string;
    tokenAddress: string,
}

// Includes all addresses of a specific token type
interface TokenData {
    symbol: string;
    reserveTokenAddress: string,
    aTokenAddress: string,
    variableDebtTokenAddress: string,
    price: number,  // Real-time price in USD
}

export { GetTokenData };
export type { TokenData };