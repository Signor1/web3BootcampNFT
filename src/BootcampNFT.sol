// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract BootcampNFT is ERC721Enumerable, Ownable {
    constructor() ERC721("Anambra Web3 Bootcamp Graduate", "AW3BCG") Ownable(msg.sender) {}

    function mint(address recipient) external onlyOwner {
        _safeMint(recipient, totalSupply());
    }

    function batchMint(address[] calldata recipients) external onlyOwner {
        for (uint256 i; i < recipients.length;) {
            _safeMint(recipients[i], totalSupply());
            unchecked {
                ++i;
            }
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(
            abi.encodePacked(
                "{",
                '"name": "Certificate of Completion",',
                '"description": "This certificate is proudly presented by Anambra Web3 Conference for successfully completing the Annual Web3 BootCamp held in March 2025.",',
                '"image": "ipfs://QmXuUvLsit6jAdBYeN9aJ5Cr1cAcBiPAxeR3VJ1vgS5rhz",',
                '"youtube_url": "https://www.youtube.com/@AnambraTechiesCommunity"',
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
