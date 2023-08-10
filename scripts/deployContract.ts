import {ethers, run, network} from 'hardhat'

const delay = async (time: number) => {
	return new Promise((resolve: any) => {
		setInterval(() => {
			resolve()
		}, time)
	})
}

async function main() {
  const USDtoken = "0xA8cC9e3Ac9C3B171059EE5db46A02c5aA20835eD"
  const ICOtoken = "0x50d7222306D973E4347f67Ef701b6718e07f0783"


  const ICOPlatform = await ethers.getContractFactory("ICOPlatform");
  const platform = await ICOPlatform.deploy(USDtoken, ICOtoken);

  await platform.deployed();

  console.log(
    `Platform contract deployed to ${platform.address}`
  );

  console.log('wait of delay...')
	await delay(15000) // delay 15 secons
	console.log('starting verify contract...')
	try {
		await run('verify:verify', {
			address: platform!.address,
			contract: 'contracts/ICOPlatform.sol:ICOPlatform',
			constructorArguments: [ USDtoken, ICOtoken ],
		});
		console.log('verify success')
	} catch (e: any) {
		console.log(e.message)
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
