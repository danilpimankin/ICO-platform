import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('withdraw', 'claim ICO tokens')
    .addParam('platform', 'platform address')
	.setAction(async ({ platform }, { ethers }) => {
        const Platform = await ethers.getContractFactory('ICOPlatform')
        const icoToken = Platform.attach(platform)
        try{ 
            const contractTx2: ContractTransaction = await icoToken.withdrawUSD();
            const contractReceipt: ContractReceipt = await contractTx2.wait();
            const event = contractReceipt.events?.find(event => event.event === 'WithdrawedUSDTokens');
            const eBuyer: Address = event?.args!['admin'];
            const eAmount: BigNumber = event?.args!['amount'];            
            console.log(`${eBuyer} successful withdraw of ${eAmount} ICO tokens!`)
        }catch(error: any) {
            console.log("ERROR:", error["reason"]);
        }
    })