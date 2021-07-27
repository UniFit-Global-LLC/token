//SPDX-License-Identifier: NOLICENSE
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UniFitToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("UniFit Token", "UNIFT") {
        _mint(msg.sender, initialSupply);
    }
}
