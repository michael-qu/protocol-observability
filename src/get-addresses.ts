import { CreateContractInstance } from "./get-state-variables";

async function GetTokenAddresses(rpcUrl: string, address: string, abi: any): Promise<TokenAddresses[]> {
    const contract = CreateContractInstance(rpcUrl, abi, address);
    const reserveTokenAddresses: ReserveTokenAddress[] = await contract.methods.getAllReservesTokens().call();
    let tokenAddresses: TokenAddresses[] = [];

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

interface TokenAddresses {
    symbol: string;
    reserveTokenAddress: string,
    aTokenAddress: string,
    variableDebtTokenAddress: string
}

export { GetTokenAddresses, TokenAddresses };