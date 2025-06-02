import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useWeb3 } from '../contexts/Web3Context';
import { useNavigate } from 'react-router-dom';

export const SellerRegistration: React.FC = () => {
  const { account, isConnected, registerAsSeller, isRegistered, userRole } = useWeb3();
  const navigate = useNavigate();
  const toast = useToast();

  const handleRegister = async () => {
    if (!isConnected) {
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
      await registerAsSeller();
      navigate('/manage-products');
    } catch (error) {
      console.error('Error registering as seller:', error);
    }
  };

  if (isRegistered && userRole === 1) {
    return (
      <Box p={8} maxW="container.md" mx="auto" textAlign="center">
        <Heading mb={4}>Welcome, Seller!</Heading>
        <Text mb={6}>You are already registered as a seller.</Text>
        <Button
          colorScheme="blue"
          onClick={() => navigate('/manage-products')}
        >
          Go to Product Management
        </Button>
      </Box>
    );
  }

  return (
    <Box p={8} maxW="container.md" mx="auto" textAlign="center">
      <VStack spacing={6}>
        <Heading>Become a Seller</Heading>
        <Text>
          Register as a seller to start listing your products on our marketplace.
        </Text>
        <Text fontSize="sm" color="gray.600">
          Connected Wallet: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
        </Text>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleRegister}
          isDisabled={!isConnected}
        >
          Register as Seller
        </Button>
        <Text fontSize="sm" color="gray.500">
          Note: This will require a transaction to be signed with your wallet
        </Text>
      </VStack>
    </Box>
  );
}; 