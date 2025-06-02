const fs = require('fs');
const solc = require('solc');
const path = require('path');

// Read the Solidity contract
const source = fs.readFileSync(path.join(__dirname, '..', 'contract.sol'), 'utf8');

// Compile the contract
const input = {
  language: 'Solidity',
  sources: {
    'contract.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Create contracts directory if it doesn't exist
const contractsDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts');
if (!fs.existsSync(contractsDir)) {
  fs.mkdirSync(contractsDir, { recursive: true });
}

// Save each contract's artifacts
for (const contractName in output.contracts['contract.sol']) {
  const contract = output.contracts['contract.sol'][contractName];
  const artifact = {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  };
  
  fs.writeFileSync(
    path.join(contractsDir, `${contractName}.json`),
    JSON.stringify(artifact, null, 2)
  );
  console.log(`${contractName} artifacts generated`);
} 