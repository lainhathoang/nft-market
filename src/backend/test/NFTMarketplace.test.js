const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe("NFTMarket", async function () {
  let deployer, addr1, addr2, nft, marketplace;
  const feePercent = 1;
  let URI = "Sample URI";

  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("NFT");
    const Marketplace = await ethers.getContractFactory("Marketplace");

    [deployer, addr1, addr2] = await ethers.getSigners();
    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(feePercent);
  });

  it("should print the contracts functions", async () => {
    console.log("======== NFT ========");
    console.log(nft);
    console.log("======== Market ========");
    console.log(marketplace);
    console.log("================");
  });

  describe("Deployment", () => {
    it("should check the name & symbol of the NFT collection", async () => {
      expect(await nft.name()).to.equal("DApp NFT");
      expect(await nft.symbol()).to.equal("DAPP");
    });

    it("fee percent should be 1 percent", async () => {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent);
    });
  });

  describe("Mintint NFTs", () => {
    it("should track each minted NFT", async () => {
      // addr1 mints an NFT
      await nft.connect(addr1).mint(URI);
      expect(await nft.tokenCount()).to.equal(1);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI(1));
      // addr2 mints an NFT
      await nft.connect(addr2).mint(URI);
      expect(await nft.tokenCount()).to.equal(2);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
      expect(await nft.tokenURI(1));
    });
  });

  describe("Making marketplace items", () => {
    beforeEach(async function () {
      // addr1 mints an NFT
      await nft.connect(addr1).mint(URI);
      // addr1 approves marketplace to spend NFT
      // approve before the contract cant grant the permission to transfer NFT
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
    });

    it("should track newly created item, transfer NFT from seller to marketplace and emit offered event", async () => {
      // addr1 offers their nft at a price of 1 ether
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1))
      )
        .to.emit(marketplace, "Offered")
        .withArgs(1, nft.address, 1, toWei(1), addr1.address);
      // owner of NFT should now be the marketplace
      expect(await nft.ownerOf(1)).to.equal(marketplace.address);
      // item count should now equal 1
      expect(await marketplace.itemCount()).to.equal(1);
      // get item from items mapping then check fields to ensure they correct
      const item = await marketplace.items(1);
      expect(item.itemId).to.equal(1);
      expect(item.nft).to.equal(nft.address);
      expect(item.tokenId).to.equal(1);
      expect(item.price).to.equal(toWei(1));
      expect(item.sold).to.equal(false);
    });

    it("should fail if price set to zero", async () => {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("Purchasing marketplace items", () => {
    let price = 2;
    let totalPriceInWei;

    beforeEach(async () => {
      // addr1 mints an nft
      await nft.connect(addr1).mint(URI);
      // addr1 approves marketplace to spend NFT
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
      // addr1 makes their nft a marketplace item
      await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price));
    });

    it("should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async () => {
      // get the initial balance of seller & feeAccount
      const sellerInitialEthBal = await addr1.getBalance();
      const feeAccountInitialEthBal = await deployer.getBalance();

      // fetch items total price (with getTotalPrice function of Marketplace contract)
      totalPriceInWei = await marketplace.getTotalPrice(1);

      // addr 2 purcheases item
      // 1. market place connects to the addr2
      // 2. call to the purchasesItem function (marketplace) - send with value of ethers equal to the price (in Wei) (2)
      // 3. emit an event (Bought)
      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei })
      )
        .to.emit(marketplace, "Bought")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(price),
          addr1.address,
          addr2.address
        );

      // get the balance of seller & feeAccount after the transaction executed
      const sellerFinalEthBal = await addr1.getBalance();
      const feeAccountFinalEthBal = await deployer.getBalance();
      // seller should receive payment for the price of the NFT sold
      // converted to the string type and execute the compare function (bignumber)
      expect(+fromWei(sellerFinalEthBal)).to.equal(
        +price + +fromWei(sellerInitialEthBal)
      );

      // calculate fee
      const fee = (feePercent / 100) * price;

      // feeAccount should receive fee
      expect(+fromWei(feeAccountFinalEthBal)).to.equal(
        +fee + +fromWei(feeAccountInitialEthBal)
      );

      // the buyder should now own the nft
      expect(await nft.ownerOf(1)).to.equal(addr2.address);

      // item should be marked as sold
      expect((await marketplace.items(1)).sold).to.equal(true);
    });

    it("should fail for invalid items ids, sold items and when not enough ether is paid", async () => {
      // index: 0
      await expect(
        marketplace.connect(addr2).purchaseItem(0, { value: totalPriceInWei })
      ).to.be.revertedWith("item doesn't exist");
      // index: 2
      await expect(
        marketplace.connect(addr2).purchaseItem(2, { value: totalPriceInWei })
      ).to.be.revertedWith("item doesn't exist");
      // not enough value
      await expect(
        marketplace.connect(addr2).purchaseItem(1, {
          value: price,
        })
      ).to.be.revertedWith(
        "not enough ether to cover item price and market fee"
      );
      // item already sold
      await marketplace
        .connect(addr2)
        .purchaseItem(1, { value: totalPriceInWei });
      // deployer try to buy the NFT, its has been sold
      await expect(
        marketplace
          .connect(deployer)
          .purchaseItem(1, { value: totalPriceInWei })
      ).to.be.revertedWith("item already sold");
    });
  });
});
