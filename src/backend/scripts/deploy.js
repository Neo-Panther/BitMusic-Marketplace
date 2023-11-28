async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  
  // Get the ContractFactories and Signers here.
  const MUSICNFT = await ethers.getContractFactory("MUSICNFT");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  // deploy contracts
  const marketplace = await Marketplace.deploy(1);
  const musicnft = await MUSICNFT.deploy();
  // Save copies of each contracts abi and address to the frontend.
  saveFrontendFiles(marketplace , "Marketplace");
  saveFrontendFiles(musicnft , "MUSICNFT");
}

function saveFrontendFiles(contract, name) {
  // to access the file system
  const fs = require("fs");
  const directory = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  fs.writeFileSync(
    directory + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractABI = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    directory + `/${name}.json`,
    JSON.stringify(contractABI, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });