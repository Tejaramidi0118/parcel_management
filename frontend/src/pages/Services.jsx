import { Package, Globe, Zap, Shield, Clock, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export default function Services() {
    const domesticServices = [
        {
            icon: Zap,
            title: 'Express Delivery',
            description: 'Same-day and next-day delivery options for urgent shipments',
            features: ['Same-day delivery in metro cities', 'Next-day delivery nationwide', 'Priority handling'],
        },
        {
            icon: Package,
            title: 'Standard Delivery',
            description: 'Cost-effective delivery for non-urgent parcels',
            features: ['2-5 business days delivery', 'Economical pricing', 'Reliable service'],
        },
        {
            icon: Truck,
            title: 'Bulk Shipping',
            description: 'Special rates for businesses and bulk orders',
            features: ['Volume discounts', 'Dedicated account manager', 'Flexible pickup schedules'],
        },
    ];
    const internationalServices = [
        {
            icon: Globe,
            title: 'Worldwide Shipping',
            description: 'Reliable international courier to over 200 countries',
            features: ['Door-to-door delivery', 'Customs clearance assistance', 'Real-time tracking'],
        },
        {
            icon: Shield,
            title: 'Secure Shipping',
            description: 'Enhanced security for valuable items',
            features: ['Insurance coverage', 'Tamper-proof packaging', 'Signature on delivery'],
        },
        {
            icon: Clock,
            title: 'Time-Definite Delivery',
            description: 'Guaranteed delivery by a specific time',
            features: ['10:30 AM delivery', 'Noon delivery', 'End-of-day delivery'],
        },
    ];
    return (<div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive courier solutions tailored to your needs
          </p>
        </div>

        <Tabs defaultValue="domestic" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="domestic">Domestic</TabsTrigger>
            <TabsTrigger value="international">International</TabsTrigger>
          </TabsList>

          <TabsContent value="domestic">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {domesticServices.map((service, index) => (<Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <service.icon className="h-6 w-6 text-primary"/>
                      </div>
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Package className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>
                          <span>{feature}</span>
                        </li>))}
                    </ul>
                  </CardContent>
                </Card>))}
            </div>
          </TabsContent>

          <TabsContent value="international">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {internationalServices.map((service, index) => (<Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-secondary/10 rounded-lg">
                        <service.icon className="h-6 w-6 text-secondary"/>
                      </div>
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0"/>
                          <span>{feature}</span>
                        </li>))}
                    </ul>
                  </CardContent>
                </Card>))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-16 bg-muted/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Additional Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Packaging Services</h3>
              <p className="text-sm text-muted-foreground">
                Professional packaging materials and services to ensure your items are protected during transit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Insurance Coverage</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive insurance options to protect your valuable shipments against loss or damage.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Pickup Services</h3>
              <p className="text-sm text-muted-foreground">
                Convenient doorstep pickup services available across all major cities.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Cash on Delivery</h3>
              <p className="text-sm text-muted-foreground">
                COD services available for domestic shipments with quick remittance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
