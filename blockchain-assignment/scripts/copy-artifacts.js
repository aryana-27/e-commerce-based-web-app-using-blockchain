const fs = require('fs');
const path = require('path');

// Create the frontend contracts directory if it doesn't exist
const contractsDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts');
if (!fs.existsSync(contractsDir)) {
  fs.mkdirSync(contractsDir, { recursive: true });
}

// List of contracts to copy
const contracts = ['Storage', 'UserModule', 'PaymentModule', 'OrderManager'];

// Copy each contract's artifacts
contracts.forEach(contractName => {
  const artifactPath = path.join(
    __dirname,
    '..',
    'artifacts',
    'contracts',
    'contract.sol',
    `${contractName}.json`
  );
  
  const targetPath = path.join(contractsDir, `${contractName}.json`);
  
  // Read the artifact
  const artifact = require(artifactPath);
  
  // We only need the ABI and bytecode
  const minifiedArtifact = {
    abi: artifact.abi,
    bytecode: artifact.bytecode
  };
  
  // Write the minified artifact
  fs.writeFileSync(
    targetPath,
    JSON.stringify(minifiedArtifact, null, 2)
  );
  
  console.log(`Copied ${contractName} artifacts to frontend`);
}); 