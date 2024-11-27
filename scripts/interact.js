const { ethers } = require("hardhat");

async function main() {
    try {
        // 获取部署的合约地址
        const NFT_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const STORAGE_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

        // 获取合约实例
        const nftContract = await ethers.getContractAt("LuxuryNFT", NFT_CONTRACT_ADDRESS);
        const storageContract = await ethers.getContractAt("LuxuryNFTStorage", STORAGE_CONTRACT_ADDRESS);

        console.log("\n=== 基本合约信息 ===");
        console.log("NFT 合约地址:", NFT_CONTRACT_ADDRESS);
        console.log("存储合约地址:", STORAGE_CONTRACT_ADDRESS);
        console.log("NFT 合约所有者:", await nftContract.owner());
        console.log("存储合约所有者:", await storageContract.owner());

        // 获取 NFT 基本信息
        const totalSupply = await nftContract.nextTokenId();
        console.log("\n=== NFT 统计信息 ===");
        console.log("已铸造的 NFT 总数:", totalSupply.toString());

        // 遍历所有 NFT
        console.log("\n=== NFT 详细信息 ===");
        for (let i = 0; i < totalSupply; i++) {
            console.log(`\nToken ID ${i} 信息:`);
            try {
                const owner = await nftContract.ownerOf(i);
                const uri = await nftContract.tokenURI(i);
                const events = await storageContract.getLifecycleEvents(i);

                console.log("所有者:", owner);
                console.log("Token URI:", uri);
                console.log("生命周期事件:", events);

                // 输出查看链接
                console.log("\n查看链接:");
                console.log(`Etherscan: https://etherscan.io/token/${NFT_CONTRACT_ADDRESS}?a=${i}`);
                console.log(`OpenSea: https://opensea.io/assets/${NFT_CONTRACT_ADDRESS}/${i}`);
            } catch (error) {
                console.log(`获取 Token ${i} 信息时出错:`, error.message);
            }
        }

        // 合约验证信息
        console.log("\n=== 合约验证命令 ===");
        console.log("验证 NFT 合约:");
        console.log(`npx hardhat verify ${NFT_CONTRACT_ADDRESS}`);
        console.log("\n验证存储合约:");
        console.log(`npx hardhat verify ${STORAGE_CONTRACT_ADDRESS}`);

    } catch (error) {
        console.error("执行过程中出错:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
