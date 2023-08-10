# Main information
Platform address address: [0xB2D68fF3a4EF177a8e5F12667a63C1C872378a1a](https://mumbai.polygonscan.com/address/0xB2D68fF3a4EF177a8e5F12667a63C1C872378a1a#code)

USD token: [0xA8cC9e3Ac9C3B171059EE5db46A02c5aA20835eD](https://mumbai.polygonscan.com/address/0xA8cC9e3Ac9C3B171059EE5db46A02c5aA20835eD#code)

ICO token: [0x50d7222306D973E4347f67Ef701b6718e07f0783](https://mumbai.polygonscan.com/address/0x50d7222306D973E4347f67Ef701b6718e07f0783#code)

## Installation
Clone the repository and install the dependencies using the following command:
```
npm i
```

## Deployment
Fill in the .env file and use the command:
```
npx hardhat run scripts/deployContract.ts --network polygon-mumbai
```

## Task Running
Running a buy token task: 
```
npx hardhat buy --platform 0xB2D68fF3a4EF177a8e5F12667a63C1C872378a1a --amount 100000000000000000000 --network polygon-mumbai
```
## Test Running
Running contract tests: 
```
npx hardhat test
```
![test screenshot](https://github.com/danilpimankin/ICO-platform/blob/main/screenshot.png)