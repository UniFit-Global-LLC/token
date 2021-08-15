const { expect } = require("chai");

describe("UniFitToken", async function () {

  // Total Supply
  let totalSupply = ethers.BigNumber.from("500000000000000000000000000000");

  // Contract properties
  const MIN_BURN_DIVISOR = ethers.BigNumber.from("10");
  const MAX_BURN_DIVISOR = ethers.BigNumber.from("200");
  let burnDivisor = MIN_BURN_DIVISOR;

  // Declare constants
  const MISSING_ROLE_MESSAGE = "missing role";
  const BURN_MAX_MESSAGE = "Amount exceeds available burn supply";
  const BURN_UNAVAILABLE_MESSAGE = "Burn feature unavailable";

  // Declare common variables
  let owner, secondAddress, UniFitTokenContract, UniFitToken;

  before(async function () {

    // Get signers of local chain
    [owner, secondAddress] = await ethers.getSigners();

    // Deploy contract instance
    UniFitTokenContract = await ethers.getContractFactory("UniFitToken");
    UniFitToken = await UniFitTokenContract.deploy(totalSupply);
    await UniFitToken.deployed();

    // Enable transaction burn
    await UniFitToken.enableTransactionBurn();

  });

  it("should mint X number of tokens upon deploy and assign to sender/owner", async function () {

    // Assertions
    expect(await UniFitToken.totalSupply()).to.equal(totalSupply);
    expect(await UniFitToken.balanceOf(owner.address)).to.equal(totalSupply);

  });

  it("should burn some of the token for each transfer", async function () {

    // Transfer some of the tokens
    const transferAmount = ethers.BigNumber.from("10000000");
    await UniFitToken.transfer(secondAddress.address, transferAmount);

    // Calculate expected amounts amount
    const burnAmount = transferAmount.div(burnDivisor);
    const expectedTotalSupply = totalSupply.sub(burnAmount);
    const expectedSenderBalance = totalSupply.sub(transferAmount);
    const expectedReceipientBalance = transferAmount.sub(burnAmount);

    // Assertions
    expect(await UniFitToken.totalSupply()).to.equal(expectedTotalSupply);
    expect(await UniFitToken.balanceOf(owner.address)).to.equal(expectedSenderBalance);
    expect(await UniFitToken.balanceOf(secondAddress.address)).to.equal(expectedReceipientBalance);

  });

  it("should only allow admins to set the burn divisor (rate)", async function () {

    burnDivisor = ethers.BigNumber.from("12");
    let secondUserConnection = UniFitToken.connect(secondAddress);
    await expect(secondUserConnection.setBurnDivisor(burnDivisor)).to.be.revertedWith(MISSING_ROLE_MESSAGE);

  });

  it("should burn at the new burn rate when set", async function () {

    burnDivisor = ethers.BigNumber.from("12");
    totalSupply = await UniFitToken.totalSupply();
    let senderBalance = await UniFitToken.balanceOf(owner.address);
    let recipientBalance = await UniFitToken.balanceOf(secondAddress.address);

    // Set new burn divisor
    await expect(UniFitToken.setBurnDivisor(burnDivisor))
      .to.emit(UniFitToken, 'BurnDivisorChange')
      .withArgs(burnDivisor);

    // Transfer some of the tokens
    const transferAmount = ethers.BigNumber.from("10000000");
    await UniFitToken.transfer(secondAddress.address, transferAmount);

    // Calculate expected amounts amount
    const burnAmount = transferAmount.div(burnDivisor);
    const expectedTotalSupply = totalSupply.sub(burnAmount);
    const expectedSenderBalance = senderBalance.sub(transferAmount);
    const expectedReceipientBalance = recipientBalance.add(transferAmount.sub(burnAmount));

    // Assertions
    expect(await UniFitToken.totalSupply()).to.equal(expectedTotalSupply);
    expect(await UniFitToken.balanceOf(owner.address)).to.equal(expectedSenderBalance);
    expect(await UniFitToken.balanceOf(secondAddress.address)).to.equal(expectedReceipientBalance);

  });

  it("should not allow a burn divisor less than minimum", async function () {

    const newBurnDivisor = MIN_BURN_DIVISOR.sub(1);

    // Confirm divisor can be less than minium
    const expectedMessage = "Value less than min";
    await expect(UniFitToken.setBurnDivisor(newBurnDivisor)).to.be.revertedWith(expectedMessage);

  });

  it("should not allow a burn divisor to be more than maximum", async function () {

    // Set burn divisor to invaluie value
    const newBurnDivisor = MAX_BURN_DIVISOR.add(1);

    // Confirm divisor can be less than minium
    const expectedMessage = "Value more than max";
    await expect(UniFitToken.setBurnDivisor(newBurnDivisor)).to.be.revertedWith(expectedMessage);

  });

  it("should not burn when transaction burn is disabled", async function () {

    totalSupply = await UniFitToken.totalSupply();
    let senderBalance = await UniFitToken.balanceOf(owner.address);
    let recipientBalance = await UniFitToken.balanceOf(secondAddress.address);

    // Disable transaction burn
    await expect(UniFitToken.disableTransactionBurn())
      .to.emit(UniFitToken, 'TxnBurnFlagChange')
      .withArgs(false);

    // Transfer some of the tokens
    const transferAmount = ethers.BigNumber.from("10000000");
    await UniFitToken.transfer(secondAddress.address, transferAmount);

    // Calculate expected amounts amount
    const expectedSenderBalance = senderBalance.sub(transferAmount);
    const expectedReceipientBalance = recipientBalance.add(transferAmount);

    // Assertions
    expect(await UniFitToken.totalSupply()).to.equal(totalSupply);
    expect(await UniFitToken.balanceOf(owner.address)).to.equal(expectedSenderBalance);
    expect(await UniFitToken.balanceOf(secondAddress.address)).to.equal(expectedReceipientBalance);

    // Enable transaction burn
    await expect(UniFitToken.enableTransactionBurn())
      .to.emit(UniFitToken, 'TxnBurnFlagChange')
      .withArgs(true);

  });

  it("should only allow admins to disable transaction burn", async function () {

    const secondUserConnection = UniFitToken.connect(secondAddress);
    await expect(secondUserConnection.disableTransactionBurn()).to.be.revertedWith(MISSING_ROLE_MESSAGE);

  });

  it("should only allow admins to enable transaction burn", async function () {

    const secondUserConnection = UniFitToken.connect(secondAddress);
    await expect(secondUserConnection.enableTransactionBurn()).to.be.revertedWith(MISSING_ROLE_MESSAGE);

  });

  it("should allow admins to burn from wallets", async function () {

    totalSupply = await UniFitToken.totalSupply();
    const burnAmount = ethers.BigNumber.from("10000000");
    await UniFitToken.burn(burnAmount);
    expect(await UniFitToken.totalSupply()).to.equal(totalSupply.sub(burnAmount));

  });

  it("should allow only admins to burn from wallets", async function () {

    totalSupply = await UniFitToken.totalSupply();
    const burnAmount = ethers.BigNumber.from("10000000");
    const secondUserConnection = UniFitToken.connect(secondAddress);
    await expect(secondUserConnection.burn(burnAmount)).to.be.reverted;
    expect(await UniFitToken.totalSupply()).to.equal(totalSupply);

  });

  it("should resist other contracts attacks calling privileged methods", async function () {

    // Deploy attack contract
    const UniFitTokenAttackContract = await ethers.getContractFactory("UniFitTokenAttack");
    const UniFitTokenAttack = await UniFitTokenAttackContract.deploy(UniFitToken.address);
    await UniFitTokenAttack.deployed();

    // Attack Transaction Burn flag
    await expect(UniFitTokenAttack.enableTransactionBurn()).to.be.revertedWith(MISSING_ROLE_MESSAGE);
    await expect(UniFitTokenAttack.disableTransactionBurn()).to.be.revertedWith(MISSING_ROLE_MESSAGE);

    // Attack Burn Divisor
    await expect(UniFitTokenAttack.setBurnDivisor()).to.be.revertedWith(MISSING_ROLE_MESSAGE);

    // Attack Burn
    await expect(UniFitTokenAttack.burn()).to.be.revertedWith(MISSING_ROLE_MESSAGE);

  });

  it("should give us insight into gas consumption", async function () {

    for (let i = 0, j = 10, transferAmount = 0; i < 10; i++) {
      transferAmount = ethers.BigNumber.from(j**i);
      await UniFitToken.transfer(secondAddress.address, transferAmount);
    }

  });

  it("should not allow burns when total supply equals minimum supply", async function () {

    // Deploy contract instance
    const UniFitTokenContractB = await ethers.getContractFactory("UniFitToken");
    const UniFitTokenB = await UniFitTokenContract.deploy(totalSupply);
    await UniFitTokenB.deployed();

    // Burn half
    await UniFitTokenB.burn(totalSupply.div(2).add(1));

    // Burn more
    await expect(UniFitTokenB.burn(ethers.BigNumber.from(1))).to.be.revertedWith(BURN_UNAVAILABLE_MESSAGE);

  });

  it("should not allow burns exceeding the minimum supply", async function () {

    let transferAmount = await UniFitToken.balanceOf(owner.address);
    await expect(UniFitToken.burn(transferAmount)).to.be.revertedWith(BURN_MAX_MESSAGE);

  });

});
