import React from 'react';
import {
  SimpleGrid,
  Box,
  Image,
  Text,
  Button,
  VStack,
  useToast,
  Heading,
} from '@chakra-ui/react';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';

// Mock products data with better images and descriptions
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Premium Laptop',
    description: 'High-performance laptop with latest specifications',
    price: 0.5,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&h=400',
    seller: '0x1234567890123456789012345678901234567890',
    stock: 5
  },
  {
    id: 2,
    name: 'Smartphone',
    description: 'Latest model with advanced camera system',
    price: 0.3,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&h=400',
    seller: '0x1234567890123456789012345678901234567890',
    stock: 10
  },
  {
    id: 3,
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling headphones',
    price: 0.1,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=400',
    seller: '0x1234567890123456789012345678901234567890',
    stock: 15
  },
  {
    id: 4,
    name: 'Smart Watch',
    description: 'Fitness and health tracking smartwatch',
    price: 0.15,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=400',
    seller: '0x1234567890123456789012345678901234567890',
    stock: 8
  }
];

export const ProductList: React.FC = () => {
  const { addToCart } = useCart();
  const toast = useToast();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box p={8}>
      <Heading mb={6}>Available Products</Heading>
      <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
        {mockProducts.map((product) => (
          <Box
            key={product.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="lg"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.02)' }}
          >
            <Image
              src={product.image}
              alt={product.name}
              height="200px"
              width="100%"
              objectFit="cover"
              fallbackSrc="https://via.placeholder.com/200"
            />
            <VStack p={4} spacing={3} align="start">
              <Heading size="md">{product.name}</Heading>
              <Text color="gray.600">{product.description}</Text>
              <Text fontWeight="bold" fontSize="xl" color="blue.600">
                {product.price} ETH
              </Text>
              <Text color="gray.500">Stock: {product.stock}</Text>
              <Button
                colorScheme="blue"
                width="full"
                onClick={() => handleAddToCart(product)}
                isDisabled={product.stock <= 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}; 