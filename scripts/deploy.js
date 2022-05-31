const fs = require('fs');
const { ethers } = require('hardhat');
async function main() {
  const [deployer, user1] = await ethers.getSigners();
  // We get the contract factory to deploy
  const MacpostFactory = await ethers.getContractFactory("Macpost");
  // Deploy contract
  const Macpost = await MacpostFactory.deploy();
  // Save contract address file in project
  const contractsDir = __dirname + "/../src/contractsData";
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/Macpost-address.json`,
    JSON.stringify({ address: Macpost.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync("Macpost");

  fs.writeFileSync(
    contractsDir + `/Macpost.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
  console.log("Macpostdeployed to:", Macpost.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
