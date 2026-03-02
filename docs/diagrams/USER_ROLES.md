# User Role Interactions Diagram

This diagram shows the 5 user roles and their interactions within the system.

```mermaid
graph TB
    subgraph "Customer Role"
        C1[Browse Marketplace]
        C2[Create 3D Designs]
        C3[Place Orders]
        C4[Chat with Designer]
        C5[Approve Designs]
        C6[Track Orders]
        C7[Write Reviews]
    end

    subgraph "Designer Role"
        D1[Accept/Reject Orders]
        D2[Upload Designs]
        D3[Chat with Customer]
        D4[Track Progress]
        D5[Manage Portfolio]
        D6[Request Payouts]
        D7[Toggle Availability]
    end

    subgraph "Manager Role"
        M1[Approve Orders]
        M2[Assign Designers]
        M3[Approve Designs]
        M4[Track Production]
        M5[Assign Delivery]
        M6[Process Payouts]
        M7[Manage Inventory]
    end

    subgraph "Admin Role"
        A1[Approve Users]
        A2[View Analytics]
        A3[Manage Products]
        A4[System Settings]
        A5[Review Feedback]
        A6[Monitor Orders]
    end

    subgraph "Delivery Role"
        DL1[View Assignments]
        DL2[Update Location]
        DL3[Verify OTP]
        DL4[Mark Delivered]
        DL5[Track Statistics]
    end

    C3 --> M1
    M2 --> D1
    D2 --> C5
    C5 --> M3
    M3 --> M4
    M4 --> M5
    M5 --> DL1
    DL4 --> D6
    D6 --> M6

    C4 -.-> D3
    C6 -.-> M4
    C7 -.-> A5
    A1 -.-> D1

    style C1 fill:#90EE90
    style D1 fill:#FFB6C1
    style M1 fill:#87CEEB
    style A1 fill:#FFD700
    style DL1 fill:#DDA0DD
```

## Role Permissions Matrix

| Feature               | Customer | Designer | Manager | Admin | Delivery |
| --------------------- | -------- | -------- | ------- | ----- | -------- |
| **Authentication**    |
| Register/Login        | ✅       | ✅       | ✅      | ✅    | ✅       |
| Email 2FA             | ✅       | ✅       | ✅      | ✅    | ✅       |
| Profile Edit          | ✅       | ✅       | ✅      | ✅    | ✅       |
| **Products & Orders** |
| Browse Products       | ✅       | ✅       | ❌      | ✅    | ❌       |
| 3D Design Studio      | ✅       | ❌       | ❌      | ❌    | ❌       |
| Place Orders          | ✅       | ❌       | ❌      | ❌    | ❌       |
| View Own Orders       | ✅       | ✅       | ✅      | ✅    | ✅       |
| View All Orders       | ❌       | ❌       | ✅      | ✅    | ❌       |
| **Design Management** |
| Upload Designs        | ❌       | ✅       | ❌      | ❌    | ❌       |
| Approve Designs       | ✅ (own) | ❌       | ✅      | ❌    | ❌       |
| Modify Designs        | ❌       | ✅       | ❌      | ❌    | ❌       |
| **Order Management**  |
| Accept/Reject Orders  | ❌       | ✅       | ❌      | ❌    | ❌       |
| Assign Designers      | ❌       | ❌       | ✅      | ❌    | ❌       |
| Track Production      | ✅       | ✅       | ✅      | ✅    | ❌       |
| Update Milestones     | ❌       | ✅       | ✅      | ❌    | ❌       |
| **Delivery**          |
| Assign Delivery       | ❌       | ❌       | ✅      | ❌    | ❌       |
| View Deliveries       | ❌       | ❌       | ❌      | ❌    | ✅       |
| Update GPS Location   | ❌       | ❌       | ❌      | ❌    | ✅       |
| Verify OTP            | ❌       | ❌       | ❌      | ❌    | ✅       |
| **Financial**         |
| View Earnings         | ❌       | ✅       | ❌      | ✅    | ❌       |
| Request Payout        | ❌       | ✅       | ❌      | ❌    | ❌       |
| Process Payout        | ❌       | ❌       | ✅      | ❌    | ❌       |
| **Communication**     |
| Chat with Designer    | ✅       | ❌       | ❌      | ❌    | ❌       |
| Chat with Customer    | ❌       | ✅       | ❌      | ❌    | ❌       |
| Send Notifications    | ❌       | ❌       | ✅      | ✅    | ❌       |
| **Administration**    |
| Approve Users         | ❌       | ❌       | ❌      | ✅    | ❌       |
| Manage Products       | ❌       | ❌       | ✅      | ✅    | ❌       |
| View Analytics        | ❌       | ❌       | ✅      | ✅    | ❌       |
| System Settings       | ❌       | ❌       | ❌      | ✅    | ❌       |
| **Feedback**          |
| Submit Feedback       | ✅       | ✅       | ✅      | ❌    | ✅       |
| Review Feedback       | ❌       | ❌       | ❌      | ✅    | ❌       |
| Write Product Reviews | ✅       | ❌       | ❌      | ❌    | ❌       |

## Role Details

### **👤 Customer**

**Dashboard**: Order history, wishlist, cart, design studio access
**Key Features**:

- Browse designer marketplace
- Create custom designs in 3D studio
- Real-time order tracking
- Chat with assigned designer
- Approve/reject design submissions
- Write product reviews
- Submit feedback

**Approval Required**: No (auto-approved on signup)

### **🎨 Designer**

**Dashboard**: Active orders, earnings, portfolio, payout requests
**Key Features**:

- Accept/reject incoming orders
- Upload design files (4 milestones)
- Chat with customers
- Portfolio management
- Earnings tracking (80% commission)
- Payout requests (₹500 minimum)
- Availability toggle

**Approval Required**: Yes (admin approval needed)

### **👔 Manager**

**Dashboard**: All orders, designer assignments, production tracking
**Key Features**:

- Approve/reject new orders
- Assign orders to designers
- Approve final designs
- Track production milestones (8 stages)
- Assign delivery partners
- Process designer payouts
- Inventory management
- Analytics dashboard

**Approval Required**: Yes (admin approval needed)

### **🔧 Admin**

**Dashboard**: System overview, analytics, user management
**Key Features**:

- Approve new users (designer, manager, delivery)
- Complete system analytics
- Product management (CRUD)
- View all orders and statistics
- Review customer feedback
- System settings
- User role management

**Approval Required**: No (created manually)

### **🚚 Delivery Partner**

**Dashboard**: Assigned deliveries, statistics, history
**Key Features**:

- View assigned deliveries
- Update GPS location
- OTP verification at delivery
- Mark orders as delivered
- Delivery history
- Performance statistics

**Approval Required**: Yes (admin approval needed)

## Workflow Interactions

### **Customer → Designer**

- Customer places custom order
- Designer accepts order
- Two-way chat communication
- Designer uploads design files
- Customer approves/rejects designs

### **Manager → Designer**

- Manager assigns orders
- Designer accepts/rejects
- Manager tracks designer progress
- Manager approves final designs
- Manager processes designer payouts

### **Manager → Delivery**

- Manager assigns delivery partner
- Delivery partner receives notification
- Delivery updates tracked
- OTP verification coordinated

### **Admin → All Users**

- Admin approves new users
- Admin monitors system activity
- Admin reviews feedback
- Admin manages products

## Dashboard Routes

| Role     | Route                 |
| -------- | --------------------- |
| Customer | `/customer/dashboard` |
| Designer | `/designer/dashboard` |
| Manager  | `/manager/dashboard`  |
| Admin    | `/admin/dashboard`    |
| Delivery | `/delivery/dashboard` |
