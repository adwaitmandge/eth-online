const hre = require("hardhat");

async function main() {
  const cryptoDevsContract = await hre.ethers.getContractFactory("CryptoDevs");
  const deployedContract = await cryptoDevsContract.deploy(
    "https://nft-collection-tutorial-iota.vercel.app/api/",
    "0x073bee5A1ec56f8a5825b15b4Ff46e88195c96F2"
  );
  await deployedContract.waitForDeployment();
  console.log("Contract address", deployedContract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
