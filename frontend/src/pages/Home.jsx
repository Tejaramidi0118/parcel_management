import { Link } from 'react-router-dom';
import { Package, Truck, MapPin, Clock, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export default function Home() {
    const features = [
        {
            icon: Truck,
            title: 'Fast Delivery',
            description: 'Express delivery services across India with real-time tracking',
        },
        {
            icon: MapPin,
            title: 'Wide Coverage',
            description: 'Serving major cities and towns across the country',
        },
        {
            icon: Clock,
            title: '24/7 Support',
            description: 'Round-the-clock customer support for all your queries',
        },
        {
            icon: Shield,
            title: 'Secure Handling',
            description: 'Your parcels are safe with our secure handling process',
        },
        {
            icon: Globe,
            title: 'International Shipping',
            description: 'Reliable international courier services worldwide',
        },
        {
            icon: Package,
            title: 'Easy Tracking',
            description: 'Track your parcels in real-time with our advanced system',
        },
    ];
    return (<div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl xl:text-6xl font-bold text-foreground mb-6">
              Fast, Reliable Courier Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Your trusted partner for domestic and international shipping.
              Track your parcels in real-time and enjoy seamless delivery
              experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/fare-calculator">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Calculate Fare
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Us
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive courier solutions with cutting-edge
              technology and exceptional service quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((feature, index) => (<Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary"/>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Track Your Parcel Anytime, Anywhere
              </h2>
              <p className="text-muted-foreground mb-6">
                Our advanced tracking system allows you to monitor your parcel's
                journey from pickup to delivery. Get real-time updates and
                notifications at every step.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-primary mt-0.5"/>
                  <span className="text-foreground">
                    Real-time tracking updates
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-primary mt-0.5"/>
                  <span className="text-foreground">
                    Detailed timeline of parcel journey
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-primary mt-0.5"/>
                  <span className="text-foreground">
                    SMS and email notifications
                  </span>
                </li>
              </ul>
              <Link to="/login">
                <Button>Start Tracking</Button>
              </Link>
            </div>
            <div className="bg-card p-8 rounded-lg shadow-lg border border-border">
              <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold text-primary">10,000+</p>
                  <p className="text-sm text-muted-foreground">
                    Deliveries Daily
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Cities Covered</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">98%</p>
                  <p className="text-sm text-muted-foreground">
                    On-Time Delivery
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">24/7</p>
                  <p className="text-sm text-muted-foreground">
                    Customer Support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Ship?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their
            deliveries. Get started today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>);
}
