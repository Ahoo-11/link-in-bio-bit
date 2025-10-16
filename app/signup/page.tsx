"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, User, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { connectWallet, getUserAddress, getUserProfile } from "@/lib/stacks";
import { toast } from "sonner";
import { api } from "@/lib/api";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: searchParams.get("username") || "",
    email: "",
    displayName: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.auth.signup(formData);
      localStorage.setItem("token", response.token);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletSignup = async () => {
    setLoading(true);
    
    try {
      connectWallet(async (userData) => {
        try {
          const walletAddress = getUserAddress();
          
          if (!walletAddress) {
            toast.error("Failed to get wallet address");
            setLoading(false);
            return;
          }

          // Create account with wallet
          const username = formData.username || userData.username || `user${Date.now()}`;
          const displayName = formData.displayName || userData.profile?.name || username;

          // Call backend wallet-login API (creates account if doesn't exist)
          const response = await api.auth.walletLogin(walletAddress, username, displayName);
          
          // Store token
          localStorage.setItem("token", response.token);
          
          toast.success("Account created successfully!");
          router.push("/dashboard");
        } catch (error: any) {
          console.error("Wallet signup error:", error);
          toast.error(error.message || "Failed to create account");
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-gradient-purple rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Create Your Profile</CardTitle>
              <CardDescription>
                Choose how you want to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Wallet Signup Option */}
              <Button
                onClick={handleWalletSignup}
                variant="outline"
                className="w-full h-14 text-base"
              >
                <Wallet className="mr-2 w-5 h-5" />
                Connect Wallet
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email Signup Form */}
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    type="text"
                    placeholder="yourname"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    pattern="[a-z0-9_-]{3,20}"
                    title="3-20 characters, lowercase letters, numbers, hyphens, underscores only"
                  />
                  <p className="text-xs text-muted-foreground">
                    linkchain.app/{formData.username || "yourname"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    type="text"
                    placeholder="Your Name"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-purple text-white h-11"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
