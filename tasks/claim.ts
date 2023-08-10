import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('claim', 'claim ICO tokens')
    .addParam('platform', 'platform address')
	.setAction(async ({ platform }, { ethers }) => {
        const Platform = await ethers.getContractFactory('ICOPlatform')
        const icoToken = Platform.attach(platform)
        try{ 
            const contractTx2: ContractTransaction = await icoToken.withdrawTokens();
            const contractReceipt: ContractReceipt = await contractTx2.wait();
            const event = contractReceipt.events?.find(event => event.event === 'WithdrawedICOTokens');
            const eBuyer: Address = event?.args!['withdrawer'];
            const eAmount: BigNumber = event?.args!['amount'];            
            console.log(`${eBuyer} successful claim of ${eAmount} ICO tokens!`)
        }catch(error: any) {
            console.log("ERROR:", error["reason"]);
        }
    })