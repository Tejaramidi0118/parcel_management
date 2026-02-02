import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import FareCalculator from './pages/FareCalculator';
import UnifiedLogin from './pages/auth/UnifiedLogin';
import UnifiedSignup from './pages/auth/UnifiedSignup';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Tracking from './pages/customer/Tracking';
import CourierDashboard from './pages/courier/CourierDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageHubs from './pages/admin/ManageHubs';
import ManageVehicles from './pages/admin/ManageVehicles';
import ManageUsers from './pages/admin/ManageUsers';
import ManageParcels from './pages/admin/ManageParcels';
import AuditLogs from './pages/admin/AuditLogs';
import ProtectedRoute from './components/shared/ProtectedRoute';
import BookParcel from './pages/customer/BookParcel';
import StoreOwnerDashboard from './pages/store/StoreOwnerDashboard';
import MarketplaceHome from './pages/shop/MarketplaceHome';
import StorePage from './pages/shop/StorePage';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import Profile from './pages/common/Profile';

const routes = [
    {
        name: 'Profile',
        path: '/profile',
        element: (<ProtectedRoute allowedRoles={['customer', 'courier', 'admin', 'store_owner']}>
            <Profile />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Home',
        path: '/',
        element: <Home />,
        visible: false,
    },
    {
        name: 'About',
        path: '/about',
        element: <About />,
        visible: false,
    },
    {
        name: 'Services',
        path: '/services',
        element: <Services />,
        visible: false,
    },
    {
        name: 'Contact',
        path: '/contact',
        element: <Contact />,
        visible: false,
    },
    {
        name: 'Fare Calculator',
        path: '/fare-calculator',
        element: <FareCalculator />,
        visible: false,
    },
    {
        name: 'Login',
        path: '/login',
        element: <UnifiedLogin />,
        visible: false,
    },
    {
        name: 'Signup',
        path: '/signup',
        element: <UnifiedSignup />,
        visible: false,
    },
    {
        name: 'Customer Login',
        path: '/customer/login',
        element: <UnifiedLogin />,
        visible: false,
    },
    {
        name: 'Customer Signup',
        path: '/customer/signup',
        element: <UnifiedSignup />,
        visible: false,
    },
    {
        name: 'Customer Dashboard',
        path: '/customer/dashboard',
        element: (<ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Tracking',
        path: '/customer/tracking',
        element: (<ProtectedRoute allowedRoles={['customer']}>
            <Tracking />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Courier Login',
        path: '/courier/login',
        element: <UnifiedLogin />,
        visible: false,
    },
    {
        name: 'Courier Signup',
        path: '/courier/signup',
        element: <UnifiedSignup />,
        visible: false,
    },
    {
        name: 'Book Parcel',
        path: '/customer/book',
        element: (<ProtectedRoute allowedRoles={['customer']}>
            <BookParcel />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Courier Dashboard',
        path: '/courier/dashboard',
        element: (<ProtectedRoute allowedRoles={['courier']}>
            <CourierDashboard />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Store Dashboard',
        path: '/store/dashboard',
        element: (<ProtectedRoute allowedRoles={['store_owner']}>
            <StoreOwnerDashboard />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Shop',
        path: '/shop',
        element: (<ProtectedRoute allowedRoles={['customer']}>
            <MarketplaceHome />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Store Page',
        path: '/store/:id',
        element: (<ProtectedRoute allowedRoles={['customer']}>
            <StorePage />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Cart',
        path: '/cart',
        element: (<ProtectedRoute allowedRoles={['customer']}>
            <Cart />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Checkout',
        path: '/checkout',
        element: (<ProtectedRoute allowedRoles={['customer']}>
            <Checkout />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Admin Login',
        path: '/admin/login',
        element: <UnifiedLogin />,
        visible: false,
    },
    {
        name: 'Admin Signup',
        path: '/admin/signup',
        element: <UnifiedSignup />,
        visible: false,
    },
    {
        name: 'Admin Dashboard',
        path: '/admin/dashboard',
        element: (<ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Manage Hubs',
        path: '/admin/hubs',
        element: (<ProtectedRoute allowedRoles={['admin']}>
            <ManageHubs />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Manage Vehicles',
        path: '/admin/vehicles',
        element: (<ProtectedRoute allowedRoles={['admin']}>
            <ManageVehicles />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Manage Users',
        path: '/admin/users',
        element: (<ProtectedRoute allowedRoles={['admin']}>
            <ManageUsers />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Manage Parcels',
        path: '/admin/parcels',
        element: (<ProtectedRoute allowedRoles={['admin']}>
            <ManageParcels />
        </ProtectedRoute>),
        visible: false,
    },
    {
        name: 'Audit Logs',
        path: '/admin/audit-logs',
        element: (<ProtectedRoute allowedRoles={['admin']}>
            <AuditLogs />
        </ProtectedRoute>),
        visible: false,
    },
];
export default routes;
