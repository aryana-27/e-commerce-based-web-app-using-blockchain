import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import { CartProvider } from './contexts/CartContext';
import { OrdersProvider } from './contexts/OrdersContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { Navbar } from './components/Navbar';
import { ProductList } from './components/ProductList';
import { Cart } from './components/Cart';
import { Orders } from './components/Orders';
import { ProductManagement } from './components/ProductManagement';
import { SellerRegistration } from './components/SellerRegistration';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Web3Provider>
        <ProductsProvider>
          <CartProvider>
            <OrdersProvider>
              <Router>
                <Navbar />
                <Routes>
                  <Route path="/" element={<ProductList />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/manage-products" element={<ProductManagement />} />
                  <Route path="/become-seller" element={<SellerRegistration />} />
                </Routes>
              </Router>
            </OrdersProvider>
          </CartProvider>
        </ProductsProvider>
      </Web3Provider>
    </ChakraProvider>
  );
}

export default App;
