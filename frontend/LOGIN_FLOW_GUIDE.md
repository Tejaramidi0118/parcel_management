# Unified Login Flow Guide

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        HOME PAGE                             │
│                                                              │
│  ┌──────────────┐                                           │
│  │ Login Button │  ← Single unified login button            │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   UNIFIED LOGIN PAGE                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Email: [                                    ]      │    │
│  │        Your role is determined by email domain     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Password: [                                 ]      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              [Sign In Button]                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────── Demo Accounts ───────────────────┐       │
│  │                                                  │       │
│  │  Customer                              [Use]    │       │
│  │  customer1@gmail.com                            │       │
│  │  Password: customer123                          │       │
│  │                                                  │       │
│  │  Courier                               [Use]    │       │
│  │  courier1@swiftcourier.com                      │       │
│  │  Password: courier123                           │       │
│  │                                                  │       │
│  │  Admin                                 [Use]    │       │
│  │  admin@swiftadmin.com                           │       │
│  │  Password: admin123                             │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  ┌─────────────── Email Domain Guide ──────────────┐       │
│  │  • @gmail.com (or any) → Customer               │       │
│  │  • @swiftcourier.com → Courier                  │       │
│  │  • @swiftadmin.com → Admin                      │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           ↓
              ┌────────────┴────────────┐
              │  Email Domain Check     │
              └────────────┬────────────┘
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                   ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ @gmail.com    │  │@swiftcourier  │  │ @swiftadmin   │
│ (or any)      │  │    .com       │  │    .com       │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        ↓                  ↓                   ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   CUSTOMER    │  │    COURIER    │  │     ADMIN     │
│   DASHBOARD   │  │   DASHBOARD   │  │   DASHBOARD   │
└───────────────┘  └───────────────┘  └───────────────┘
```

## Step-by-Step User Journey

### For Customers

1. **Navigate to Login**
   - Click "Login" button in header
   - Or click "Get Started" on home page
   - Or visit `/login` directly

2. **Enter Credentials**
   - Email: `customer1@gmail.com` (or any email)
   - Password: `customer123`
   - Or click "Use" button on Customer demo account

3. **Automatic Detection**
   - System detects email domain
   - Identifies user as Customer
   - Extracts username: `customer1`

4. **Authentication**
   - Validates credentials
   - Shows success toast
   - Redirects to `/customer/dashboard`

5. **Customer Dashboard**
   - View orders
   - Track parcels
   - Manage profile

### For Couriers

1. **Navigate to Login**
   - Click "Login" button in header
   - Or visit `/login` directly

2. **Enter Credentials**
   - Email: `courier1@swiftcourier.com`
   - Password: `courier123`
   - Or click "Use" button on Courier demo account

3. **Automatic Detection**
   - System detects `@swiftcourier.com` domain
   - Identifies user as Courier
   - Extracts username: `courier1`

4. **Authentication**
   - Validates credentials
   - Shows success toast
   - Redirects to `/courier/dashboard`

5. **Courier Dashboard**
   - View assigned deliveries
   - Update delivery status
   - Manage routes

### For Administrators

1. **Navigate to Login**
   - Click "Login" button in header
   - Or visit `/login` directly

2. **Enter Credentials**
   - Email: `admin@swiftadmin.com`
   - Password: `admin123`
   - Or click "Use" button on Admin demo account

3. **Automatic Detection**
   - System detects `@swiftadmin.com` domain
   - Identifies user as Admin
   - Extracts username: `admin`

4. **Authentication**
   - Validates credentials
   - Shows success toast
   - Redirects to `/admin/dashboard`

5. **Admin Dashboard**
   - Manage all users
   - Oversee all parcels
   - Configure system settings

## Signup Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   UNIFIED SIGNUP PAGE                        │
│                                                              │
│  Full Name:     [                                    ]      │
│  Email:         [                                    ]      │
│                 Your role is determined by email domain     │
│  Phone:         [                                    ]      │
│  Address:       [                                    ]      │
│  Password:      [                                    ]      │
│  Confirm Pass:  [                                    ]      │
│                                                              │
│  [Create Account Button]                                    │
│                                                              │
│  Already have an account? Sign in                           │
│                                                              │
│  ┌─────────────── Email Domain Guide ──────────────┐       │
│  │  • @gmail.com (or any) → Customer Account       │       │
│  │  • @swiftcourier.com → Courier Account          │       │
│  │  • @swiftadmin.com → Admin Account              │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           ↓
              ┌────────────┴────────────┐
              │  Validate & Create User │
              └────────────┬────────────┘
                           ↓
              ┌────────────┴────────────┐
              │  Auto-login & Redirect  │
              └────────────┬────────────┘
                           ↓
                  [Role-Specific Dashboard]
```

## Email Domain Examples

### Customer Emails (Any Domain)
✅ `john@gmail.com`
✅ `sarah@yahoo.com`
✅ `mike@outlook.com`
✅ `user@company.com`
✅ `customer@anysite.net`

### Courier Emails (Must end with @swiftcourier.com)
✅ `john@swiftcourier.com`
✅ `driver1@swiftcourier.com`
✅ `delivery.person@swiftcourier.com`
❌ `john@courier.com` (wrong domain)
❌ `john@swift.com` (wrong domain)

### Admin Emails (Must end with @swiftadmin.com)
✅ `admin@swiftadmin.com`
✅ `superuser@swiftadmin.com`
✅ `manager@swiftadmin.com`
❌ `admin@gmail.com` (would be customer)
❌ `admin@swiftcourier.com` (would be courier)

## Error Handling

### Invalid Email Format
```
Input: "notanemail"
Result: Browser validation error
Message: "Please enter a valid email address"
```

### Wrong Password
```
Input: Email: "customer1@gmail.com", Password: "wrongpass"
Result: Authentication failure
Message: "Invalid email or password. Please check your credentials."
```

### Account Not Found
```
Input: Email: "newuser@gmail.com", Password: "anypass"
Result: Authentication failure
Message: "Invalid email or password. Please check your credentials."
```

### Signup - Email Already Exists
```
Input: Email of existing user
Result: Signup failure
Message: "An account with this email already exists."
```

### Signup - Password Mismatch
```
Input: Password: "pass123", Confirm: "pass456"
Result: Validation error
Message: "Passwords do not match. Please try again."
```

### Signup - Weak Password
```
Input: Password: "123"
Result: Validation error
Message: "Password must be at least 6 characters long."
```

## Quick Reference Card

### Demo Accounts Quick Copy

**Customer**
```
Email: customer1@gmail.com
Password: customer123
```

**Courier**
```
Email: courier1@swiftcourier.com
Password: courier123
```

**Admin**
```
Email: admin@swiftadmin.com
Password: admin123
```

### URL Routes

| Purpose | URL | Description |
|---------|-----|-------------|
| Main Login | `/login` | Primary login page |
| Main Signup | `/signup` | Primary signup page |
| Customer Login | `/customer/login` | Redirects to unified login |
| Courier Login | `/courier/login` | Redirects to unified login |
| Admin Login | `/admin/login` | Redirects to unified login |
| Customer Dashboard | `/customer/dashboard` | After customer login |
| Courier Dashboard | `/courier/dashboard` | After courier login |
| Admin Dashboard | `/admin/dashboard` | After admin login |

### Role Detection Logic

```
IF email ends with "@swiftadmin.com"
  THEN role = Admin
ELSE IF email ends with "@swiftcourier.com"
  THEN role = Courier
ELSE IF email contains "@"
  THEN role = Customer
ELSE
  THEN Invalid email
```

## Benefits Summary

### User Benefits
- ✅ Single login page for all users
- ✅ No need to remember which login to use
- ✅ Email domain naturally indicates role
- ✅ Quick demo account access with "Use" buttons
- ✅ Clear visual guidance

### Developer Benefits
- ✅ Single source of truth for authentication
- ✅ Reduced code duplication
- ✅ Easier to maintain and update
- ✅ Consistent user experience
- ✅ Backward compatible with old URLs

### Business Benefits
- ✅ Professional, modern interface
- ✅ Lower barrier to entry
- ✅ Reduced user confusion
- ✅ Scalable for future roles
- ✅ Easy to customize domains
