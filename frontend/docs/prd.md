# Courier Management System Requirements Document

## 1. Project Overview

### 1.1 Website Name
Courier Management System

### 1.2 Website Description
A comprehensive frontend-only courier management platform built with ReactJS that simulates a complete courier ecosystem including customer order management, courier delivery tracking, and administrative operations.

### 1.3 Website Functions
- Multi-role authentication system (Customer/Courier/Admin)\n- Parcel tracking and timeline visualization
- Order management and delivery assignment
- Hub and vehicle management
- Fare calculation system
- Real-time delivery status updates
- Administrative dashboard and audit logs
- Route planning and visualization
- User profile management
- Support and contact systems

## 2. Technical Requirements

### 2.1 Technology Stack
- **Framework**: ReactJS with Vite
- **File Format**: JSX only (no TypeScript)
- **Routing**: React Router\n- **State Management**: React Context + hooks (useState, useReducer, useContext)
- **Data**: Mock JavaScript objects/arrays (no backend)
- **Styling**: Responsive design with CSS/Tailwind/Bootstrap/Material UI

### 2.2 Project Structure
```\nsrc/
  components/
  customer/
  driver/
  admin/
  data/
  context/
  pages/
  App.jsx
  main.jsx\n```

## 3. Data Entities (Mock Simulation)

### 3.1 User Management
- **Users**: username, password, name, email, address, phone numbers, creation date
- **Roles**: Customer, Courier, Admin with specialized permissions
- **Authentication**: Mock login system with role-based access

### 3.2 Location & Infrastructure
- **Cities & States**: Indian cities with latitude/longitude coordinates
- **Hubs**: Warehouses and sorting centers with capacity and contact info
- **Vehicles**: Courier-assigned vehicles with capacity and license details

### 3.3 Parcel Management
- **Parcels**: Tracking code, sender/recipient, cities, hub assignment, courier assignment, weight, dimensions, status, delivery date
- **Parcel Items**: Description, quantity, declared value for each item
- **Tracking Events**: Timeline with event types, timestamps, locations, and actors
- **Route Points**: Waypoint sequences with distance calculations

### 3.4 System Operations
- **Graph Nodes & Edges**: Hub/city connections for route visualization
- **Audit Logs**: System action tracking and user activity logs

## 4. Page Structure

### 4.1 Public Pages
- Home page with service overview
- About Us company information
- Services (Domestic & International shipping)
- Contact Us with support information
- Fare Calculator for pricing estimates

### 4.2 Customer Portal
- Customer login and signup
- Customer dashboard with order overview
- Order tracking by tracking number
- Timeline view for parcel status
- Contact support system

### 4.3 Courier Portal
- Courier login and signup
- Assigned orders list and management
- Delivery tracking with status updates
- Editable courier profile
- Courier support access

### 4.4 Admin Portal
- Comprehensive admin dashboard
- Hub management interface
- User management (customers and couriers)
- Vehicle fleet management
- Parcel oversight and assignment
- Audit log viewing
- System overview and analytics

## 5. Core Features

### 5.1 Tracking System
- Real-time parcel status simulation
- Event timeline with sequence tracking
- Status categories: Picked Up, Arrived at Hub, Out for Delivery, Delivered
- Proof and notes documentation

### 5.2 Fare Calculation\n- Weight-based pricing
- Distance calculation between cities
- Service type differentiation
- Dynamic pricing display

### 5.3 Route Management
- Graph-based routing visualization
- Shortest path calculation (mock)
- Hub-to-hub connection mapping
- Delivery route optimization

### 5.4 Assignment Logic
- Automatic courier assignment simulation
- Hub allocation based on location
- Vehicle capacity management
- Route planning integration

## 6. User Experience Requirements

### 6.1 Role-Based Navigation
- Customized dashboards per user type
- Role-specific menu structures
- Appropriate access control simulation

### 6.2 Responsive Design
- Mobile-first approach
- Desktop optimization
- Cross-device compatibility
- Touch-friendly interfaces

## 7. Website Design Style

### 7.1 Color Scheme
- Primary: Professional blue (#2563eb) for trust and reliability
- Secondary: Orange accent (#f97316) for action items and notifications
- Background: Clean white (#ffffff) with light gray sections (#f8fafc)
- Text: Dark gray (#374151) for readability

### 7.2 Visual Elements
- Card-based layouts for orders, hubs, and vehicles
- Table layouts for administrative data management
- Timeline UI components for tracking events
- Modern rounded corners (8px border-radius)
- Subtle shadows for depth and hierarchy

### 7.3 Layout Structure
- Grid-based responsive layout
- Consistent spacing using 8px increments
- Clear visual hierarchy with typography scaling
- Icon integration for intuitive navigation
- Progress indicators for multi-step processes