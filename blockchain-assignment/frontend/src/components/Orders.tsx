import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Badge,
  Flex,
  Button,
  useToast,
  Divider
} from '@chakra-ui/react';
import { useWeb3 } from '../contexts/Web3Context';
import { useOrders, OrderStatus } from '../contexts/OrdersContext';
import { ethers } from 'ethers';

export const Orders = () => {
  const { account } = useWeb3();
  const { getOrders, updateOrderStatus } = useOrders();
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Get orders from context
  const orders = account ? getOrders(account) : [];

  // Helper function to get status badge color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Placed: return 'blue';
      case OrderStatus.Shipped: return 'orange';
      case OrderStatus.Delivered: return 'green';
      case OrderStatus.Cancelled: return 'red';
      case OrderStatus.Disputed: return 'purple';
      case OrderStatus.Refunded: return 'gray';
      default: return 'gray';
    }
  };

  // Helper function to get status text
  const getStatusText = (status: OrderStatus) => {
    return OrderStatus[status];
  };

  // Function to cancel an order
  const cancelOrder = async (orderId: number) => {
    try {
      updateOrderStatus(orderId, OrderStatus.Cancelled);
      
      toast({
        title: "Success",
        description: "Order has been cancelled",
        status: "success",
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Function to confirm receipt
  const confirmReceipt = async (orderId: number) => {
    try {
      updateOrderStatus(orderId, OrderStatus.Delivered);
      
      toast({
        title: "Success",
        description: "Order marked as delivered",
        status: "success",
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      console.error("Error confirming receipt:", error);
      toast({
        title: "Error",
        description: "Failed to confirm receipt",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Function to file a dispute
  const fileDispute = async (orderId: number) => {
    try {
      updateOrderStatus(orderId, OrderStatus.Disputed);
      
      toast({
        title: "Success",
        description: "Dispute has been filed",
        status: "success",
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      console.error("Error filing dispute:", error);
      toast({
        title: "Error",
        description: "Failed to file dispute",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Display different actions based on order status
  const renderOrderActions = (order: any) => {
    switch (order.status) {
      case OrderStatus.Placed:
        return (
          <Button 
            mt={3}
            colorScheme="red"
            size="sm"
            onClick={() => cancelOrder(order.orderId)}
          >
            Cancel Order
          </Button>
        );
      case OrderStatus.Shipped:
        return (
          <Flex mt={3} gap={2}>
            <Button 
              colorScheme="green"
              size="sm"
              onClick={() => confirmReceipt(order.orderId)}
            >
              Confirm Receipt
            </Button>
            <Button 
              colorScheme="purple"
              size="sm"
              variant="outline"
              onClick={() => fileDispute(order.orderId)}
            >
              File Dispute
            </Button>
          </Flex>
        );
      default:
        return null;
    }
  };

  return (
    <Box p={5} maxW="container.lg" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Your Orders</Heading>
      </Flex>

      {error && (
        <Box textAlign="center" py={6}>
          <Text color="red.500" fontSize="lg" mb={4}>{error}</Text>
        </Box>
      )}

      {!account && (
        <Box 
          p={8} 
          borderWidth={1} 
          borderRadius="lg" 
          textAlign="center"
        >
          <Text fontSize="lg">Please connect your wallet to view your orders.</Text>
        </Box>
      )}

      {account && orders.length === 0 && (
        <Box 
          p={8} 
          borderWidth={1} 
          borderRadius="lg" 
          textAlign="center"
        >
          <Text fontSize="lg">You don't have any orders yet.</Text>
          <Text mt={2} color="gray.500">
            Browse products and make a purchase to see your orders here.
          </Text>
        </Box>
      )}

      {account && orders.length > 0 && (
        <VStack spacing={4} align="stretch">
          {orders.map((order) => (
            <Box 
              key={order.orderId} 
              p={5} 
              borderWidth={1} 
              borderRadius="lg" 
              boxShadow="sm"
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Heading size="md">Order #{order.orderId}</Heading>
                <Badge colorScheme={getStatusColor(order.status)} fontSize="0.8em" p={1}>
                  {getStatusText(order.status)}
                </Badge>
              </Flex>
              
              <Divider my={3} />
              
              <Box>
                <Text><strong>Date:</strong> {new Date(order.timestamp * 1000).toLocaleString()}</Text>
                <Text><strong>Item ID:</strong> {order.itemId}</Text>
                <Text><strong>Price:</strong> {ethers.utils.formatEther(order.price)} ETH</Text>
                <Text><strong>Merchant:</strong> {`${order.merchant.substring(0, 6)}...${order.merchant.substring(order.merchant.length - 4)}`}</Text>
              </Box>
              
              {renderOrderActions(order)}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}; 