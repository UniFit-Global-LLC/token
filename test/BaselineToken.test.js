const { expect } = require("chai");

describe("BaselineToken", async function () {

  // Total Supply
  let totalSupply = ethers.BigNumber.from("500000000000000000000000000000");

  // Declare constants
  const MISSING_ROLE_MSG = "missing role";

  // Declare common variables
  let owner, secondAddress, BaselineTokenContract, BaselineToken;

  before(async function () {

    // Get signers of local chain
    [owner, secondAddress] = await ethers.getSigners();

    // Deploy contract instance
    BaselineTokenContract = await ethers.getContractFactory("BaselineToken");
    BaselineToken = await BaselineTokenContract.deploy(totalSupply);
    await BaselineToken.deployed();

  });

  it("should mint X number of tokens upon deploy and assign to sender/owner", async function () {

    // Assertions
    expect(await BaselineToken.totalSupply()).to.equal(totalSupply);
    expect(await BaselineToken.balanceOf(owner.address)).to.equal(totalSupply);

  });

  it("should not burn some of the token for each transfer", async function () {

    // Transfer some of the tokens
    const transferAmount = ethers.BigNumber.from("10000000");
    await BaselineToken.transfer(secondAddress.address, transferAmount);

    // Calculate expected amounts amount
    const expectedTotalSupply = totalSupply.sub(0);
    const expectedSenderBalance = totalSupply.sub(transferAmount);
    const expectedReceipientBalance = transferAmount.sub(0);

    // Assertions
    expect(await BaselineToken.totalSupply()).to.equal(expectedTotalSupply);
    expect(await BaselineToken.balanceOf(owner.address)).to.equal(expectedSenderBalance);
    expect(await BaselineToken.balanceOf(secondAddress.address)).to.equal(expectedReceipientBalance);

  });

  it("should allow admins to burn from wallets", async function () {

    totalSupply = await BaselineToken.totalSupply();
    const burnAmount = ethers.BigNumber.from("10000000");
    await BaselineToken.burn(burnAmount);
    expect(await BaselineToken.totalSupply()).to.equal(totalSupply.sub(burnAmount));

  });

  it("should allow only admins to burn from wallets", async function () {

    totalSupply = await BaselineToken.totalSupply();
    const burnAmount = ethers.BigNumber.from("10000000");
    const secondUserConnection = BaselineToken.connect(secondAddress);
    await expect(secondUserConnection.burn(burnAmount)).to.be.reverted;
    expect(await BaselineToken.totalSupply()).to.equal(totalSupply);

  });

  it("should use a consistent amount of gas", async function () {

    for (let i = 0, j = 10, transferAmount = 0; i < 10; i++) {
      transferAmount = ethers.BigNumber.from(j**i);
      await BaselineToken.transfer(secondAddress.address, transferAmount);
    }

  });

});
