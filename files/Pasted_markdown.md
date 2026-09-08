Build a complete professional **SMM Panel website** similar in functionality to https://paksmmportal.com/, but with a custom manual payment and wallet system.

## 1. USER REGISTRATION & LOGIN

Create:
- User Registration
- Login / Logout
- Forgot Password
- Secure password hashing
- User dashboard
- Profile settings
- Wallet balance
- Order history
- Payment/deposit history
- Notifications

Every user must have a unique account and wallet balance.

---

## 2. USER DASHBOARD

Create a modern SMM panel dashboard containing:

- Current Wallet Balance
- Total Orders
- Pending Orders
- Processing Orders
- Completed Orders
- Failed Orders
- Deposit History
- Order History

Main buttons:
- Add Funds
- New Order
- Services
- Orders
- Transactions
- Profile
- Support

---

# 3. MANUAL PAYMENT PAGE

Create an **Add Funds / Payment** page.

The payment information must NOT be hardcoded.

Admin should be able to manage payment information from Admin Panel.

Admin can add/edit:

### JazzCash
- JazzCash Number
- Account Title

### EasyPaisa
- EasyPaisa Number
- Account Title

### QR Code
- Upload QR Code image
- QR Code title/description

The user should see these payment methods on the Add Funds page.

Example:

JAZZCASH
Account Title: [Admin entered title]
Number: [Admin entered number]

EASYPAISA
Account Title: [Admin entered title]
Number: [Admin entered number]

QR CODE
[Admin uploaded QR image]

---

# 4. USER DEPOSIT / PAYMENT REQUEST

User selects:

- Payment Method
- Amount
- Transaction ID / Reference Number
- Sender Name or Account Number (optional)
- Payment Screenshot

Then clicks:

**Submit Payment Request**

The system creates a deposit request with status:

**Pending**

Important:
- Do NOT immediately credit the wallet.
- Wallet balance must remain unchanged until admin approval.
- Store screenshot securely.
- Store date/time.
- Store user ID.
- Store amount.
- Store payment method.
- Store transaction/reference number.

---

# 5. ADMIN PAYMENT APPROVAL

Create an Admin Panel section:

**Deposits / Payment Requests**

Show:

- Request ID
- Username
- User ID
- Amount
- Payment Method
- Transaction ID
- Screenshot
- Date/Time
- Status

Admin buttons:

**Approve**
**Reject**

When admin clicks APPROVE:

1. Verify the payment request.
2. Change status from Pending → Approved.
3. Credit the exact amount to user's wallet.
4. Create a wallet transaction record.
5. Show notification to the user.
6. Prevent the same payment request from being approved twice.

Example:

User deposits Rs. 1,000

Before approval:

Wallet = Rs. 0

After admin approval:

Wallet = Rs. 1,000

Transaction history:

+ Rs. 1,000
Deposit
Status: Approved

If admin rejects:

Status = Rejected

No wallet credit.

---

# 6. WALLET SYSTEM

Create a secure internal wallet system.

Wallet must support:

- Credit
- Debit
- Current Balance
- Transaction History

Every wallet transaction must contain:

- Transaction ID
- User ID
- Type: Credit/Debit
- Amount
- Previous Balance
- New Balance
- Description
- Related Order ID
- Date/Time
- Status

Use database transactions/atomic operations so that money cannot be duplicated or deducted twice.

---

# 7. SMM SERVICES

Create a Services page similar to a professional SMM panel.

Categories can include:

- Instagram
- Facebook
- YouTube
- TikTok
- Telegram
- Twitter/X
- Other services

Each service should have:

- Service ID
- Service Name
- Category
- Description
- Price
- Minimum Quantity
- Maximum Quantity
- Average Start Time
- Estimated Speed
- Status: Active/Inactive

Admin can add, edit, delete and disable services.

---

# 8. NEW ORDER PAGE

User selects:

- Category
- Service
- Link
- Quantity

System automatically calculates:

**Total Price = Service Price × Quantity**

Before submitting the order, show:

- Selected Service
- Link
- Quantity
- Total Cost
- Current Wallet Balance
- Balance After Order

If wallet balance is insufficient:

Show:

**Insufficient Balance – Please Add Funds**

Do not create the order.

If sufficient balance exists:

Create the order.

---

# 9. ORDER APPROVAL / BALANCE DEDUCTION

When user submits an order:

Order status:

**Pending**

Admin can review the order.

When admin approves/starts the order:

- Deduct the order amount from user's wallet.
- Create a wallet debit transaction.
- Link the transaction to the Order ID.
- Change order status to:

**Processing**

Important:
The system must prevent duplicate deduction if admin clicks approve multiple times.

The order amount must only be deducted once.

---

# 10. ORDER COMPLETION

Admin Panel should have:

**Orders**

Admin can see:

- Order ID
- Username
- Service
- Link
- Quantity
- Amount
- Date
- Status

Statuses:

- Pending
- Processing
- Completed
- Cancelled
- Failed

When the work is finished, admin clicks:

**Mark as Complete**

Then:

Order status changes:

**Processing → Completed**

The user dashboard/order history should immediately show:

**Completed**

If admin cancels an order after money was deducted, optionally allow:

**Refund to Wallet**

The refunded amount must be recorded as a separate wallet transaction.

---

# 11. USER ORDER HISTORY

Create an Order History page.

Columns:

- Order ID
- Service
- Link
- Quantity
- Amount
- Status
- Date

Users should be able to click an order to see complete details.

Example:

Order #10025
Service: Instagram Followers
Quantity: 1000
Amount: Rs. 500
Status: Processing

Later:

Status: Completed

---

# 12. TRANSACTION HISTORY

Create a Wallet Transactions page.

Show:

| Date | Type | Amount | Description | Status |
|---|---|---:|---|---|

Examples:

+ Rs. 1,000 — Deposit — Approved

- Rs. 500 — Order #10025 — Completed

+ Rs. 500 — Refund — Order #10025

Use clear Credit/Debit indicators.

---

# 13. ADMIN PANEL

Create a powerful Admin Dashboard.

Admin dashboard should show:

- Total Users
- Total Deposits
- Pending Deposits
- Approved Deposits
- Total Orders
- Pending Orders
- Processing Orders
- Completed Orders
- Total Revenue
- Wallet Activity

Admin menu:

1. Dashboard
2. Users
3. Deposits
4. Payment Settings
5. Services
6. Orders
7. Transactions
8. Notifications
9. Support/Tickets
10. Settings
11. Admin Profile

---

# 14. PAYMENT SETTINGS

Admin can manage:

### JazzCash
- Enable/Disable
- Account Title
- Number

### EasyPaisa
- Enable/Disable
- Account Title
- Number

### QR Code
- Enable/Disable
- Upload QR
- Replace QR

Admin changes must automatically appear on the user's payment page.

---

# 15. USER NOTIFICATIONS

Create notifications for:

- Deposit submitted
- Deposit approved
- Deposit rejected
- Order submitted
- Order approved
- Order processing
- Order completed
- Order cancelled
- Wallet credited
- Wallet debited

Example:

"Your Rs. 1,000 deposit has been approved and credited to your wallet."

---

# 16. ADMIN USER MANAGEMENT

Admin can:

- View users
- Search users
- View user wallet
- Add wallet balance
- Deduct wallet balance
- Suspend user
- Activate user
- Reset password
- View user's deposits
- View user's orders
- View user's transactions

Manual wallet adjustments must always create an audit/transaction record.

---

# 17. DATABASE

Use a proper relational database.

Recommended tables:

### users
- id
- name
- email/username
- password_hash
- wallet_balance
- status
- created_at

### payment_settings
- id
- jazzcash_number
- jazzcash_title
- easypaisa_number
- easypaisa_title
- qr_code
- updated_at

### deposits
- id
- user_id
- amount
- method
- transaction_id
- screenshot
- status
- reviewed_by
- reviewed_at
- created_at

### services
- id
- category
- name
- description
- price
- min_quantity
- max_quantity
- status
- created_at

### orders
- id
- user_id
- service_id
- link
- quantity
- amount
- status
- approved_by
- completed_at
- created_at

### wallet_transactions
- id
- user_id
- type
- amount
- previous_balance
- new_balance
- description
- order_id
- deposit_id
- created_at

### notifications
- id
- user_id
- title
- message
- read_status
- created_at

### admin_users
- id
- username
- password_hash
- role

### support_tickets
- id
- user_id
- subject
- message
- status
- created_at

---

# 18. SECURITY

Implement:

- Password hashing
- Secure sessions/JWT
- CSRF protection where applicable
- SQL injection protection
- XSS protection
- Input validation
- File upload validation
- Screenshot file type/size restrictions
- Admin role protection
- Rate limiting
- Secure API endpoints
- Audit logs
- Atomic wallet transactions
- Duplicate payment approval protection
- Duplicate wallet deduction protection

Never expose database credentials, API keys or admin secrets in frontend code.

---

# 19. IMPORTANT WALLET LOGIC

The wallet system must be reliable.

For deposits:

**User submits payment → Pending → Admin verifies → Approved → Wallet Credit**

For orders:

**User submits order → Pending → Admin approves → Wallet Debit → Processing → Admin marks Complete**

Never credit a deposit automatically just because a screenshot was uploaded.

Never deduct an order twice.

Every balance change must have a transaction record.

---

# 20. RESPONSIVE DESIGN

Create a professional modern SMM panel interface.

It must work perfectly on:

- Desktop
- Laptop
- Tablet
- Android
- iPhone

Use:

- Sidebar navigation
- Mobile bottom/menu navigation where appropriate
- Cards
- Tables
- Status badges
- Modal dialogs
- Toast notifications
- Search and filters

Design should look like a professional commercial SMM panel, not a basic template.

---

# 21. IMPORTANT CONFIGURATION

Do not hardcode:

- JazzCash number
- EasyPaisa number
- Account titles
- QR code
- Admin password
- Database credentials
- API keys

All sensitive/configurable information should be managed through Admin Panel or environment variables.

---

# 22. FINAL WORKFLOW

The complete workflow must be:

USER:

Register/Login
↓
Add Funds
↓
Select JazzCash/EasyPaisa/QR
↓
Make payment manually
↓
Upload screenshot + transaction ID
↓
Submit
↓
Deposit Pending

ADMIN:

Open Deposits
↓
Check screenshot/payment
↓
Approve
↓
User wallet credited

USER:

Wallet balance updated
↓
Select SMM Service
↓
Enter link + quantity
↓
Submit Order
↓
Order Pending

ADMIN:

Review Order
↓
Approve/Start
↓
Wallet amount deducted ONCE
↓
Order Processing
↓
Work completed
↓
Admin clicks "Mark Complete"

USER:

Order status becomes
**Completed**

The complete system should maintain a reliable relationship between deposits, wallet transactions and orders.

Build this as a production-ready application with clean code, proper database relationships, secure authentication, responsive UI and a professional SMM-panel experience.                                                     ## PLANS – VIEWS & SUBSCRIBERS

Admin Panel → Plans & Pricing mein admin plan ke andar services/features add kar sake.

Example:

### YouTube Plan
- Views: 10,000
- Subscribers: 500
- Price: Rs. 1,000
- Duration: 30 Days

Agar admin plan mein **Views** aur **Subscribers** set kare, to User Dashboard par purchased/active plan ke card mein automatically show ho:

**My Active Plan**

Plan: YouTube Growth
Views: 10,000
Subscribers: 500
Price: Rs. 1,000
Status: Active

### Important

- Admin Views ki quantity change kar sake.
- Admin Subscribers ki quantity change kar sake.
- Agar kisi feature ki value `0` ya disabled ho to user dashboard par woh feature show na ho.
- Plan purchase/activation ke baad ye information user ke dashboard par automatically update ho.
- Har user ko sirf uske apne active plan ki information dikhai jaye.
- Admin Panel se plan edit karne par relevant information dynamically update ho.
- Multiple plans support hon.
- Plan status Active/Expired/Cancelled bhi show ho.

Example User Dashboard:

**Active Plan**
> YouTube Premium  
> 👁 Views: 10,000  
> 👤 Subscribers: 500  
> 💰 Price: Rs. 1,000  
> 🟢 Status: Active

Admin ko ye sab **Admin Panel se manage** karne ki facility honi chahiye.