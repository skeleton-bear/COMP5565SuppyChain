const { ethers } = require("hardhat");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const { expect } = chai;

describe("LuxuryNFT and LuxuryNFTStorage", function () {
  let nftContract, storageContract;
  let owner, user;

  before(async () => {
    [owner, user] = await ethers.getSigners();
    console.log("Signers initialized:", {
      owner: owner.address,
      user: user.address,
    });

    const LuxuryNFTStorage = await ethers.getContractFactory("LuxuryNFTStorage");
    storageContract = await LuxuryNFTStorage.deploy();
    await storageContract.deployed();
    console.log("LuxuryNFTStorage deployed at:", storageContract.address);

    const LuxuryNFT = await ethers.getContractFactory("LuxuryNFT");
    nftContract = await LuxuryNFT.deploy();
    await nftContract.deployed();
    console.log("LuxuryNFT deployed at:", nftContract.address);

    await storageContract.transferOwnership(nftContract.address);
    await nftContract.connect(owner).setStorageContract(storageContract.address);
  });

  it("Should mint an NFT", async function () {
    const uri = "ipfs://example-uri";
    console.log("Calling mint function...");
    await nftContract.connect(owner).mint(user.address, uri);

    const ownerOfToken = await nftContract.ownerOf(0);
    expect(ownerOfToken).to.equal(user.address);
  });

  it("Should add lifecycle events through NFT contract", async function () {
    console.log("Adding lifecycle event...");
    await nftContract.connect(owner).addLifecycleEvent(0, "Event description");

    const events = await storageContract.getLifecycleEvents(0);
    expect(events).to.include("Event description");
  });

  after(async function() {
    console.log("\n=== Contract Information ===");
    console.log("NFT Contract Address:", nftContract.address);
    console.log("Storage Contract Address:", storageContract.address);
    console.log("\n=== NFT Details ===");
    console.log("Token Owner:", await nftContract.ownerOf(0));
    console.log("Token URI:", await nftContract.tokenURI(0));
    
    console.log("\n=== Storage Contract Details ===");
    console.log("Storage Contract Owner:", await storageContract.owner());
    console.log("Lifecycle Events for Token 0:", await storageContract.getLifecycleEvents(0));
    
    console.log("\n=== How to View These Contracts ===");
    console.log("1. Local Hardhat Network:");
    console.log(`   NFT Contract: npx hardhat verify ${nftContract.address}`);
    console.log(`   Storage Contract: npx hardhat verify ${storageContract.address}`);
    console.log("\n2. Etherscan (if deployed to mainnet/testnet):");
    console.log(`   NFT Contract: https://etherscan.io/address/${nftContract.address}`);
    console.log(`   Storage Contract: https://etherscan.io/address/${storageContract.address}`);
    console.log("\n3. OpenSea (if deployed to mainnet/testnet):");
    const symbol = await nftContract.symbol();
    console.log(`   NFT Collection: https://opensea.io/collection/${symbol.toLowerCase()}`);
    console.log(`   Token 0: https://opensea.io/assets/${nftContract.address}/0`);
  });
});
