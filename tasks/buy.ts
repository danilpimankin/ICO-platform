import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('buy', 'buy ICO tokens')
    .addParam('platform', 'platform address')
    .addParam('amount', 'Token amount')
	.setAction(async ({ platform, amount}, { ethers }) => {
        const Platform = await ethers.getContractFactory('ICOPlatform')
        const icoToken = Platform.attach(platform)

        const Token = await ethers.getContractFactory('USDtoken')
        const usd = Token.attach("0xA8cC9e3Ac9C3B171059EE5db46A02c5aA20835eD")
        const totalCost = (amount * 2) / 10 ** 12

        const contractTx1: ContractTransaction = await usd.approve(icoToken.address, totalCost);
        await contractTx1.wait();

        try
        { 
            const contractTx2: ContractTransaction = await icoToken.buyToken(amount);
            const contractReceipt: ContractReceipt = await contractTx2.wait();
            const event = contractReceipt.events?.find(event => event.event === 'BoughtTokens');
            const eBuyer: Address = event?.args!['buyer'];
            const eAmount: BigNumber = event?.args!['amount'];            
            console.log(`${eBuyer} successful buy of ${eAmount} ICO tokens!`)
        }catch(error: any) {
            console.log("ERROR:", error["reason"]);
        }
    })