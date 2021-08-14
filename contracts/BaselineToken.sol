//SPDX-License-Identifier: NOLICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BaselineToken is ERC20, ERC20Burnable, AccessControl {

  // Override unit256 with safe alternative.
  using SafeMath for uint256;

  /**
    * @dev Constructor.
    *
    * Constructor method used in deployment.
    */
  constructor(uint256 initialSupply) ERC20("UniFit Token", "UNIFT") {
      _mint(msg.sender, initialSupply);
      _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /**
    * @dev Destroys `amount` tokens from the caller.
    *
    * See {ERC20Burnable-_burn}.
    */
  function burn(uint256 amount) public override onlyRole(DEFAULT_ADMIN_ROLE) {
      super.burn(amount);
  }

  /**
    * @dev Destroys `amount` tokens from `account`, deducting from the caller's
    * allowance.
    *
    * See {ERC20Burnable-_burnFrom}
    */
  function burnFrom(address account, uint256 amount) public override onlyRole(DEFAULT_ADMIN_ROLE) {
      super.burnFrom(account, amount);
  }

}
