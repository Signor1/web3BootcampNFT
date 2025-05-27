// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BootcampNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    event Minted(address indexed to, uint256 indexed tokenId);

    constructor(string memory baseURI) ERC721("AnambraWeb3BootcampGraduate", "AW3BCG") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    function batchMint(address[] calldata recipients) external onlyOwner {
        require(recipients.length <= 5, "Max 5 addresses per batch");

        for (uint256 i = 0; i < recipients.length; i++) {
            _checkAddress(recipients[i]);
            uint256 tokenId = _nextTokenId++;
            _safeMint(recipients[i], tokenId);
            emit Minted(recipients[i], tokenId);
        }
    }

    function mintTo(address recipient) external onlyOwner {
        _checkAddress(recipient);
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        emit Minted(recipient, tokenId);
    }

    function _checkAddress(address recipient) internal view {
        require(balanceOf(recipient) == 0, "Address already has an NFT");
        require(recipient != address(0), "Invalid address");
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
}
