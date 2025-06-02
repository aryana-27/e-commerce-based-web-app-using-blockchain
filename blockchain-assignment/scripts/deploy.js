const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Storage contract
  const Storage = await hre.ethers.getContractFactory("Storage");
  const storage = await Storage.deploy();
  await storage.waitForDeployment();
  console.log('Storage deployed to:', await storage.getAddress());

  // Deploy UserModule contract
  const UserModule = await hre.ethers.getContractFactory("UserModule");
  const userModule = await UserModule.deploy();
  await userModule.waitForDeployment();
  console.log('UserModule deployed to:', await userModule.getAddress());

  // Deploy PaymentModule contract
  const PaymentModule = await hre.ethers.getContractFactory("PaymentModule");
  const paymentModule = await PaymentModule.deploy(
    await storage.getAddress(),
    await userModule.getAddress()
  );
  await paymentModule.waitForDeployment();
  console.log('PaymentModule deployed to:', await paymentModule.getAddress());

  // Deploy OrderManager contract
  const OrderManager = await hre.ethers.getContractFactory("OrderManager");
  const orderManager = await OrderManager.deploy();
  await orderManager.waitForDeployment();
  console.log('OrderManager deployed to:', await orderManager.getAddress());

  // Save contract addresses
  const addresses = {
    Storage: await storage.getAddress(),
    UserModule: await userModule.getAddress(),
    PaymentModule: await paymentModule.getAddress(),
    OrderManager: await orderManager.getAddress(),
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'frontend', 'src', 'contracts', 'addresses.json'),
    JSON.stringify(addresses, null, 2)
  );
  console.log('Contract addresses saved to addresses.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 