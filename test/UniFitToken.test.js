const { expect } = require("chai");

describe("UniFitToken", function () {

  // Total Supply
  let totalSupply = ethers.BigNumber.from("50000000000000000000000000000");

  // Declare consts
  let owner, secondAddress, UniFitTokenContract, UniFitToken;

  before(async function () {

    // Get signers of local chain
    [owner, secondAddress] = await ethers.getSigners();

    // Deploy contract instance
    UniFitTokenContract = await ethers.getContractFactory("UniFitToken");
    UniFitToken = await UniFitTokenContract.deploy(totalSupply);
    await UniFitToken.deployed();

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
    const burnAmount = transferAmount.div(await UniFitToken.burnDivisor());
    const expectedTotalSupply = totalSupply.sub(burnAmount);
    const expectedSenderBalance = totalSupply.sub(transferAmount);
    const expectedReceipientBalance = transferAmount.sub(burnAmount);

    // Assertions
    expect(await UniFitToken.totalSupply()).to.equal(expectedTotalSupply);
    expect(await UniFitToken.balanceOf(owner.address)).to.equal(expectedSenderBalance);
    expect(await UniFitToken.balanceOf(secondAddress.address)).to.equal(expectedReceipientBalance);

  });

  it("should only allow admins to set the burn divisor (rate)", async function () {

    const newBurnDivisor = ethers.BigNumber.from("12");
    let secondUserConnection = UniFitToken.connect(secondAddress);
    await expect(secondUserConnection.setBurnDivisor(newBurnDivisor)).to.be.reverted;

  });

  it("should burn at the new burn rate when set", async function () {

    const newBurnDivisor = ethers.BigNumber.from("12");
    totalSupply = await UniFitToken.totalSupply();
    let senderBalance = await UniFitToken.balanceOf(owner.address);
    let recipientBalance = await UniFitToken.balanceOf(secondAddress.address);

    // Set new burn divisor
    UniFitToken.setBurnDivisor(newBurnDivisor);

    // Transfer some of the tokens
    const transferAmount = ethers.BigNumber.from("10000000");
    await UniFitToken.transfer(secondAddress.address, transferAmount);

    // Calculate expected amounts amount
    const burnAmount = transferAmount.div(newBurnDivisor);
    const expectedTotalSupply = totalSupply.sub(burnAmount);
    const expectedSenderBalance = senderBalance.sub(transferAmount);
    const expectedReceipientBalance = recipientBalance.add(transferAmount.sub(burnAmount));

    // Assertions
    expect(await UniFitToken.totalSupply()).to.equal(expectedTotalSupply);
    expect(await UniFitToken.balanceOf(owner.address)).to.equal(expectedSenderBalance);
    expect(await UniFitToken.balanceOf(secondAddress.address)).to.equal(expectedReceipientBalance);

  });

  it("should not allow a burn divisor less than minimum", async function () {

    const newBurnDivisor = (await UniFitToken.MIN_BURN_DIVISOR()).sub(1);

    // Confirm divisor can be less than minium
    await expect(UniFitToken.setBurnDivisor(newBurnDivisor)).to.be.reverted;

  });

  it("should not allow a burn divisor to be more than supply", async function () {

    // Set burn divisor to invaluie value
    const newBurnDivisor = (await UniFitToken.MAX_BURN_DIVISOR()).add(1);

    // Confirm divisor can be less than minium
    await expect(UniFitToken.setBurnDivisor(newBurnDivisor)).to.be.reverted;

  });

  it("should not burn when transaction burn is disabled", async function () {

    totalSupply = await UniFitToken.totalSupply();
    let senderBalance = await UniFitToken.balanceOf(owner.address);
    let recipientBalance = await UniFitToken.balanceOf(secondAddress.address);

    // Disable transaction burn
    await UniFitToken.disableTransactionBurn();

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

  });

  it("should only allow admins to disable trasnaction burn", async function () {

    const secondUserConnection = UniFitToken.connect(secondAddress);
    await expect(secondUserConnection.disableTransactionBurn()).to.be.reverted;

  });

  it("should only allow admins to disable trasnaction burn", async function () {

    const secondUserConnection = UniFitToken.connect(secondAddress);
    await expect(secondUserConnection.enableTransactionBurn()).to.be.reverted;

  });

  it("should allow admins to burn from the total supply", async function () {

    totalSupply = await UniFitToken.totalSupply();
    const burnAmount = ethers.BigNumber.from("10000000");
    await UniFitToken.burn(burnAmount);
    expect(await UniFitToken.totalSupply()).to.equal(totalSupply.sub(burnAmount));

  });

  it("should allow only admins to burn from the total supply", async function () {

    totalSupply = await UniFitToken.totalSupply();
    const burnAmount = ethers.BigNumber.from("10000000");
    const secondUserConnection = UniFitToken.connect(secondAddress);
    await expect(secondUserConnection.burn(burnAmount)).to.be.reverted;
    expect(await UniFitToken.totalSupply()).to.equal(totalSupply);

  });

});
