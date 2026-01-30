import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-primary">
                Courier Management
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your trusted partner for fast, reliable, and secure courier
              services across India.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                to="/about"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/services"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Services
              </Link>
              <Link
                to="/fare-calculator"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Fare Calculator
              </Link>
              <Link
                to="/contact"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">
              Services
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Domestic Shipping</p>
              <p className="text-sm text-muted-foreground">
                International Shipping
              </p>
              <p className="text-sm text-muted-foreground">Express Delivery</p>
              <p className="text-sm text-muted-foreground">Parcel Tracking</p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  123 Business Park, Mumbai, Maharashtra 400001
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  +91-1800-123-4567
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  support@courier.com
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            {currentYear} Courier Management System
          </p>
        </div>
      </div>
    </footer>
  );
}
