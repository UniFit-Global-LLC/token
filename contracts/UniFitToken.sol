//SPDX-License-Identifier: NOLICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UniFitToken is ERC20 {

  // Set constants.
  string private constant TOKEN_NAME = "UniFit Token";
  string private constant TOKEN_SYMBOL = "UNIFIT";

  /**
    * @dev Constructor.
    *
    * Constructor method used in deployment.
    */
  constructor(uint256 initialSupply) ERC20(TOKEN_NAME, TOKEN_SYMBOL) {
    _mint(msg.sender, initialSupply);
  }

}
