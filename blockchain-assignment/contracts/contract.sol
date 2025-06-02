// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract Storage {
    uint256 private number;

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
        number = num;
    }

    /**
     * @dev Return value 
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256) {
        return number;
    }
}

/**
 * @title UserModule
 * @dev Handles user registration and role management
 */
contract UserModule {
    enum Role { Buyer, Seller }

    struct User {
        address userAddress;
        string name;
        Role role;
        bool isRegistered;
    }

    mapping(address => User) private users; 

    event UserRegistered(address indexed user, string name, uint8 role); 

    function registerUser(string memory _name, Role _role) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");

        users[msg.sender] = User(msg.sender, _name, _role, true);
        
        emit UserRegistered(msg.sender, _name, uint8(_role)); 
    }

    function getUserRole() public view returns (Role) {
        require(users[msg.sender].isRegistered, "User not registered");
        return users[msg.sender].role;
    }

    function getUser() public view returns (string memory name, Role role, bool isRegistered) {
        require(users[msg.sender].isRegistered, "User not registered");

        User memory user = users[msg.sender];
        return (user.name, user.role, user.isRegistered);
    }
}

/**
 * @title PaymentModule
 * @dev Handles escrow payments between buyers and sellers
 */
contract PaymentModule {
    Storage storageContract;
    UserModule userModule;

    struct Payment {
        uint orderId;
        address buyer;
        address seller;
        uint amount;
        bool isReleased;
    }

    mapping(uint => Payment) public payments;
    address public admin;

    event PaymentDeposited(uint orderId, address indexed buyer, address indexed seller, uint amount);
    event PaymentReleased(uint orderId, address indexed seller);
    event DisputeResolved(uint orderId, address indexed admin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can resolve disputes");
        _;
    }

    modifier onlyBuyer(uint _orderId) {
        require(msg.sender == payments[_orderId].buyer, "Only buyer can release payment");
        _;
    }

    modifier onlyRegisteredUser() {
        UserModule.Role role = userModule.getUserRole();
        require(role == UserModule.Role.Buyer || role == UserModule.Role.Seller, "User must be registered");
        _;
    }

    constructor(address _storageAddress, address _userModuleAddress) {
        admin = msg.sender;
        storageContract = Storage(_storageAddress);
        userModule = UserModule(_userModuleAddress);
    }

    function depositPayment(uint _orderId, address _seller) external payable onlyRegisteredUser {
        require(msg.value > 0, "Payment must be greater than zero");
        require(payments[_orderId].buyer == address(0), "Payment already exists");

        payments[_orderId] = Payment(_orderId, msg.sender, _seller, msg.value, false);
        emit PaymentDeposited(_orderId, msg.sender, _seller, msg.value);

        // Store payment value in the Storage contract
        storageContract.store(msg.value);
    }

    function releasePayment(uint _orderId) external onlyBuyer(_orderId) {
        require(!payments[_orderId].isReleased, "Payment already released");

        payments[_orderId].isReleased = true;
        payable(payments[_orderId].seller).transfer(payments[_orderId].amount);
        emit PaymentReleased(_orderId, payments[_orderId].seller);
    }

    function resolveDispute(uint _orderId) external onlyAdmin {
        require(!payments[_orderId].isReleased, "Payment already released");

        payments[_orderId].isReleased = true;
        payable(payments[_orderId].seller).transfer(payments[_orderId].amount);
        emit DisputeResolved(_orderId, admin);
    }

    function getPaymentDetails(uint _orderId) public view returns (address buyer, address seller, uint amount, bool isReleased) {
        Payment memory payment = payments[_orderId];
        return (payment.buyer, payment.seller, payment.amount, payment.isReleased);
    }
}

/**
 * @title OrderManager
 * @dev Manages orders, including order creation, status changes, and dispute resolution
 */
contract OrderManager {
    enum OrderStatus {Placed, Shipped, Delivered, Cancelled, Disputed, Refunded}
    
    struct Order {
        uint orderId;
        address customer;
        address merchant;
        uint itemId;
        uint price;
        uint timestamp;
        OrderStatus status;
    }

    event OrderPlaced(uint orderId, address customer, address merchant, uint itemId, uint price, uint timestamp);
    event OrderShipped(uint orderId);
    event OrderDelivered(uint orderId);
    event OrderCancelled(uint orderId);
    event OrderDisputed(uint orderId);
    event RefundRequested(uint orderId, address customer, address merchant);

    mapping(uint => Order) public orderRecords;
    uint public totalOrders;
    address public contractAdmin;

    modifier onlyMerchant(uint _orderId) {
        require(orderRecords[_orderId].merchant == msg.sender, "You are not the merchant! Only a merchant is permitted to perform this action");
        _;
    }

    modifier onlyCustomer(uint _orderId) {
        require(orderRecords[_orderId].customer == msg.sender, "You are not the customer! Only a customer is permitted to perform this action");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == contractAdmin, "You are not the admin! Only an admin is permitted to perform this action");
        _;
    }

    constructor() {
        contractAdmin = msg.sender;
    }

    function createOrder(address _merchant, uint _itemId) external payable {
        require(msg.value > 0, "Payment required");
        totalOrders++;
        orderRecords[totalOrders] = Order(
            totalOrders, msg.sender, _merchant, _itemId, msg.value, block.timestamp, OrderStatus.Placed
        );
        emit OrderPlaced(totalOrders, msg.sender, _merchant, _itemId, msg.value, block.timestamp);
    }

    function dispatchOrder(uint _orderId) external onlyMerchant(_orderId) {
        require(orderRecords[_orderId].status == OrderStatus.Placed, "Order not in correct state");
        orderRecords[_orderId].status = OrderStatus.Shipped;
        emit OrderShipped(_orderId);
    }

    function confirmReceipt(uint _orderId) external onlyCustomer(_orderId) {
        require(orderRecords[_orderId].status == OrderStatus.Shipped, "Order not shipped yet");
        orderRecords[_orderId].status = OrderStatus.Delivered;
        payable(orderRecords[_orderId].merchant).transfer(orderRecords[_orderId].price);
        emit OrderDelivered(_orderId);
    }

    function revokeOrder(uint _orderId) external onlyCustomer(_orderId) {
        require(orderRecords[_orderId].status == OrderStatus.Placed, "Order cannot be cancelled");
        orderRecords[_orderId].status = OrderStatus.Cancelled;
        payable(orderRecords[_orderId].customer).transfer(orderRecords[_orderId].price);
        emit OrderCancelled(_orderId);
    }

    function fileDispute(uint _orderId) external onlyCustomer(_orderId) {
        require(orderRecords[_orderId].status == OrderStatus.Shipped, "Disputes only for shipped orders");
        orderRecords[_orderId].status = OrderStatus.Disputed;
        emit OrderDisputed(_orderId);
    }

    function settleDispute(uint _orderId, bool refundCustomer) external onlyAdmin {
        require(orderRecords[_orderId].status == OrderStatus.Disputed, "No dispute to resolve");
        
        if (refundCustomer) {
            orderRecords[_orderId].status = OrderStatus.Refunded;
            payable(orderRecords[_orderId].customer).transfer(orderRecords[_orderId].price);
            emit RefundRequested(_orderId, orderRecords[_orderId].customer, orderRecords[_orderId].merchant);
        } else {
            orderRecords[_orderId].status = OrderStatus.Delivered;
            payable(orderRecords[_orderId].merchant).transfer(orderRecords[_orderId].price);
            emit OrderDelivered(_orderId);
        }
    }
}