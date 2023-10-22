// SPDX-License-Identifier: MITX
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    // store the baseURI of the token
    string _baseTokenURI;
    
    // declare an interface instance
    IWhitelist whitelist;
    
    // Keep track of whether or not the presale has started
    bool public presaleStarted;

    // Keep track of whether or not the presale has ended
    uint256 public presaleEnded;

    // Keep track of the maximum number of tokens
    uint256 public maxTokenIds = 20;

    // Keep track of the number of tokens minted
    uint256 public tokenIds;

    // Price for 1 nft
    uint256 public _price = 0.01 ether;

    bool public _paused;

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract is paused");
        _;
    }

    constructor(string memory baseURI, address whitelistContractAddress) ERC721("Crypto Devs", "CD") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContractAddress);
    }

    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }
 
    function presaleMint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp < presaleEnded, "Presale has ended");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not in whitelist");
        require(tokenIds < maxTokenIds, "Max token limit exceeded");
        require(msg.value >= _price, "Ether sent is not correct");

        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not yet ended");
        require(tokenIds < maxTokenIds, "Exceeded the limit");
        require(msg.value >= _price, "Ether sent is not correct");

        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    function _baseURI() internal view override returns(string memory) {
        return _baseTokenURI;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send ether");
    }


}