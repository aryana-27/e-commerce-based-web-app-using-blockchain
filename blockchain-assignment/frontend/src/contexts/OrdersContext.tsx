import React, { createContext, useContext, useState, useEffect } from 'react';

// Define OrderStatus enum to match contract.sol
export enum OrderStatus {
  Placed,
  Shipped,
  Delivered,
  Cancelled,
  Disputed,
  Refunded
}

// Define Order interface
export interface Order {
  orderId: number;
  customer: string;
  merchant: string;
  itemId: number;
  price: string;
  timestamp: number;
  status: OrderStatus;
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrders: (account: string) => Order[];
  updateOrderStatus: (orderId: number, newStatus: OrderStatus) => void;
}

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: () => {},
  getOrders: () => [],
  updateOrderStatus: () => {},
});

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Initialize orders from localStorage if available
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Add a new order
  const addOrder = (order: Order) => {
    setOrders(prevOrders => {
      // Generate a unique ID if not provided
      if (!order.orderId) {
        const maxId = prevOrders.reduce((max, o) => Math.max(max, o.orderId), 0);
        order.orderId = maxId + 1;
      }
      
      // Set timestamp if not provided
      if (!order.timestamp) {
        order.timestamp = Math.floor(Date.now() / 1000);
      }
      
      return [...prevOrders, order];
    });
  };

  // Get orders for a specific account
  const getOrders = (account: string): Order[] => {
    return orders.filter(order => 
      order.customer.toLowerCase() === account.toLowerCase()
    ).sort((a, b) => b.timestamp - a.timestamp);
  };

  // Update order status
  const updateOrderStatus = (orderId: number, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        getOrders,
        updateOrderStatus,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}; 