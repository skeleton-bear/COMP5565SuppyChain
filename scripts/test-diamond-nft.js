const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with:", deployer.address);

    const LuxuryNFT = await hre.ethers.getContractFactory("LuxuryNFT");
    const luxuryNFT = await LuxuryNFT.deploy();
    await luxuryNFT.deployed();
    console.log("LuxuryNFT deployed to:", luxuryNFT.address);

    // 铸造 NFT
    const tx1 = await luxuryNFT.mint(
        deployer.address,
        "ipfs://example-uri",
        "D1234", // Diamond ID
        {
            miningCompany: "MineCo",
            location: "South Africa",
            minedDate: 1690905600,
        },
        {
            cuttingCompany: "CutCo",
            cutDate: 1691510400,
            cutGrade: "Excellent",
        },
        {
            gradingLab: "LabCorp",
            engravedID: "ENG1234",
            gradingDate: 1692115200,
            qualityReport: "ipfs://report123",
        },
        {
            jewelryMaker: "MakerInc",
            possessionDate: 1692720000,
        },
        {
            designer: "John Doe",
            designDate: 1693324800,
            jewelryType: "Ring",
        },
        {
            ownerID: deployer.address,
            purchaseDate: 1693929600,
            transferDetails: ["Initial Ownership"],
        }
    );
    await tx1.wait();
    console.log("NFT Minted!");

    // 查询详细信息
    const diamondDetails = await luxuryNFT.getDiamondDetails(0);
    console.log("Diamond Details:", diamondDetails);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
