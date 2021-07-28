// SPDX-License-Identifier: NOLICENSE
pragma solidity ^0.8.0;

import "./UniFitToken.sol";

contract UniFitTokenAttack {

  address public tokenContract;

  constructor(address target) {
    tokenContract = target;
  }

  function disableTransactionBurn() public {
    UniFitToken token = UniFitToken(tokenContract);
    token.disableTransactionBurn();
  }

  function enableTransactionBurn() public {
    UniFitToken token = UniFitToken(tokenContract);
    token.enableTransactionBurn();
  }

  function setBurnDivisor() public {
    UniFitToken token = UniFitToken(tokenContract);
    token.setBurnDivisor(uint256(10));
  }

  function burn() public {
    UniFitToken token = UniFitToken(tokenContract);
    token.burn(uint256(1000));
  }

}
