import Web3 from 'web3';

async function GetBalance(rpcUrl: string, coinAddress: string, coinAbi: any, contractAddress: string): Promise<number> {
    try {
        // Create a Web3 instance to connect to the blockchain
        const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

        // Get the contract instance
        const contract = new web3.eth.Contract(coinAbi, coinAddress);

        // Call the balanceOf function
        const balance: bigint = await contract.methods.balanceOf(contractAddress).call();

        // Convert the balance to a readable format
        const formattedBalance = Number(balance) / 1e6;

        console.log(`Balance of address ${contractAddress}: ${formattedBalance}`);
        return formattedBalance;
    } catch (error) {
        console.error("Error checking balance:", error);
        return -1;
    }
}

export { GetBalance };
