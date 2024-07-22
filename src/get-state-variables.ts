import Web3 from "web3";
import { type Contract } from "web3-eth-contract";

function CreateContractInstance(
  rpcUrl: string,
  abi: any,
  address: string,
): Contract<typeof abi> {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  return new web3.eth.Contract(abi, address);
}

async function GetBalance(
  rpcUrl: string,
  coinAddress: string,
  coinAbi: any,
  contractAddress: string,
  tokenName: string,
): Promise<number> {
  const contract = CreateContractInstance(rpcUrl, coinAbi, coinAddress);

  // Call the balanceOf function
  const balance: bigint = await contract.methods
    .balanceOf(contractAddress)
    .call();

  // Convert the balance to a readable format
  const decimals = await contract.methods.decimals().call();
  const formattedBalance = Number(balance) / Math.pow(10, Number(decimals));

  console.log(
    `Balance of address ${contractAddress}: ${formattedBalance} ${tokenName}`,
  );
  return formattedBalance;
}

async function GetTotalSupply(
  rpcUrl: string,
  address: string,
  abi: any,
  tokenName: string,
): Promise<number> {
  const contract = CreateContractInstance(rpcUrl, abi, address);

  // Call the totalSupply function
  const totalSupply: bigint = await contract.methods.totalSupply().call();

  // Convert to a readable format
  const decimals = await contract.methods.decimals().call();
  const formattedTotalSupply =
    Number(totalSupply) / Math.pow(10, Number(decimals));

  console.log(
    `Total Supply of address ${address}: ${formattedTotalSupply} ${tokenName}`,
  );
  return formattedTotalSupply;
}

export { CreateContractInstance, GetBalance, GetTotalSupply };