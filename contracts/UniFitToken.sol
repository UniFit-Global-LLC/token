//SPDX-License-Identifier: NOLICENSE
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract UniFitToken is ERC20, ERC20Burnable {
  using SafeMath for uint256;

  constructor(uint256 initialSupply) ERC20("UniFit Token", "UNIFT") {
      _mint(msg.sender, initialSupply);
  }

  // Institute a minimum supply to prevent over-deflation.
  uint256 private _minimumSupply = 2000 * (10**18);

  /**
    * @dev See {ERC20-transfer}.
    *
    * Implements transfer with burn.
    */
  function transfer(address to, uint256 amount)
      public
      override
      returns (bool)
  {
      return super.transfer(to, _partialBurn(amount));
  }

  /**
    * @dev See {ERC20-transferFrom}.
    *
    * Implements transfer with burn.
    */
  function transferFrom(
      address from,
      address to,
      uint256 amount
  ) public override returns (bool) {
      return super.transferFrom(from, to, _partialBurn(amount));
  }

  /**
    * @dev Handle the burn.
    *
    * Used to handle burn activities and return a burned amount.
    */
  function _partialBurn(uint256 amount) internal returns (uint256) {
      uint256 burnAmount = _calculateBurnAmount(amount);

      if (burnAmount > 0) {
          _burn(msg.sender, burnAmount);
      }

      return amount.sub(burnAmount);
  }

  /**
    * @dev Calculate the burn.
    *
    * Evaluate transfer amount to determine desired burn.
    */
  function _calculateBurnAmount(uint256 amount)
      internal
      view
      returns (uint256)
  {
      uint256 burnAmount = 0;

      if (totalSupply() > _minimumSupply) {
          burnAmount = amount.div(100);
          uint256 availableBurn = totalSupply().sub(_minimumSupply);
          if (burnAmount > availableBurn) {
              burnAmount = availableBurn;
          }
      }

      return burnAmount;
  }
}
