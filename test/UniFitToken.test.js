const { expect } = require("chai");

describe("UniFitToken", async function () {

  // Total Supply
  let totalSupply = ethers.BigNumber.from("250000000000000000000000000000");

  // Declare common variables
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

  it("should give us insight into gas consumption", async function () {

    for (let i = 0, j = 10, transferAmount = 0; i < 10; i++) {
      transferAmount = ethers.BigNumber.from(j**i);
      await UniFitToken.transfer(secondAddress.address, transferAmount);
    }

  });

});
