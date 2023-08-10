// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract ICOPlatform is AccessControl {
    /*
    * Storage.
    */
    IERC20 USDtoken;
    IERC20 ICOtoken;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct User {
        uint256 totalAmount;
        uint256 claimedToken;
    }
    
    uint256 ICOstartTime;
    uint32 milestoneDuration = 4 weeks;
    uint8[4] public milestoneProcents = [10, 30, 50, 100]; // 10%, 30%, 50%, 100%

    mapping(address => User) public balances;

    /*
    *Events
    */
    event BoughtTokens(address indexed buyer, uint256 amount);
    event WithdrawedUSDTokens(address indexed withdrawer, uint256 amount);
    event WithdrawedICOTokens(address indexed admin, uint256 amount);

    /*
    * Constructor.
    */
    constructor(address _USDtoken, address _ICOtoken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        ICOstartTime = block.timestamp + 14 days;
        USDtoken = IERC20(_USDtoken);
        ICOtoken = IERC20(_ICOtoken);
    }

    ///@dev Make an investmant.
    ///@param amount - amount of buying ICO token. Ratio 1 ICO:2 USD
    function buyToken(uint256 amount) external {
        uint256 totalCost = (amount * 2) / (10 ** 12);
        require(USDtoken.balanceOf(msg.sender) >= totalCost, "ICO: not enough USD tokens");
        require(USDtoken.allowance(msg.sender, address(this)) >= totalCost, "ICO: ICO contract isn't operator");
        require(ICOtoken.balanceOf(address(this)) >= amount, "ICO: not enough ICO tokens to sell");
        require(block.timestamp <= ICOstartTime, "ICO: Buying phase is over");

        USDtoken.transferFrom(msg.sender, address(this), totalCost);
        balances[msg.sender].totalAmount += amount;
        emit BoughtTokens(msg.sender, amount);
    }

    ///@dev The function which withdraws ICO tokens to the user's address.
    function withdrawTokens() external {
        require(block.timestamp > ICOstartTime, "ICO: Buying phase is not over yet");
        uint256 unfreezeToken = getAvailableAmount(msg.sender);
        require(unfreezeToken > 0, "ICO: You don't have unfreeze tokens right now");

        balances[msg.sender].claimedToken += unfreezeToken;
        ICOtoken.transfer(msg.sender, unfreezeToken);
        emit WithdrawedICOTokens(msg.sender, unfreezeToken);
    }


    ///@dev Calculates how many tokens user can spends.
    ///@param user - User address
    ///@return unfreezeToken - Amount of tokens the user can spends
    function getAvailableAmount(address user) public view returns(uint256 unfreezeToken) {
        uint256 milestoneCount = (block.timestamp - ICOstartTime) / milestoneDuration;
        if (milestoneCount > 4) milestoneCount = 4;
        if (milestoneCount == 0) return 0;
        return (balances[user].totalAmount * milestoneProcents[milestoneCount - 1]  / 100) - balances[user].claimedToken;
    }

    ///@dev The function which withdraws USD tokens to the admin's address.
    function withdrawUSD() onlyRole(ADMIN_ROLE) external {
        uint256 amount = USDtoken.balanceOf(address(this));
        USDtoken.transfer(msg.sender, amount);
        emit WithdrawedUSDTokens(msg.sender, amount);
    }
}