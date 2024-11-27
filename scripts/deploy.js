const hre = require("hardhat");

async function main() {
  // 获取合约工厂并部署
  const DiomandDapp = await hre.ethers.getContractFactory("DiomandDapp");
  const diomandDapp = await DiomandDapp.deploy();

  // 等待合约部署完成
  await diomandDapp.deployed();
  console.log("DiomandDapp deployed to:", diomandDapp.address);

  // 确保 Hardhat 网络在运行
  console.log("Adding initial diamond data...");
}

//   try {
//     // 调用 mining 函数铸造 tokenId = 0 的钻石数据
//     const tx1 = await diomandDapp.mining(
//       "Mining Company A", // 采矿公司
//       "South Africa", // 地点
//       20231120 // 采矿日期
//     );
//     await tx1.wait();
//     console.log("Mining completed for tokenId 0");

//     // 调用 cutting 函数为 tokenId = 0 设置切割数据
//     const tx2 = await diomandDapp.cutting(
//       0,
//       "Cutting Company A", // 切割公司
//       "Excellent" // 切割等级
//     );
//     await tx2.wait();
//     console.log("Cutting completed for tokenId 0");

//     // 调用 setGradingInfo 函数为 tokenId = 0 设置评级数据
//     const tx3 = await diomandDapp.setGradingInfo(
//       "GIA Lab", // 评级实验室
//       "DIA12345", // 雕刻 ID
//       "D" // 评级等级
//     );
//     await tx3.wait();
//     console.log("Grading info set for tokenId 0");

//     // 调用 jewelryMaking 函数为 tokenId = 0 设置珠宝制作数据
//     const tx4 = await diomandDapp.jewelryMaking(
//       "Jewelry Maker A", // 珠宝制作公司
//       "Ring" // 珠宝类型
//     );
//     await tx4.wait();
//     console.log("Jewelry making completed for tokenId 0");

//     console.log("Initial data added successfully.");
//   } catch (error) {
//     console.error("Error during initial data setup:", error);
//   }
// }

// 运行主函数
main().catch((error) => {
  console.error("Error deploying contract:", error);
  process.exitCode = 1;
});
