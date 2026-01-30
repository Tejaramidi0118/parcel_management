import { Users, Target, Award, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description:
        'To provide fast, reliable, and affordable courier services that connect people and businesses across India and beyond.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description:
        'We strive for excellence in every delivery, ensuring your parcels reach their destination safely and on time.',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description:
        'Our customers are at the heart of everything we do. We are committed to providing exceptional service and support.',
    },
    {
      icon: Users,
      title: 'Our Team',
      description:
        'A dedicated team of professionals working around the clock to ensure seamless delivery experiences.',
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">About Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Leading the way in courier and logistics services across India
          </p>
        </div>

        <div className="mb-16">
          <Card>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <p className="text-lg text-muted-foreground mb-4">
                  Courier Management System is India's premier courier and
                  logistics service provider, dedicated to delivering excellence
                  in every shipment. With years of experience in the industry,
                  we have built a reputation for reliability, speed, and
                  customer satisfaction.
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  Our state-of-the-art tracking system, extensive network of
                  hubs, and professional courier team ensure that your parcels
                  are handled with care and delivered on time, every time.
                </p>
                <p className="text-lg text-muted-foreground">
                  We serve thousands of customers daily, from individual
                  shippers to large enterprises, providing customized solutions
                  for all their courier needs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <p className="text-muted-foreground">Years of Experience</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <p className="text-muted-foreground">Service Locations</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
