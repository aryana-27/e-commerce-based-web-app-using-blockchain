import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Spinner, 
  Button, 
  VStack,
  Input,
  Code,
  Flex
} from '@chakra-ui/react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

// Define OrderStatus enum to match the contract
enum OrderStatus {
  Placed = 0,
  Shipped = 1,
  Delivered = 2,
  Cancelled = 3,
  Disputed = 4,
  Refunded = 5
}

// Update Order type to match the contract structure exactly
interface Order {
  orderId: number;
  customer: string;
  merchant: string;
  itemId: number;
  price: string;
  timestamp: number;
  status: OrderStatus;
}

// Update the rendering of order status to match the contract enum
const getStatusText = (status: number): string => {
  switch (status) {
    case OrderStatus.Placed:
      return "Placed";
    case OrderStatus.Shipped:
      return "Shipped";
    case OrderStatus.Delivered:
      return "Delivered";
    case OrderStatus.Cancelled:
      return "Cancelled";
    case OrderStatus.Disputed:
      return "Disputed";
    case OrderStatus.Refunded:
      return "Refunded";
    default:
      return "Unknown";
  }
};

export default function Orders() {
  const { account, orderContract } = useWeb3();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [contractInfo, setContractInfo] = useState<string>('');

  // Function to safely extract values from contract responses
  const safeExtract = (obj: any, field: string, defaultValue: any): any => {
    try {
      if (obj && obj[field] !== undefined) {
        // For BigNumber values, attempt to convert to number or string
        if (obj[field]._isBigNumber) {
          return obj[field].toString();
        }
        return obj[field];
      }
      return defaultValue;
    } catch (e) {
      console.error(`Error extracting ${field}:`, e);
      return defaultValue;
    }
  };

  const getContractInfo = async () => {
    if (!orderContract) return '';
    
    let info = '';
    try {
      // Try to get various properties/functions that might exist on the contract
      let functions: string[] = [];
      try {
        functions = Object.keys(orderContract.interface || {})
          .filter(key => typeof orderContract[key] === 'function');
      } catch (e) {
        info += `Error getting contract functions: ${e}\n`;
      }
      
      info += `Available methods: ${functions.join(', ')}\n`;
      
      // Check if specific functions exist
      const hasOrdersCount = typeof orderContract.totalOrders === 'function';
      const hasGetOrder = typeof orderContract.orderRecords === 'function' || 
                         typeof orderContract.getOrder === 'function' ||
                         typeof orderContract.orders === 'function';
      
      info += `Has totalOrders(): ${hasOrdersCount}\n`;
      info += `Has order getter function: ${hasGetOrder}\n`;
      
      // Try to get contract owner or other metadata
      if (typeof orderContract.owner === 'function') {
        try {
          const owner = await orderContract.owner();
          info += `Contract owner: ${owner}\n`;
        } catch (e) {
          info += `Error getting owner: ${e}\n`;
        }
      }
      
    } catch (e) {
      info += `Error getting contract info: ${e}\n`;
    }
    
    return info;
  };

  // Updated loadOrders function to work specifically with OrderManager contract
  const loadOrders = async () => {
    if (!orderContract) {
      setError("Order contract not available");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Save contract address for display
      const address = typeof orderContract.target === 'string' 
        ? orderContract.target 
        : 'Unknown address';
      setContractAddress(address);
      
      console.log("Contract address:", address);
      console.log("Account:", account);
      
      // Get total orders from the contract
      try {
        const totalOrdersBN = await orderContract.totalOrders();
        const totalOrders = totalOrdersBN.toNumber();
        console.log("Total orders:", totalOrders);
        
        // Load ALL orders using the orderRecords mapping
        const allOrdersArray: Order[] = [];
        const userOrdersArray: Order[] = [];
        
        for (let i = 1; i <= totalOrders; i++) {
          try {
            // Use the orderRecords mapping directly as defined in the contract
            const order = await orderContract.orderRecords(i);
            console.log(`Order #${i}:`, order);
            
            if (order) {
              // Convert order data to our Order interface
              const orderObj: Order = {
                orderId: i,
                customer: order.customer,
                merchant: order.merchant,
                itemId: order.itemId.toNumber(),
                price: order.price.toString(),
                timestamp: order.timestamp.toNumber(),
                status: order.status
              };
              
              // Add to all orders array
              allOrdersArray.push(orderObj);
              
              // If it matches the current account, add to user orders
              if (account && order.customer.toLowerCase() === account.toLowerCase()) {
                console.log(`Order #${i} matches current account`);
                userOrdersArray.push(orderObj);
              }
            }
          } catch (err) {
            console.error(`Error fetching order #${i}:`, err);
          }
        }
        
        setAllOrders(allOrdersArray);
        setOrders(userOrdersArray);
        
        console.log(`Found ${allOrdersArray.length} total orders, ${userOrdersArray.length} user orders`);
        
      } catch (err) {
        console.error("Error getting total orders:", err);
        setError("Failed to get orders from contract");
      }
      
    } catch (error) {
      console.error("Error loading orders:", error);
      setError(`Failed to load orders: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (orderContract) {
        // Get contract info for debugging
        const info = await getContractInfo();
        setContractInfo(info);
        
        // Load orders
        loadOrders();
      }
    };
    
    initialize();
  }, [orderContract, account]);

  return (
    <Box p={5}>
      <Heading mb={4}>Orders</Heading>
      
      <Flex gap={4} mb={4} wrap="wrap">
        <Button onClick={loadOrders} colorScheme="blue" disabled={loading}>
          {loading ? "Loading..." : "Refresh Orders"}
        </Button>
        
        <Button 
          colorScheme={showAllOrders ? "red" : "green"} 
          onClick={() => setShowAllOrders(!showAllOrders)}
        >
          {showAllOrders ? "Show My Orders" : "Show All Orders"}
        </Button>
      </Flex>
      
      {error && (
        <Text color="red.500" mb={4}>
          Error: {error}
        </Text>
      )}
      
      {loading ? (
        <Box textAlign="center" my={8}>
          <Spinner size="xl" />
          <Text mt={4}>Loading orders...</Text>
        </Box>
      ) : (showAllOrders ? allOrders : orders).length === 0 ? (
        <Box p={8} borderWidth={1} borderRadius="md">
          <Text fontSize="xl" textAlign="center">No orders found</Text>
          <Text color="gray.500" mt={2} textAlign="center">
            {showAllOrders 
              ? "There are no orders in the contract at all." 
              : "You don't have any orders yet."}
          </Text>
          <Box mt={6} p={4} bg="gray.50" borderRadius="md" overflowX="auto">
            <Text fontWeight="bold">Debug Info:</Text>
            <Text>Account: {account || "Not connected"}</Text>
            <Text>Contract: {orderContract ? "Available" : "Not Available"}</Text>
            <Text>Contract Address: {contractAddress}</Text>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8em', marginTop: '10px' }}>
              {contractInfo}
            </pre>
          </Box>
        </Box>
      ) : (
        <VStack gap={4} alignItems="stretch">
          <Text mb={2}>
            Showing {showAllOrders ? "all" : "your"} orders: {(showAllOrders ? allOrders : orders).length} found
          </Text>
          {(showAllOrders ? allOrders : orders).map((order) => (
            <Box key={order.orderId} p={4} borderWidth={1} borderRadius="md" shadow="sm">
              <Text fontWeight="bold">Order #{order.orderId}</Text>
              <Text>Customer: {order.customer}</Text>
              <Text>Merchant: {order.merchant}</Text>
              <Text>Item ID: {order.itemId}</Text>
              <Text>Price: {ethers.formatEther(order.price)} ETH</Text>
              <Text>Date: {new Date(order.timestamp * 1000).toLocaleString()}</Text>
              <Text>Status: {getStatusText(order.status)}</Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
} 