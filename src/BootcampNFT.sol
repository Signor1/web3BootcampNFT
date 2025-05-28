// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract BootcampNFT is ERC721Enumerable, Ownable {
    constructor() payable ERC721("Anambra Web3 Bootcamp Graduate", "AW3BCG") Ownable(msg.sender) {}

    function mint(address recipient) external payable onlyOwner {
        _mint(recipient, totalSupply());
    }

    function batchMint(address[] calldata recipients) external payable onlyOwner {
        uint256 length = recipients.length;
        for (uint256 i; i < length;) {
            _mint(recipients[i], totalSupply());
            unchecked {
                ++i;
            }
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(
            bytes.concat(
                "{",
                '"name": "Certificate of Completion",',
                '"description": "This certificate is proudly presented by Anambra Web3 Conference for successfully completing the Annual Web3 BootCamp held in March 2025.",',
                '"image": "ipfs://QmXuUvLsit6jAdBYeN9aJ5Cr1cAcBiPAxeR3VJ1vgS5rhz",',
                '"youtube_url": "https://www.youtube.com/watch?v=AW48_8vKeCg"',
                "}"
            )
        );
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(address account, uint128 amount) internal override(ERC721Enumerable) {
        super._increaseBalance(account, amount);
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}
