const { expect } = require("chai");

describe("UniFitToken", function () {
  // Total Supply
  const totalSupply = ethers.BigNumber.from("50000000000000000000000000000");

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
    const burnAmount = transferAmount.div(100);
    const expectedTotalSupply = totalSupply.sub(burnAmount);
    const expectedSenderBalance = totalSupply.sub(transferAmount);
    const expectedReceipientBalance = transferAmount.sub(burnAmount);
    // Assertions
    expect(await UniFitToken.totalSupply()).to.equal(expectedTotalSupply);
    expect(await UniFitToken.balanceOf(owner.address)).to.equal(expectedSenderBalance);
    expect(await UniFitToken.balanceOf(secondAddress.address)).to.equal(expectedReceipientBalance);
  });
});
