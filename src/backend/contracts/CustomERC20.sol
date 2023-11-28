// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Tokens after use assigned to this contract

contract XYZToken is ERC20 {
    address immutable public owner;
    event TokensFinished();
    constructor(uint _supply) ERC20 ("XYZ Coin", "XYZ") {
        owner = msg.sender;
        _mint(msg.sender, _supply);
    }

    function getRemainingTokens() public view returns(uint256){
        return balanceOf(owner);
    }

    function useTokens(address customerAddress, uint256 amount) external {
        require(msg.sender == owner, "Tokens can be transferred only after company's verificaton.");
        if (amount > 0){
            // this function checks if the customerAddress has enough tokens
            _transfer(customerAddress, address(this), amount);
        }
    }

    function issueTokens(address customerAddress, uint256 amount) external {
        require(msg.sender == owner, "Only the company can issue tokens");
        uint256 remainingSupply = getRemainingTokens();
        if (amount > remainingSupply){
            if (remainingSupply > 0){
                _transfer(owner, customerAddress, remainingSupply);
            }
            emit TokensFinished();
        } else {
            _transfer(owner, customerAddress, amount);
        }
    }
}