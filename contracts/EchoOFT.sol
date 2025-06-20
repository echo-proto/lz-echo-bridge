// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract EchoOFT is OFT, Pausable {
     // Blacklist
    mapping(address => bool) public isBlackListed;
    string private __symbol;

    event SetBlackList(address account, bool state);

    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) Ownable(_delegate) {
        __symbol = _symbol;
    }

    function decimals() public pure override returns (uint8) {
        return 8;
    }

    function sharedDecimals() public pure override returns (uint8) {
        return 8;
    }
    
    function renameSymbol(string memory _symbol) external onlyOwner {
        __symbol = _symbol;
    }

    function symbol() public view override returns (string memory) {
        return __symbol;
    }

    // Blacklist restrict from-address, contains(burn's from-address)
    function _update(address from, address to, uint256 value) override internal whenNotPaused {
        require(!isBlackListed[from], "from is in blackList");
        super._update(from, to, value);
    }

    function setBlackList(address account, bool state) external onlyOwner {
        isBlackListed[account] = state;
        emit SetBlackList(account, state);
    }

    function setPaused(bool _paused) external onlyOwner {
        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }
}
