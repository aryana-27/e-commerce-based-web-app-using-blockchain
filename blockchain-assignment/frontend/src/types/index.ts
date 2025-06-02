import { ethers } from 'ethers';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  seller: string;
  stock: number;
  quantity?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  orderId: number;
  customer: string;
  merchant: string;
  itemId: number;
  price: string;
  timestamp: number;
  status: number;
}

export enum OrderStatus {
  Placed,
  Shipped,
  Delivered,
  Cancelled,
  Disputed,
  Refunded
}

export enum UserRole {
  Buyer = 0,
  Seller = 1
}

export interface User {
  address: string;
  name: string;
  role: UserRole;
  isRegistered: boolean;
}

declare global {
  interface Window {
    ethereum: any;
  }
}