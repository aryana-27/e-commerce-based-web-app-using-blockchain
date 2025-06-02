import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import UserModuleABI from '../contracts/UserModule.json';
import PaymentModuleABI from '../contracts/PaymentModule.json';
import OrderManagerABI from '../contracts/OrderManager.json';
import StorageABI from '../contracts/Storage.json';
import { Button } from '@chakra-ui/react';

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}

// Network constants
const EXPECTED_NETWORK_ID = "1337"; // localhost chainId
const NETWORK_NAMES: {[key: string]: string} = {
  "1": "Ethereum Mainnet",
  "1337": "Localhost 8545",
  "31337": "Localhost 8545", // Hardhat adds this ID sometimes
};

interface Web3ContextType {
  account: string | null;
  userContract: ethers.Contract | null;
  paymentContract: ethers.Contract | null;
  orderContract: ethers.Contract | null;
  storageContract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  isConnected: boolean;
  getOrdersForAccount: (account: string) => Promise<any[]>;
  networkError: string | null;
  switchNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [userContract, setUserContract] = useState<ethers.Contract | null>(null);
  const [paymentContract, setPaymentContract] = useState<ethers.Contract | null>(null);
  const [orderContract, setOrderContract] = useState<ethers.Contract | null>(null);
  const [storageContract, setStorageContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [currentNetworkId, setCurrentNetworkId] = useState<string | null>(null);

  // Get contract addresses for specific network
  const getContractAddresses = (networkId: string) => {
    // For localhost network
    if (networkId === "1337" || networkId === "31337") {
      return {
        userContractAddress: "0x32316fE3DDf621fdAa71437Df19b94F9830c1118",
        paymentContractAddress: "0x39857B73EcD9846C4aC31371AC42158FcC704023",
        orderContractAddress: "0xBE46bA58D315f0d6cD37bd7F313ccBfdC760e891",
        storageContractAddress: "0x3d33C01bCC36ac6A8f872599A9c9351c11Ef07E7"
      };
    }
    // Default to empty addresses - will display network error
    return {
      userContractAddress: "",
      paymentContractAddress: "",
      orderContractAddress: "",
      storageContractAddress: ""
    };
  };

  const switchNetwork = async () => {
    try {
      // First try adding the network if it doesn't exist
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x539', // 1337 in hex
              chainName: 'Localhost 8545',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://localhost:8545'],
            },
          ],
        });
      } catch (addError) {
        console.log("Network may already exist:", addError);
      }

      // Then try switching to it
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }], // 1337 in hex
      });
    } catch (error: any) {
      console.error("Failed to switch network:", error);
    }
  };

  const checkNetwork = async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      const networkId = network.chainId.toString();
      console.log("Current network ID:", networkId);
      setCurrentNetworkId(networkId);

      // Check if network is supported
      if (networkId !== EXPECTED_NETWORK_ID) {
        const currentName = NETWORK_NAMES[networkId] || `Unknown Network (${networkId})`;
        const expectedName = NETWORK_NAMES[EXPECTED_NETWORK_ID];
        setNetworkError(`Wrong network detected: ${currentName}. Please switch to ${expectedName}.`);
        return false;
      }

      setNetworkError(null);
      return true;
    } catch (error) {
      console.error("Network check failed:", error);
      setNetworkError("Failed to detect network. Please check your wallet connection.");
      return false;
    }
  };

  const initializeContracts = async (provider: ethers.BrowserProvider) => {
    if (!await checkNetwork(provider)) {
      console.log("Network check failed, not initializing contracts");
      return;
    }

    const signer = await provider.getSigner();
    const networkId = currentNetworkId || EXPECTED_NETWORK_ID;
    const addresses = getContractAddresses(networkId);
    
    console.log("Initializing contracts with addresses:", addresses);
    
    try {
      const userContractInstance = new ethers.Contract(
        addresses.userContractAddress,
        UserModuleABI,
        signer
      );

      const paymentContractInstance = new ethers.Contract(
        addresses.paymentContractAddress,
        PaymentModuleABI,
        signer
      );

      const orderContractInstance = new ethers.Contract(
        addresses.orderContractAddress,
        OrderManagerABI,
        signer
      );

      const storageContractInstance = new ethers.Contract(
        addresses.storageContractAddress,
        StorageABI,
        signer
      );

      setUserContract(userContractInstance);
      setPaymentContract(paymentContractInstance);
      setOrderContract(orderContractInstance);
      setStorageContract(storageContractInstance);
      
      console.log("Contracts initialized successfully");
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
    }
  };

  const connectWallet = async () => {
    try {
      const provider = await detectEthereumProvider();
      
      if (provider) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        }) as string[];
        
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await initializeContracts(web3Provider);
        }
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        
        // First check the network
        await checkNetwork(web3Provider);
        
        const accounts = await web3Provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].toString());
          setIsConnected(true);
          await initializeContracts(web3Provider);
        }
        
        // Setup event listeners for account and network changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
            setIsConnected(false);
          }
        });
        
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }
    };

    checkConnection();
    
    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const getOrdersForAccount = async (account: string) => {
    if (!orderContract || !account) return [];
    
    // Log network info for debugging
    console.log("Current network:", currentNetworkId);
    console.log("Contract address:", orderContract.target);
    
    try {
      console.log("Getting orders for account:", account);
      const totalOrders = await orderContract.totalOrders();
      console.log("Total orders:", totalOrders.toString());
      
      const orders: Array<{
        id: number;
        customer: string;
        merchant: string;
        itemId: number;
        price: string;
        timestamp: number;
        status: number;
      }> = [];
      
      for (let i = 1; i <= totalOrders.toNumber(); i++) {
        try {
          console.log(`Fetching order #${i}`);
          const order = await orderContract.orderRecords(i);
          console.log(`Order #${i}:`, order);
          
          if (order && order.customer && 
              order.customer.toLowerCase() === account.toLowerCase()) {
            orders.push({
              id: i,
              customer: order.customer,
              merchant: order.merchant,
              itemId: order.itemId.toNumber(),
              price: order.price.toString(),
              timestamp: order.timestamp.toNumber(),
              status: order.status
            });
          }
        } catch (err) {
          console.error(`Error fetching order #${i}:`, err);
          // Continue to next order
        }
      }
      
      return orders;
    } catch (error) {
      console.error("Failed to get orders:", error);
      throw error;
    }
  }

  useEffect(() => {
    if (account && orderContract) {
      console.log("Connected account:", account);
      console.log("Order contract address:", orderContract.target);
      console.log("Network ID:", window.ethereum.networkVersion);
      
      // Debug - fetch first order and check its customer
      orderContract.orderRecords(1).then(order => {
        console.log("First order customer:", order?.customer);
        console.log("Does it match?", 
          order?.customer?.toLowerCase() === account.toLowerCase());
      }).catch(err => console.error("Error checking first order:", err));
    }
  }, [account, orderContract]);

  return (
    <Web3Context.Provider
      value={{
        account,
        userContract,
        paymentContract,
        orderContract,
        storageContract,
        connectWallet,
        isConnected,
        getOrdersForAccount,
        networkError,
        switchNetwork
      }}
    >
      {children}
      {networkError && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '5px', 
          zIndex: 9999,
          maxWidth: '300px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          <p style={{ marginBottom: '8px' }}>{networkError}</p>
          <Button 
            colorScheme="red" 
            size="sm" 
            onClick={switchNetwork}
          >
            Switch Network
          </Button>
        </div>
      )}
      <Button 
        colorScheme="gray" 
        size="sm" 
        onClick={() => {
          if (account) {
            console.log("Current account:", account);
            getOrdersForAccount(account);
          } else {
            console.log("No account connected");
          }
        }}
      >
        Debug Orders
      </Button>
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 