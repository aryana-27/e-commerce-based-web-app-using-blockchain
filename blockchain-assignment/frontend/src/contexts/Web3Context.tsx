import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@chakra-ui/react';
import OrderManagerABI from '../contracts/OrderManager.json';
import UserModuleABI from '../contracts/UserModule.json';

interface Web3ContextType {
  account: string | null;
  orderContract: ethers.Contract | null;
  userContract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  isConnected: boolean;
  userRole: number | null;
  registerAsSeller: () => Promise<void>;
  isRegistered: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  orderContract: null,
  userContract: null,
  connectWallet: async () => {},
  isConnected: false,
  userRole: null,
  registerAsSeller: async () => {},
  isRegistered: false,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [orderContract, setOrderContract] = useState<ethers.Contract | null>(null);
  const [userContract, setUserContract] = useState<ethers.Contract | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const toast = useToast();

  const checkUserRole = async (contract: ethers.Contract) => {
    if (!account) return;
    
    try {
      // First check if user is registered by calling getUser
      try {
        const userInfo = await contract.getUser();
        setIsRegistered(userInfo.isRegistered);
        setUserRole(userInfo.role);
        console.log('User info retrieved:', {
          isRegistered: userInfo.isRegistered,
          role: userInfo.role
        });
      } catch (err) {
        // If getUser fails, try getUserRole as fallback
        console.log('Trying getUserRole as fallback');
        const role = await contract.getUserRole();
        console.log('User role:', role);
        setUserRole(role);
        
        // Role 1 is seller
        setIsRegistered(role === 1);
      }
    } catch (error) {
      console.error('Error getting user role:', error);
      setIsRegistered(false);
      setUserRole(null);
    }
  };

  const registerAsSeller = async () => {
    if (!userContract || !account) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const tx = await userContract.registerUser('Seller Account', 1);
      
      toast({
        title: 'Registration Submitted',
        description: 'Your registration transaction has been submitted',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      await tx.wait();
      
      toast({
        title: 'Registration Successful',
        description: 'You are now registered as a seller',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Update user role
      await checkUserRole(userContract);
    } catch (error) {
      console.error('Error registering as seller:', error);
      toast({
        title: 'Registration Failed',
        description: 'Failed to register as seller',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this application');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAccount(account);

      // Create Web3 provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Get the deployed contract addresses
      const orderManagerAddress = '0x8059B0AE35c113137694Ba15b2C3585aE77Bb8E9';
      const userModuleAddress = '0x1d142a62E2e98474093545D4A3A0f7DB9503B8BD';
      
      console.log('Using contract addresses:', {
        orderManagerAddress,
        userModuleAddress
      });
      
      // Create contract instances
      try {
        // Verify the ABIs have the expected functions
        console.log('OrderManagerABI functions:', 
          OrderManagerABI.abi.filter(item => item.type === 'function').map(f => f.name));
        console.log('UserModuleABI functions:', 
          UserModuleABI.abi.filter(item => item.type === 'function').map(f => f.name));
          
        const orderContractInstance = new ethers.Contract(
          orderManagerAddress,
          OrderManagerABI.abi,
          signer
        );
        
        const userContractInstance = new ethers.Contract(
          userModuleAddress,
          UserModuleABI.abi,
          signer
        );
        
        console.log('Order contract initialized:', orderContractInstance.address);
        console.log('User contract initialized:', userContractInstance.address);
        
        setOrderContract(orderContractInstance);
        setUserContract(userContractInstance);

        // Check user role
        await checkUserRole(userContractInstance);
      } catch (error) {
        console.error('Error initializing contracts:', error);
        toast({
          title: 'Contract Error',
          description: 'Failed to connect to blockchain contracts. Please check console for details.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }

      toast({
        title: 'Connected',
        description: 'Wallet connected successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setOrderContract(null);
      setUserContract(null);
      setUserRole(null);
      setIsRegistered(false);
      toast({
        title: 'Wallet Disconnected',
        description: 'Please connect your wallet to continue',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } else {
      setAccount(accounts[0]);
      connectWallet(); // Reconnect to update contracts and user role
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        orderContract,
        userContract,
        connectWallet,
        isConnected: !!account,
        userRole,
        registerAsSeller,
        isRegistered,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}; 