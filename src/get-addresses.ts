import { CreateContractInstance } from "./get-state-variables";

// Return an array which includes all the addresses of all Ironclad token assets
// @param address:  The address of ProtocolDataProvider smart contract
// @param abi:      The ABI of ProtocolDataProvider smart contract
async function GetTokenAddresses(rpcUrl: string, address: string, abi: any): Promise<TokenAddresses[]> {
    const contract = CreateContractInstance(rpcUrl, abi, address);
    const reserveTokenAddresses: ReserveTokenAddress[] = await contract.methods.getAllReservesTokens().call();
    const tokenAddresses: TokenAddresses[] = [];

    for (const rta of reserveTokenAddresses) {
        const ta: TokenAddresses = await contract.methods.getReserveTokensAddresses(rta.tokenAddress).call();
        ta.symbol = `Iron${rta.symbol}`;
        ta.reserveTokenAddress = rta.tokenAddress;
        tokenAddresses.push(ta);
    }
    return tokenAddresses;
}


// struct ProtocolDataProvider.TokenData
interface ReserveTokenAddress {
    symbol: string;
    tokenAddress: string,
}

// Includes all addresses of a specific token type
interface TokenAddresses {
    symbol: string;
    reserveTokenAddress: string,
    aTokenAddress: string,
    variableDebtTokenAddress: string
}

export { GetTokenAddresses };
export type { TokenAddresses };