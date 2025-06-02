import React, { useState } from 'react';
import { Box, Heading, Text, Button, Container, HStack } from '@chakra-ui/react';
import { Web3Provider } from './contexts/Web3Context';
import Orders from './components/Orders';
import OrderDebugger from './components/OrderDebugger';

function App() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'debug'>('products');

  return (
    <Web3Provider>
      <Container maxW="container.xl" p={5}>
        <Heading mb={6}>Blockchain Marketplace</Heading>
        
        <HStack gap={4} mb={4}>
          <Button 
            onClick={() => setActiveTab('products')}
            colorScheme={activeTab === 'products' ? 'blue' : 'gray'}
            variant={activeTab === 'products' ? 'solid' : 'outline'}
          >
            Products
          </Button>
          <Button 
            onClick={() => setActiveTab('orders')}
            colorScheme={activeTab === 'orders' ? 'blue' : 'gray'}
            variant={activeTab === 'orders' ? 'solid' : 'outline'}
          >
            Your Orders
          </Button>
          <Button 
            onClick={() => setActiveTab('debug')}
            colorScheme={activeTab === 'debug' ? 'blue' : 'gray'}
            variant={activeTab === 'debug' ? 'solid' : 'outline'}
          >
            Debug
          </Button>
        </HStack>
        
        {activeTab === 'products' && (
          <Box p={5} borderWidth={1} borderRadius="md">
            <Heading size="md" mb={4}>Products</Heading>
            <Text>Products will appear here...</Text>
          </Box>
        )}
        
        {activeTab === 'orders' && (
          <Orders />
        )}
        
        {activeTab === 'debug' && (
          <OrderDebugger />
        )}
      </Container>
    </Web3Provider>
  );
}

export default App; 