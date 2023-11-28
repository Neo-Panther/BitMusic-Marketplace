// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./CustomERC20.sol";

// Tokens initially assigned to this contract
// The address of this contract is the owner

contract XYZCompany {
    XYZToken immutable private token;
    address immutable private owner;
    uint256 constant private INITIAL_SUPPLY = 10000;
    mapping(address => string) private registeredCustomers;
    event Logger(uint256 prevTokens, uint256 addedTokens, uint256 spentTokens);
    event TransactionConfirmed(address customerAddress, uint256 discount);
    event TransactionRejected(address customerAddress);
    struct Purchase{
        address customerAddress;
        uint256 totalBeforeDiscount;
        bool availDiscount;
    }
    Purchase[] private pendingPurchases;
    function getPendingPurchase(uint256 index) public view returns(Purchase memory){
        require(index < pendingPurchases.length, "Index out of bounds");
        return pendingPurchases[index];
    }
    constructor() {
        token = new XYZToken(INITIAL_SUPPLY);
        owner = msg.sender;
        registeredCustomers[msg.sender] = "owner";
    }

    function startPurchase(uint256 totalBeforeDiscount, bool availDiscount) external {
        require(totalBeforeDiscount > 0, "Total should be greater than 0");
        bytes memory customerName = bytes(registeredCustomers[msg.sender]);
        require(customerName.length != 0, "Unregistered Customer");
        require(totalBeforeDiscount > 0, "Purchase must have a total greater than 0");
        // add the purchase only after basic validity checks
        pendingPurchases.push(Purchase(msg.sender, totalBeforeDiscount, availDiscount));
    }

    function registerNewCustomer(address customerAddress, string memory name) external {
        require(msg.sender == owner, "Only the owner can register new customers");
        bytes memory customerName = bytes(name);
        require(customerName.length > 0, "Name must be non-empty");
        registeredCustomers[customerAddress] = name;
    }

    function confirmPurchase(uint256 index) public returns(uint256 discount){
        require(msg.sender == owner, "Only the owner can confirm a purchase");
        require(index < pendingPurchases.length, "Index out of bounds");
        uint256 totalBeforeDiscount = pendingPurchases[index].totalBeforeDiscount;
        bool availDiscount = pendingPurchases[index].availDiscount;
        address customerAddress = pendingPurchases[index].customerAddress;
        uint256 prevTokens = token.balanceOf(customerAddress);
        uint256 newTokens = totalBeforeDiscount / 500;
        uint256 spentTokens = 0;
        if (!availDiscount || prevTokens < 5){
            discount = 0;
        } else if(10 > prevTokens &&  prevTokens >= 5) {
            discount = 5;
            spentTokens = 5;
        } else if(20 > prevTokens && prevTokens >= 10){
            discount = 10;
            spentTokens = 10;
        } else if(30 > prevTokens && prevTokens >= 20){
            discount = 20;
            spentTokens = 20;
        } else if(40 > prevTokens && prevTokens >= 30){
            discount = 35;
            spentTokens = 30;
        } else {
            discount = 50;
            spentTokens = 40;
        }
        emit Logger(prevTokens, newTokens, spentTokens);
        token.useTokens(customerAddress, spentTokens);
        token.issueTokens(customerAddress, newTokens);
        emit TransactionConfirmed(customerAddress, discount);
        pendingPurchases[index] = pendingPurchases[pendingPurchases.length-1];
        pendingPurchases.pop();
    }

    function rejectPurchase(uint256 index) public {
        require(msg.sender == owner, "Only the owner can delete a Purchase");
        require(index < pendingPurchases.length, "Index out of bounds");
        pendingPurchases[index] = pendingPurchases[pendingPurchases.length-1];
        emit TransactionRejected(pendingPurchases[index].customerAddress);
        pendingPurchases.pop();
    }

    function getRemainingTokens() public view returns(uint256) {
        return token.getRemainingTokens();
    }

    function getRemainingTokensWithAddress(address addr) public view returns(uint256) {
        return token.balanceOf(addr);
    }
}