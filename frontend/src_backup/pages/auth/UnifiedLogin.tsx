// frontend/src/pages/auth/UnifiedLogin.tsx
import React, {JSX, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/types";

/**
 * UnifiedLogin
 * - sends full email as `id` to backend (backend checks username OR email)
 * - on success, reads user.role from AuthContext and redirects accordingly
 * - fallback: if backend doesn't provide role, derive role from email domain
 */

export default function UnifiedLogin(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // fallback heuristic if backend doesn't give role
  const determineRoleFromEmail = (emailVal: string | undefined): UserRole | null => {
    if (!emailVal) return null;
    const e = emailVal.toLowerCase();
    if (e.endsWith("@swiftadmin.com")) return "admin";
    if (e.endsWith("@swiftcourier.com")) return "courier";
    if (e.includes("@")) return "customer";
    return null;
  };

  const getRedirectPath = (role: string | undefined): string => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "courier":
        return "/courier/dashboard";
      case "customer":
      default:
        return "/customer/dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Send the full email as 'id' (backend accepts username OR email)
      const success = await login(email, password);

      if (success) {
        // Use role from backend if available, otherwise fallback to heuristic on email
        const roleFromBackend = user?.role;
        const role = roleFromBackend ?? determineRoleFromEmail(email) ?? "customer";

        toast({
          title: "Login Successful",
          description: `Welcome back! Redirecting to your ${role} dashboard...`,
        });

        // slight delay for toast to show
        setTimeout(() => {
          navigate(getRedirectPath(role));
        }, 300);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please check your credentials.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err?.message ?? "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // demo/test accounts UI (keeps original behaviour)
  const demoAccounts = [
    {
      role: "Customer",
      email: "customer1@gmail.com",
      password: "customer123",
      description: "Access customer dashboard and tracking",
    },
    {
      role: "Courier",
      email: "courier1@swiftcourier.com",
      password: "courier123",
      description: "Manage deliveries and routes",
    },
    {
      role: "Admin",
      email: "admin@swiftadmin.com",
      password: "admin123",
      description: "Full system administration access",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">Sign in to access your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Your role is determined by your email domain</p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              <LogIn className="h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
              </div>
            </div>

            <div className="space-y-3">
              {demoAccounts.map((account, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground">{account.role}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        setEmail(account.email);
                        setPassword(account.password);
                      }}
                    >
                      Use
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{account.description}</p>

                  <div className="space-y-1">
                    <p className="text-xs font-mono text-foreground">{account.email}</p>
                    <p className="text-xs font-mono text-muted-foreground">Password: {account.password}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email domain guide */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs font-semibold text-foreground mb-2">Email Domain Guide:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <span className="font-mono">@gmail.com</span> (or any domain) → Customer</li>
              <li>• <span className="font-mono">@swiftcourier.com</span> → Courier</li>
              <li>• <span className="font-mono">@swiftadmin.com</span> → Admin</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
