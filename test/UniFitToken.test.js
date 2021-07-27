const { expect } = require("chai");

describe("UniFitToken", function () {
  it("should mint X number of tokens upon deploy and assign to sender/owner", async function () {

    // Get signers of local chain
    const [owner] = await ethers.getSigners();

    const UniFitTokenContract = await ethers.getContractFactory("UniFitToken");
    const UniFitToken = await UniFitTokenContract.deploy();
    await UniFitToken.deployed();

    const totalSupply = ethers.BigNumber.from("50000000000000000000000000000");
    expect(await UniFitToken.totalSupply()).to.equal(totalSupply);
    expect(await UniFitToken.balanceOf(owner.address)).to.equal(totalSupply);

  });
});
