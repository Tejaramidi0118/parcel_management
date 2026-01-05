// frontend/src/pages/auth/UnifiedSignup.tsx
import React, { JSX, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/types";

export default function UnifiedSignup(): JSX.Element {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address_street: "",
    address_area: "",
    address_city: "",
    address_pincode: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const determineRoleFromEmail = (email: string): UserRole | null => {
    const emailLower = email.toLowerCase();

    if (emailLower.endsWith("@swiftadmin.com")) {
      return "admin";
    } else if (emailLower.endsWith("@swiftcourier.com")) {
      return "courier";
    } else if (emailLower.includes("@")) {
      return "customer";
    }
    return null;
  };

  const getRedirectPath = (role: UserRole): string => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "courier":
        return "/courier/dashboard";
      case "customer":
        return "/customer/dashboard";
      default:
        return "/";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // password checks
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const role = determineRoleFromEmail(formData.email);
    if (!role) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const username = formData.email.split("@")[0];

    try {
      const payload = {
        username,
        password: formData.password,
        full_name: formData.name,
        email: formData.email,
        role,
        phone: formData.phone || null,
        address_street: formData.address_street || null,
        address_area: formData.address_area || null,
        address_city: formData.address_city || null,
        address_pincode: formData.address_pincode || null,
      };

      await signup(payload);

      toast({
        title: "Account Created",
        description: `Welcome! Your ${role} account has been created successfully.`,
      });

      setTimeout(() => {
        navigate(getRedirectPath(role));
      }, 500);
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description:
          error instanceof Error
            ? error.message
            : error?.toString?.() ?? "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Sign up to get started with our courier services
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Your role is determined by your email domain</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Address - split fields */}
            <div className="space-y-2">
              <Label htmlFor="address_street">Street / House</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address_street"
                  name="address_street"
                  type="text"
                  placeholder="123 Main St"
                  value={formData.address_street}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>

              <div className="mt-2">
                <Label htmlFor="address_area">Area / Locality</Label>
                <Input
                  id="address_area"
                  name="address_area"
                  type="text"
                  placeholder="Ashoka Colony"
                  value={formData.address_area}
                  onChange={handleChange}
                  className="pl-3"
                  required
                />
              </div>

              <div className="flex gap-3 mt-2">
                <div className="w-2/3">
                  <Label htmlFor="address_city">City</Label>
                  <Input
                    id="address_city"
                    name="address_city"
                    type="text"
                    placeholder="Hanamkonda"
                    value={formData.address_city}
                    onChange={handleChange}
                    className="pl-3"
                    required
                  />
                </div>
                <div className="w-1/3">
                  <Label htmlFor="address_pincode">Pincode</Label>
                  <Input
                    id="address_pincode"
                    name="address_pincode"
                    type="text"
                    placeholder="506001"
                    value={formData.address_pincode}
                    onChange={handleChange}
                    className="pl-3"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              <UserPlus className="h-4 w-4" />
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs font-semibold text-foreground mb-2">Email Domain Guide:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                • <span className="font-mono">@gmail.com</span> (or any domain) → Customer Account
              </li>
              <li>
                • <span className="font-mono">@swiftcourier.com</span> → Courier Account
              </li>
              <li>
                • <span className="font-mono">@swiftadmin.com</span> → Admin Account
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
