import React from 'react';
import {
  Box,
  Flex,
  Button,
  Text,
  HStack,
  useToast,
  VStack,
  Link as ChakraLink
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useCart } from '../contexts/CartContext';

export const Navbar = () => {
  const { connectWallet, account, userRole, isRegistered } = useWeb3();
  const { items } = useCart();
  const toast = useToast();

  const navLinks = [
    { name: 'Products', path: '/' },
    { name: 'Cart', path: '/cart' },
    { name: 'Your Orders', path: '/orders' },
    { name: 'Manage Products', path: '/manage-products', requiresSeller: true },
    { name: 'Become a Seller', path: '/become-seller', requiresNonSeller: true }
  ];

  const getFilteredLinks = () => {
    return navLinks.filter(link => {
      if (link.requiresSeller && (!isRegistered || userRole !== 1)) {
        return false;
      }
      
      if (link.requiresNonSeller && (isRegistered && userRole === 1)) {
        return false;
      }
      
      return true;
    });
  };

  return (
    <Box bg="blue.600" px={4} py={2}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Link to="/">
            <Text fontSize="xl" fontWeight="bold" color="white">
              Blockchain Marketplace
            </Text>
          </Link>
          <HStack as="nav" spacing={4}>
            {getFilteredLinks().map((link) => (
              <Link key={link.path} to={link.path}>
                <Text color="white">{link.name}</Text>
              </Link>
            ))}
          </HStack>
        </HStack>
        <HStack spacing={4}>
          <Link to="/cart">
            <Box position="relative">
              <Text color="white">Cart</Text>
              {items.length > 0 && (
                <Box
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  w="18px"
                  h="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xs"
                >
                  {items.length}
                </Box>
              )}
            </Box>
          </Link>
          {!account ? (
            <Button
              colorScheme="green"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          ) : (
            <Box>
              <Text color="white" fontSize="sm">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </Text>
            </Box>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}; 