# Courier Management System - User Guide

## Welcome to the Courier Management System!

This comprehensive courier management platform allows you to track parcels, manage deliveries, and oversee courier operations. The system supports three types of users: Customers, Couriers, and Administrators.

## Getting Started

### For Customers

#### Creating an Account
1. Click on **"Customer Login"** in the header
2. Click **"Sign up"** link at the bottom
3. Fill in your details:
   - Username (unique)
   - Password
   - Full Name
   - Email
   - Phone Number
   - Address
4. Click **"Sign Up"** to create your account

#### Logging In
1. Click **"Customer Login"** in the header
2. Enter your username and password
3. Click **"Login"**

**Demo Account**: Use `customer1` / `customer123` to try the system

#### Using the Customer Dashboard
Once logged in, you'll see:
- **Statistics Cards**: Quick overview of your parcels
  - Pending parcels
  - Parcels in transit
  - Delivered parcels
- **Track Your Parcel**: Search box to track any parcel by tracking code
- **Recent Parcels**: List of your recent shipments

#### Tracking a Parcel
1. Enter the tracking code in the search box (e.g., `TRK1001234567`)
2. Click **"Track"** button
3. View detailed information:
   - Current status
   - Route information (origin and destination)
   - Recipient details
   - Package details (weight, dimensions, fare)
   - Complete timeline of parcel journey

#### Understanding Parcel Status
- **Pending**: Order created, awaiting pickup
- **Picked Up**: Collected from sender
- **In Transit**: Moving between hubs
- **At Hub**: Arrived at distribution center
- **Out for Delivery**: On the way to recipient
- **Delivered**: Successfully delivered

### For Couriers

#### Logging In
1. Click **"Courier Login"** in the header
2. Enter credentials: `courier1` / `courier123`
3. Click **"Login"**

#### Managing Deliveries
Your dashboard shows:
- **Statistics**: Pending, in-transit, and delivered counts
- **Assigned Deliveries**: List of parcels assigned to you

#### Updating Parcel Status
1. Find the parcel in your assigned deliveries list
2. Click the appropriate action button:
   - **"Mark Out for Delivery"**: When you start delivery
   - **"Mark as Delivered"**: When delivery is complete
3. The system automatically logs the update

#### Viewing Parcel Details
Each parcel card shows:
- Tracking code
- Current status
- Route (origin → destination)
- Recipient name and phone
- Delivery address
- Package weight

### For Administrators

#### Logging In
1. Click **"Admin Login"** in the header
2. Enter credentials: `admin` / `admin123`
3. Click **"Login"**

#### Admin Dashboard
The main dashboard provides:
- **System Statistics**:
  - Total parcels (active and delivered)
  - Total users (customers and couriers)
  - Number of hubs
  - Fleet vehicles count
- **Quick Actions**: Direct links to management pages
- **System Statistics**: Delivery success rate, active deliveries
- **Recent Parcels**: Latest parcel activities

#### Managing Hubs
Navigate to **Manage Hubs** to:
- View all distribution centers
- See hub details (location, capacity, contact info)
- Add new hubs (button available)
- Edit or delete existing hubs

#### Managing Vehicles
Navigate to **Manage Vehicles** to:
- View all fleet vehicles
- See vehicle details (license plate, type, capacity)
- Check vehicle status (active, inactive, maintenance)
- View assigned courier for each vehicle
- Add, edit, or delete vehicles

#### Managing Users
Navigate to **Manage Users** to:
- View all system users
- See user details (name, username, email, phone)
- Identify user roles (customer, courier, admin)
- Add, edit, or delete users

#### Managing Parcels
Navigate to **Manage Parcels** to:
- View all parcels in the system
- See parcel details (tracking code, sender, recipient)
- Check routes and current status
- Monitor weights and fares

#### Viewing Audit Logs
Navigate to **Audit Logs** to:
- Review system activities
- See user actions (CREATE, UPDATE, DELETE)
- Track changes to entities (hubs, vehicles, parcels, users)
- View timestamps and details of each action

## Using the Fare Calculator

The Fare Calculator helps estimate shipping costs:

1. Navigate to **"Fare Calculator"** from the header
2. Fill in the details:
   - **Origin City**: Select from dropdown
   - **Destination City**: Select from dropdown
   - **Weight**: Enter package weight in kg
   - **Service Type**: Choose Standard, Express, or International
3. Click **"Calculate Fare"**
4. View the estimated cost

### Pricing Information
- Base fare: ₹50
- Distance charge: ₹0.50 per kilometer
- Weight charge: ₹20 per kg
- Express delivery: 1.5x multiplier
- International shipping: 3x multiplier

## Sample Tracking Codes

Try these tracking codes to see different parcel statuses:

- **TRK1001234567**: Out for delivery (Mumbai → Bangalore)
- **TRK1001234568**: At hub (Delhi → Mumbai)
- **TRK1001234569**: In transit (Mumbai → Chennai)
- **TRK1001234570**: Pending (Delhi → Kolkata)

## Tips and Best Practices

### For Customers
- Save your tracking codes for easy reference
- Check tracking regularly for updates
- Contact support if you notice any issues
- Ensure recipient details are accurate

### For Couriers
- Update parcel status promptly
- Review assigned deliveries at the start of your shift
- Check recipient phone numbers before delivery
- Note any delivery issues in the system

### For Administrators
- Regularly review audit logs for system health
- Monitor delivery success rates
- Ensure vehicles are properly maintained
- Keep hub information up to date

## Frequently Asked Questions

**Q: Can I track someone else's parcel?**
A: Yes, if you have the tracking code, you can track any parcel in the system.

**Q: How do I change my password?**
A: Currently, password changes are not implemented in this demo version.

**Q: What happens if a parcel is delayed?**
A: Check the tracking timeline for the latest updates. Contact support for assistance.

**Q: Can I cancel a parcel?**
A: Parcel cancellation is not implemented in this demo version.

**Q: How accurate is the fare calculator?**
A: The calculator provides estimates based on distance, weight, and service type. Actual charges may vary.

## Contact Support

For any questions or issues:
- **Phone**: +91-1800-123-4567
- **Email**: support@courier.com
- **Address**: 123 Business Park, Mumbai, Maharashtra 400001
- **Hours**: Monday-Friday, 9:00 AM - 6:00 PM

## System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection
- Recommended screen resolution: 1280x720 or higher

## Privacy and Security

- All data is stored locally in your browser
- No personal information is sent to external servers
- This is a demo system with mock data
- For production use, implement proper security measures

---

**Thank you for using the Courier Management System!**

For technical documentation, see IMPLEMENTATION_SUMMARY.md
