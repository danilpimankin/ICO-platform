import {ethers, run, network} from 'hardhat'

const delay = async (time: number) => {
	return new Promise((resolve: any) => {
		setInterval(() => {
			resolve()
		}, time)
	})
}

async function main() {
  const name = "ICO token";
  const symbol = "ICO";

  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(name, symbol, 18);

  await myToken.deployed();

  console.log(
    `ICOtoken contract deployed to ${myToken.address}`
  );

  console.log('wait of delay...')
	await delay(15000) // delay 15 secons
	console.log('starting verify token...')
	try {
		await run('verify:verify', {
			address: myToken!.address,
			contract: 'contracts/ICOtoken.sol:ICOtoken',
			constructorArguments: [ name, symbol, 6],
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
