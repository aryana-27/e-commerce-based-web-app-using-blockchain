import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
  Grid,
  Image,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useWeb3 } from '../contexts/Web3Context';
import { useProducts, Product } from '../contexts/ProductsContext';

export const ProductManagement: React.FC = () => {
  const { account } = useWeb3();
  const { addProduct, getSellerProducts, updateProduct, deleteProduct } = useProducts();
  const toast = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [stock, setStock] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (account) {
      loadProducts();
    }
  }, [account]);

  const loadProducts = async () => {
    try {
      if (!account) return;
      const sellerProducts = getSellerProducts(account);
      setProducts(sellerProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const productData = {
        name,
        description,
        price,
        image,
        stock: parseInt(stock),
        seller: account,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({
          title: 'Success',
          description: 'Product updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await addProduct(productData);
        toast({
          title: 'Success',
          description: 'Product added successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setImage('');
      setStock('');
      setEditingProduct(null);
      
      // Reload products
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setImage(product.image);
    setStock(product.stock.toString());
  };

  const handleDelete = async (productId: number) => {
    try {
      await deleteProduct(productId);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setImage('');
    setStock('');
  };

  return (
    <Box p={4}>
      <Heading mb={4}>Manage Your Products</Heading>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Product Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Price (ETH)</FormLabel>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price in ETH"
              step="0.01"
              min="0"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Image URL</FormLabel>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Enter image URL"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Stock</FormLabel>
            <Input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Enter stock quantity"
              min="0"
            />
          </FormControl>

          <Button type="submit" colorScheme="blue">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </Button>
          
          {editingProduct && (
            <Button onClick={handleCancelEdit} variant="outline">
              Cancel Edit
            </Button>
          )}
        </VStack>
      </form>

      <Box mt={8}>
        <Heading size="md" mb={4}>Your Products</Heading>
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
          {products.map((product) => (
            <Box
              key={product.id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              p={4}
            >
              <Image
                src={product.image}
                alt={product.name}
                fallbackSrc="https://via.placeholder.com/150"
                height="150px"
                width="100%"
                objectFit="cover"
              />
              <Box mt={2}>
                <Text fontWeight="bold">{product.name}</Text>
                <Text>{product.description}</Text>
                <Text>Price: {product.price} ETH</Text>
                <Text>Stock: {product.stock}</Text>
              </Box>
              <Flex mt={2}>
                <IconButton
                  aria-label="Edit product"
                  icon={<EditIcon />}
                  onClick={() => handleEdit(product)}
                  size="sm"
                  mr={2}
                />
                <IconButton
                  aria-label="Delete product"
                  icon={<DeleteIcon />}
                  onClick={() => handleDelete(product.id)}
                  size="sm"
                  colorScheme="red"
                />
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}; 