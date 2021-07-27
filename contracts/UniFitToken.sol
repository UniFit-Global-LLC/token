//SPDX-License-Identifier: NOLICENSE
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract UniFitToken is ERC20, ERC20Burnable, AccessControl {
  using SafeMath for uint256;

  // Enable transaction burn by default.
  bool public transactionBurnEnabled = true;

  // Set divisor constants.
  uint256 public constant MIN_BURN_DIVISOR = 10;
  uint256 public constant MAX_BURN_DIVISOR = 200;

  // Institute a minimum supply to prevent over-deflation.
  uint256 private _minimumSupply = 2000 * (10**18);

  // Institute a minimum supply to prevent over-deflation.
  uint256 public burnDivisor = MIN_BURN_DIVISOR;

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

      if (transactionBurnEnabled && totalSupply() > _minimumSupply) {
          burnAmount = amount.div(burnDivisor);
          uint256 availableBurn = totalSupply().sub(_minimumSupply);
          if (burnAmount > availableBurn) {
              burnAmount = availableBurn;
          }
      }

      return burnAmount;
  }

  /**
    * @dev Set the burn divisor.
    *
    * Sets the burn divisor to affect burn rate.
    */
  function setBurnDivisor(uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(amount >= MIN_BURN_DIVISOR, "Value less than min");
    require(amount <= MAX_BURN_DIVISOR, "Value too large");
    burnDivisor = amount;
  }

  /**
    * @dev Enable transaction burn.
    *
    * Enables the transaction burn functionality.
    */
  function enableTransactionBurn() public onlyRole(DEFAULT_ADMIN_ROLE) {
    transactionBurnEnabled = true;
  }

  /**
    * @dev Disable transaction burn.
    *
    * Enables the transaction burn functionality.
    */
  function disableTransactionBurn() public onlyRole(DEFAULT_ADMIN_ROLE) {
    transactionBurnEnabled = false;
  }

  /**
    * @dev Destroys `amount` tokens from the caller.
    *
    * See {ERC20Burnable-_burn}.
    */
  function burn(uint256 amount) public override onlyRole(DEFAULT_ADMIN_ROLE) {
      _burn(_msgSender(), amount);
  }

  /**
    * @dev Destroys `amount` tokens from `account`, deducting from the caller's
    * allowance.
    *
    * See {ERC20Burnable-_burnFrom}
    */
  function burnFrom(address account, uint256 amount) public override onlyRole(DEFAULT_ADMIN_ROLE) {
      uint256 currentAllowance = allowance(account, _msgSender());
      require(currentAllowance >= amount, "Burn amount exceeds allowance");
      unchecked {
          _approve(account, _msgSender(), currentAllowance - amount);
      }
      _burn(account, amount);
  }

}
