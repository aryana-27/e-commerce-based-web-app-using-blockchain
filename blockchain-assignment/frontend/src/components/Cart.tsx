import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  IconButton,
  useToast,
  Heading,
  Spinner,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { useCart } from '../contexts/CartContext';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useOrders, OrderStatus } from '../contexts/OrdersContext';

export const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { orderContract, account } = useWeb3();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { addOrder } = useOrders();

  const handleCheckout = async () => {
    if (!orderContract || !account) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Starting checkout process");
      
      // Process each item in the cart as a separate order
      for (const item of items) {
        console.log(`Creating order for item: ${item.id}, seller: ${item.seller}, price: ${ethers.utils.parseEther(item.price.toString())}`);
        
        try {
          // Add order to local context/storage
          addOrder({
            orderId: Date.now() + Math.floor(Math.random() * 1000), // Generate a unique ID
            customer: account,
            merchant: item.seller,
            itemId: item.id,
            price: ethers.utils.parseEther(item.price.toString()).toString(),
            timestamp: Math.floor(Date.now() / 1000),
            status: OrderStatus.Placed
          });
          
          // Optional: Also send to blockchain if needed
          const tx = await orderContract.createOrder(
            item.seller,
            item.id,
            { value: ethers.utils.parseEther(item.price.toString()) }
          );
          
          console.log("Transaction submitted:", tx.hash);
          await tx.wait();
          console.log(`Order created for item ${item.id}`);
          
        } catch (err) {
          console.error(`Error creating order for item ${item.id}:`, err);
          throw err;
        }
      }

      // Clear the cart after successful checkout
      clearCart();

      toast({
        title: 'Checkout Successful',
        description: 'Your orders have been placed successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate to orders page to view the newly created orders
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: 'There was an error processing your order. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Heading size="lg" mb={4}>Your Cart</Heading>
        <Text fontSize="xl">Your cart is empty</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading size="lg" mb={6}>Your Cart</Heading>
      <VStack spacing={4} align="stretch">
        {items.map((item) => (
          <Box
            key={item.id}
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            boxShadow="sm"
          >
            <HStack spacing={4}>
              <Image
                src={item.image}
                alt={item.name}
                boxSize="100px"
                objectFit="cover"
                borderRadius="md"
              />
              <VStack flex={1} align="start" spacing={2}>
                <Text fontSize="lg" fontWeight="semibold">
                  {item.name}
                </Text>
                <Text color="blue.600" fontWeight="bold">
                  {item.price} ETH
                </Text>
              </VStack>
              <HStack>
                <IconButton
                  aria-label="Decrease quantity"
                  icon={<MinusIcon />}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  size="sm"
                />
                <Text fontWeight="bold">{item.quantity}</Text>
                <IconButton
                  aria-label="Increase quantity"
                  icon={<AddIcon />}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  size="sm"
                />
                <IconButton
                  aria-label="Remove item"
                  icon={<DeleteIcon />}
                  onClick={() => removeFromCart(item.id)}
                  colorScheme="red"
                  size="sm"
                />
              </HStack>
            </HStack>
          </Box>
        ))}
        <Box borderTopWidth="1px" pt={4}>
          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="bold">
              Total:
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              {total} ETH
            </Text>
          </HStack>
        </Box>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleCheckout}
          isLoading={isProcessing}
          loadingText="Processing"
          isDisabled={isProcessing}
        >
          {isProcessing ? <Spinner size="sm" mr={2} /> : null}
          Checkout
        </Button>
      </VStack>
    </Box>
  );
}; 