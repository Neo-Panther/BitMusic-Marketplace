// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard {
  // Variables
  address payable public immutable hostAcc; // account that receives fee percentage fees
  uint public immutable hostFeePercent; // fee percentage on each release: discourages spam and rewards the platform creator
  uint public releaseCount; 

  struct Release {
    uint releaseId;
    IERC721 musicnft;
    uint tokenId;
    uint price;
    address payable seller;
    bool sold;
  }

  // releaseId -> Release
  mapping(uint => Release) public releases;

  event Offered(
    uint releaseId,
    address indexed musicnft,
    uint tokenId,
    uint price,
    address indexed seller
  );
  event Bought(
    uint releaseId,
    address indexed musicnft,
    uint tokenId,
    uint price,
    address indexed seller,
    address indexed buyer
  );

  constructor(uint _hostFeePercent) {
    hostAcc = payable(msg.sender);
    hostFeePercent = _hostFeePercent;
  }

  // Make release to offer on the marketplace
  function makeRelease(IERC721 _musicnft, uint _tokenId, uint _price) external nonReentrant {
    require(_price > 0, "Price must be greater than zero");
    releaseCount ++;
    // transfer musicnft
    _musicnft.transferFrom(msg.sender, address(this), _tokenId);
    // add new release to releases mapping
    releases[releaseCount] = Release (
      releaseCount,
      _musicnft,
      _tokenId,
      _price,
      payable(msg.sender),
      false
    );
    // emit Offered event
    emit Offered(
      releaseCount,
      address(_musicnft),
      _tokenId,
      _price,
      msg.sender
    );
  }
  function purchaseRelease(uint _releaseId) external payable nonReentrant {
    uint _totalPrice = getTotalPrice(_releaseId);
    Release storage release = releases[_releaseId];
    require(_releaseId > 0 && _releaseId <= releaseCount, "release doesn't exist");
    require(msg.value >= _totalPrice, "not enough ether to cover release price and market fee");
    require(!release.sold, "release already sold");
    // pay seller and feeAccount
    release.seller.transfer(release.price);
    hostAcc.transfer(_totalPrice - release.price);
    // update release to sold
    release.sold = true;
    // transfer musicnft to buyer
    release.musicnft.transferFrom(address(this), msg.sender, release.tokenId);
    // emit Bought event
    emit Bought(
      _releaseId,
      address(release.musicnft),
      release.tokenId,
      release.price,
      release.seller,
      msg.sender
    );
  }

  function getTotalPrice(uint _releaseId) view public returns(uint){
    return((releases[_releaseId].price*(100 + hostFeePercent))/100);
  }
}
