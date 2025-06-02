# Blockchain Assignment – E-Commerce Based Web App

This project is a modular blockchain-based e-commerce platform demonstrating how smart contracts can be integrated with a frontend web application to securely manage users, orders, payments, and product storage.

## 🔗 Project Structure

blockchain-assignment/
├── index.html
├── src/
│   ├── contracts/
│   │   ├── UserModule.sol
│   │   ├── OrderManager.sol
│   │   ├── PaymentModule.sol
│   │   ├── Storage.sol
│   │   └── *.json (compiled ABIs)
│   ├── js/
│   │   └── app.js

## 📦 Modules Description

### 1. UserModule.sol
Manages user registration, login, and roles (admin, buyer, seller).

### 2. OrderManager.sol
Handles order creation, tracking, and status updates.

### 3. PaymentModule.sol
Manages token-based payments using smart contracts.

### 4. Storage.sol
Maintains product listings and inventory control.

## Technologies Used

- Solidity (Smart contract development)
- Remix IDE (Smart contract compilation & deployment)
- Web3.js (Connecting frontend to Ethereum blockchain)
- MetaMask (For wallet interactions)
- HTML/CSS/JS (Frontend interface)

## Getting Started

### Prerequisites
- MetaMask installed in your browser
- Node.js and npm (if using local server)
- Remix IDE (for deploying contracts)

### Steps

1. Clone the repository:
   git clone https://github.com/aryana-27/e-commerce-based-web-app-using-blockchain.git

2. Open Remix IDE and compile each `.sol` file in `src/contracts`.

3. Deploy the contracts using Remix or your local development blockchain (e.g. Ganache).

4. Copy the deployed contract addresses and ABIs into `src/contracts/*.json`.

5. Open `index.html` in the browser (make sure MetaMask is connected).


