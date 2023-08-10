import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";


describe("ICOPlatform contract", function () {

  let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, users: SignerWithAddress[];

  let ICOPlatform, USDtoken, ICOtoken;
  let usd: Contract;
  let ico: Contract;
  let platform: Contract; 

  let buyingEpochDuration = 14 * 24 * 60 * 60
  let milestoneDuration = 28 * 24 * 60 * 60

  beforeEach(async () => {
    [owner, user1, user2, ...users] = await ethers.getSigners();

    //deploy the test USD token
    USDtoken = await ethers.getContractFactory('MyToken');
    usd = await USDtoken.deploy("USD token", "USD", 6);

    //deploy the test ICO token
    ICOtoken = await ethers.getContractFactory('MyToken');
    ico = await ICOtoken.deploy("ICO token", "ICO", 18);

    //deploy the main contract
    ICOPlatform = await ethers.getContractFactory('ICOPlatform');
    platform = await ICOPlatform.deploy(usd.address, ico.address);

    const startTime = await time.latest()
    //mint tokens to the platform and a random user
    await usd.mint(user1.address, 10000 * 10 ** 6)
    await ico.mint(platform.address, ethers.utils.parseEther("1000"))

  })

  describe("Functionality test", async () => {
    it("test. Normal interaction with the platform", async () => {
        await usd.connect(user1)
          .approve(platform.address, 10000 * 10 ** 6)
        expect(await platform.connect(user1)
          .buyToken(ethers.utils.parseEther("500")))
          .to.emit(platform, "BoughtTokens")
          .withArgs(user1.address, ethers.utils.parseEther("500"))
        let test = {}
        test = await platform.balances(user1.address)
        // console.log(test["totalAmount"], test["claimedToken"])
        expect(test["totalAmount"], test["claimedToken"])
          .to.be.eq(ethers.utils.parseEther("500"), 0)
        await time.increase(buyingEpochDuration + milestoneDuration)
        // console.log(await platform.getAvailableAmount(user1.address))
        expect(await platform.getAvailableAmount(user1.address))
          .to.be.eq(ethers.utils.parseEther("50"))
        expect(await platform.connect(user1).withdrawTokens())
          .to.emit(platform, "WithdrawedICOTokens")
          .withArgs(user1.address, ethers.utils.parseEther("50"))
        let test1 = {}
        test1 = await platform.balances(user1.address)
        // console.log(test1["totalAmount"], test1["claimedToken"])
        expect(test1["totalAmount"], test1["claimedToken"])
          .to.be.eq(ethers.utils.parseEther("500"), ethers.utils.parseEther("50"))
        expect(await platform.withdrawUSD())
          .to.emit(platform, "WithdrawedUSDTokens")
          .withArgs(owner.address, ethers.utils.parseEther("1000"))
    })

    describe("Buying ICO tokens", async () => {
        it("test 1. Buying tokens too much", async () => {
          await usd.connect(user1)
              .approve(platform.address, ethers.utils.parseEther("10000"))
          await expect(platform.connect(user1)
            .buyToken(ethers.utils.parseEther("1001")))
            .to.be.revertedWith("ICO: not enough ICO tokens to sell")
        })

        it("test 2. Buying tokens too late", async () => {
          await usd.connect(user1)
              .approve(platform.address, ethers.utils.parseEther("10000"))
          await time.increase(buyingEpochDuration)
          await expect(platform.connect(user1)
            .buyToken(ethers.utils.parseEther("500")))
            .to.be.revertedWith("ICO: Buying phase is over")
        })
        
        it("test 3. Buying tokens without approve", async () => {
          await expect(platform.connect(user1)
            .buyToken(ethers.utils.parseEther("500")))
            .to.be.revertedWith("ICO: ICO contract isn't operator")
        })

        it("test 4. USD Balances check", async () => {
          await usd.connect(user1)
            .approve(platform.address, 10000 * 10 ** 6)
          let platformUSDTokenBalanceBerofe = await usd.balanceOf(platform.address)
          await platform.connect(user1)
            .buyToken(ethers.utils.parseEther("500"))
            let platformUSDTokenBalanceAfter = await usd.balanceOf(platform.address)
          expect(platformUSDTokenBalanceAfter)
            .to.be.eq(platformUSDTokenBalanceBerofe.add(ethers.utils.parseEther("500").mul(2).div(10 ** 12)))
        })
        
    })

    describe("Withdraw USD tokens", async () => {
        it("test 1. Withdrawal tokens too early", async () => {
          await expect(platform.connect(user1)
            .withdrawTokens())
            .to.be.revertedWith("ICO: Buying phase is not over yet")
        })
        
        it("test 2. Withdrawal tokens without unfreeze tokens", async () => {
          await usd.connect(user1)
            .approve(platform.address, ethers.utils.parseEther("10000"))
          await platform.connect(user1)
            .buyToken(ethers.utils.parseEther("500"))
          await time.increase(buyingEpochDuration)
          await expect(platform.connect(user1)
            .withdrawTokens())
            .to.be.revertedWith("ICO: You don't have unfreeze tokens right now")
        })

        it("test 3. ICO Balances check", async () => {
          await usd.connect(user1)
            .approve(platform.address, ethers.utils.parseEther("10000"))
          await platform.connect(user1)
            .buyToken(ethers.utils.parseEther("500"))
          let platformICOTokenBalanceBerofe = await ico.balanceOf(platform.address)
          await time.increase(buyingEpochDuration + milestoneDuration)
          await platform.connect(user1).withdrawTokens()
          let platformUSDTokenBalanceAfter = await ico.balanceOf(platform.address)
          expect(platformUSDTokenBalanceAfter)
            .to.be.eq(platformICOTokenBalanceBerofe.sub(ethers.utils.parseEther("50")))
        })

        it("test 4. Full withdraw tokens", async () => {
          await usd.connect(user1)
            .approve(platform.address, ethers.utils.parseEther("10000"))
          await platform.connect(user1)
            .buyToken(ethers.utils.parseEther("500"))
          let platformICOTokenBalanceBerofe = await ico.balanceOf(platform.address)
          await time.increase(buyingEpochDuration + 10 * milestoneDuration)
          expect(await platform.connect(user1).withdrawTokens())
            .to.emit(platform, "WithdrawedICOTokens")
            .withArgs(user1.address, ethers.utils.parseEther("500"))
          let platformUSDTokenBalanceAfter = await ico.balanceOf(platform.address)
          expect(platformUSDTokenBalanceAfter)
            .to.be.eq(platformICOTokenBalanceBerofe.sub(ethers.utils.parseEther("500")))
          let test = {}
          test = await platform.balances(user1.address)
          // console.log(test["totalAmount"], test["claimedToken"])
          expect(test["totalAmount"])
            .to.be.eq(test["claimedToken"])
        })
    })

    describe("Withdraw ICO tokens", async () => {
        it("test 1. Withdraw USD tokens by a random user", async () => {
          await expect(platform.connect(user1)
            .withdrawUSD())
            .to.be.reverted
        })

        it("test 2. USD tokens balance check", async () => {
          await usd.connect(user1)
            .approve(platform.address, ethers.utils.parseEther("10000"))
          await platform.connect(user1)
            .buyToken(ethers.utils.parseEther("500"))
          let platformICOTokenBalanceBerofe = await usd.balanceOf(owner.address)
          await platform.withdrawUSD()
          let platformUSDTokenBalanceAfter = await usd.balanceOf(owner.address)
          expect(platformUSDTokenBalanceAfter)
            .to.be.eq(platformICOTokenBalanceBerofe.add(ethers.utils.parseEther("500").mul(2).div(10 ** 12)))
        })
    })
  })
})

