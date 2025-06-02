import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  Input,
  Code
} from '@chakra-ui/react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

export default function OrderDebugger() {
  const { orderContract } = useWeb3();
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [customAddress, setCustomAddress] = useState<string>('');

  const checkOrdersInContract = async () => {
    if (!orderContract) {
      setResults("Error: Order contract not available");
      return;
    }

    setLoading(true);
    setResults("Checking orders in contract...\n");

    try {
      // Get total orders
      const totalOrdersBN = await orderContract.totalOrders();
      const totalOrders = totalOrdersBN.toNumber();
      setTotalOrders(totalOrders);
      setResults(prev => `${prev}Total orders in contract: ${totalOrders}\n\n`);

      // Get details of each order
      for (let i = 1; i <= totalOrders; i++) {
        try {
          const order = await orderContract.orderRecords(i);
          setResults(prev => 
            `${prev}Order #${i}:\n` +
            `  Customer: ${order.customer}\n` +
            `  Merchant: ${order.merchant}\n` +
            `  Item ID: ${order.itemId.toString()}\n` +
            `  Price: ${ethers.formatEther(order.price)} ETH\n` +
            `  Status: ${order.status}\n\n`
          );
        } catch (err) {
          setResults(prev => `${prev}Error fetching order #${i}: ${err}\n\n`);
        }
      }
    } catch (error) {
      setResults(prev => `${prev}Error checking orders: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  const checkAddressOrders = async () => {
    if (!orderContract || !customAddress) {
      setResults("Error: Order contract not available or address not provided");
      return;
    }

    try {
      setLoading(true);
      setResults(`Checking orders for address: ${customAddress}\n\n`);

      // Get total orders
      const totalOrdersBN = await orderContract.totalOrders();
      const totalOrders = totalOrdersBN.toNumber();
      
      let foundOrders = 0;

      // Get orders for specific address
      for (let i = 1; i <= totalOrders; i++) {
        try {
          const order = await orderContract.orderRecords(i);
          if (order.customer.toLowerCase() === customAddress.toLowerCase()) {
            foundOrders++;
            setResults(prev => 
              `${prev}Order #${i}:\n` +
              `  Customer: ${order.customer}\n` +
              `  Merchant: ${order.merchant}\n` +
              `  Item ID: ${order.itemId.toString()}\n` +
              `  Price: ${ethers.formatEther(order.price)} ETH\n` +
              `  Status: ${order.status}\n\n`
            );
          }
        } catch (err) {
          console.error(`Error fetching order #${i}:`, err);
        }
      }

      if (foundOrders === 0) {
        setResults(prev => `${prev}No orders found for address ${customAddress}\n`);
      } else {
        setResults(prev => `${prev}Found ${foundOrders} orders for address ${customAddress}\n`);
      }
    } catch (error) {
      setResults(prev => `${prev}Error checking orders: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={5} border="1px" borderColor="gray.200" borderRadius="md" my={5}>
      <Heading size="md" mb={4}>Order Contract Debugger</Heading>
      
      <VStack gap={4} alignItems="stretch">
        <Button 
          onClick={checkOrdersInContract} 
          colorScheme="blue" 
          loading={loading}
          disabled={!orderContract}
        >
          Check All Orders in Contract
        </Button>

        <Box>
          <Text mb={2}>Check Orders for Specific Address:</Text>
          <Input 
            placeholder="Enter Ethereum address" 
            value={customAddress} 
            onChange={(e) => setCustomAddress(e.target.value)}
            mb={2}
          />
          <Button 
            onClick={checkAddressOrders} 
            colorScheme="green" 
            loading={loading}
            disabled={!orderContract || !customAddress}
            size="sm"
          >
            Check Address Orders
          </Button>
        </Box>

        {results && (
          <Box 
            p={4} 
            bg="gray.50" 
            borderRadius="md" 
            overflowX="auto"
            whiteSpace="pre-wrap"
            fontFamily="monospace"
            fontSize="sm"
            maxHeight="400px"
            overflowY="auto"
          >
            {results}
          </Box>
        )}
      </VStack>
    </Box>
  );
} 