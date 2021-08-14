//SPDX-License-Identifier: NOLICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract UniFitToken is ERC20, ERC20Burnable, AccessControl {

  // Burn Divisor Change Event.
  event BurnDivisorChange(uint256 divisor);

  // Transaction Burn Flag Change Event.
  event TxnBurnFlagChange(bool flag);

  // Disable transaction burn by default.
  bool private transactionBurnEnabled = false;

  // Set divisor constants.
  uint256 private constant MIN_BURN_DIVISOR = 10;
  uint256 private constant MAX_BURN_DIVISOR = 200;
  uint256 private constant MIN_SUPPLY_DIVISOR = 2;
  string private constant TOKEN_NAME = "UniFit Token";
  string private constant TOKEN_SYMBOL = "UNIFT";
  string private constant MIN_MESSAGE = "Value less than min";
  string private constant MAX_MESSAGE = "Value more than max";
  string private constant BURN_MAX_MESSAGE = "Amount exceeds available burn supply";

  // Institute a minimum supply to prevent over-deflation.
  uint256 private _minimumSupply;

  // Institute a minimum supply to prevent over-deflation.
  uint256 private burnDivisor = MIN_BURN_DIVISOR;

  /**
    * @dev Constructor.
    *
    * Constructor method used in deployment.
    */
  constructor(uint256 initialSupply) ERC20(TOKEN_NAME, TOKEN_SYMBOL) {
    _mint(msg.sender, initialSupply);
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _minimumSupply = initialSupply / MIN_SUPPLY_DIVISOR;
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
          super._burn(msg.sender, burnAmount);
      }

      return amount - burnAmount;
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
      burnAmount = amount / burnDivisor;
      uint256 availableBurn = totalSupply() - _minimumSupply;
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
  function setBurnDivisor(uint256 divisor) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(divisor >= MIN_BURN_DIVISOR, MIN_MESSAGE);
    require(divisor <= MAX_BURN_DIVISOR, MAX_MESSAGE);
    burnDivisor = divisor;
    emit BurnDivisorChange(divisor);
  }

  /**
    * @dev Enable transaction burn.
    *
    * Enables the transaction burn functionality.
    */
  function enableTransactionBurn() public onlyRole(DEFAULT_ADMIN_ROLE) {
    transactionBurnEnabled = true;
    emit TxnBurnFlagChange(transactionBurnEnabled);
  }

  /**
    * @dev Disable transaction burn.
    *
    * Enables the transaction burn functionality.
    */
  function disableTransactionBurn() public onlyRole(DEFAULT_ADMIN_ROLE) {
    transactionBurnEnabled = false;
    emit TxnBurnFlagChange(transactionBurnEnabled);
  }

  /**
    * @dev Check Burn Supply.
    *
    * Checks.
    */
  function checkBurnSupply(uint256 amount) internal view {
    require((totalSupply() - _minimumSupply) > amount, BURN_MAX_MESSAGE);
  }

  /**
    * @dev Destroys `amount` tokens from the caller.
    *
    * See {ERC20Burnable-_burn}.
    */
  function burn(uint256 amount) public override onlyRole(DEFAULT_ADMIN_ROLE) {
    checkBurnSupply(amount);
    super.burn(amount);
  }

  /**
    * @dev Destroys `amount` tokens from `account`, deducting from the caller's
    * allowance.
    *
    * See {ERC20Burnable-_burnFrom}
    */
  function burnFrom(address account, uint256 amount) public override onlyRole(DEFAULT_ADMIN_ROLE) {
    checkBurnSupply(amount);
    super.burnFrom(account, amount);
  }

}
