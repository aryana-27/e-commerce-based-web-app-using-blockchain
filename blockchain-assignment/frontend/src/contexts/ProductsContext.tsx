import React, { createContext, useContext, useState, useEffect } from 'react';

// Define Product interface
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  seller: string;
  stock: number;
}

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  getProducts: () => Product[];
  getSellerProducts: (sellerAddress: string) => Product[];
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
}

const ProductsContext = createContext<ProductsContextType>({
  products: [],
  addProduct: () => {},
  getProducts: () => [],
  getSellerProducts: () => [],
  updateProduct: () => {},
  deleteProduct: () => {},
});

export const useProducts = () => useContext(ProductsContext);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Initialize products from localStorage if available
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // Add a new product
  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prevProducts => {
      // Generate a unique ID
      const maxId = prevProducts.reduce((max, p) => Math.max(max, p.id), 0);
      const newProduct = {
        ...product,
        id: maxId + 1
      };
      
      return [...prevProducts, newProduct];
    });
  };

  // Get all products
  const getProducts = (): Product[] => {
    return products;
  };

  // Get products for a specific seller
  const getSellerProducts = (sellerAddress: string): Product[] => {
    return products.filter(product => 
      product.seller.toLowerCase() === sellerAddress.toLowerCase()
    );
  };

  // Update a product
  const updateProduct = (id: number, updatedProduct: Partial<Product>) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === id 
          ? { ...product, ...updatedProduct }
          : product
      )
    );
  };

  // Delete a product
  const deleteProduct = (id: number) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product.id !== id)
    );
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        getProducts,
        getSellerProducts,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}; 