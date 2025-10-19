"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2, Wallet, Bell, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { connectWallet, disconnectWallet, getUserAddress, isWalletConnected } from "@/lib/stacks";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    displayName: "",
    bio: "",
    walletAddress: "",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    showEarnings: false,
    requireMessage: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    loadSettings();
    setWalletConnected(isWalletConnected());
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          username: data.username,
          email: data.email || "",
          displayName: data.display_name || "",
          bio: data.bio || "",
          walletAddress: data.wallet_address || "",
        });
        setSettings(data.settings || settings);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectWallet = () => {
    connectWallet(async (userData) => {
      const address = getUserAddress();
      if (address) {
        setProfile({ ...profile, walletAddress: address });
        setWalletConnected(true);
        
        // Save wallet address to backend
        try {
          const token = localStorage.getItem("token");
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ walletAddress: address }),
          });
          toast.success("Wallet connected and saved!");
        } catch (error) {
          toast.error("Wallet connected but failed to save");
        }
      }
    });
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setWalletConnected(false);
    toast.success("Wallet disconnected");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your public profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <Input value={profile.username} disabled className="bg-gray-100" />
                <p className="text-xs text-muted-foreground mt-1">
                  Your username cannot be changed
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Display Name</label>
                <Input
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Input
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell people about yourself"
                  maxLength={500}
                />
              </div>

              <Button onClick={saveProfile} disabled={saving} className="w-full">
                <Save className="mr-2 w-4 h-4" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Wallet Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connection</CardTitle>
              <CardDescription>Connect your Stacks wallet to receive payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletConnected && profile.walletAddress ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Wallet Connected</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.walletAddress.slice(0, 8)}...{profile.walletAddress.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleDisconnectWallet}>
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <Button onClick={handleConnectWallet} className="w-full">
                  <Wallet className="mr-2 w-4 h-4" />
                  Connect Wallet
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Notifications</CardTitle>
              <CardDescription>Control your privacy and notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email when you get a tip</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Show Earnings Publicly</p>
                    <p className="text-sm text-muted-foreground">Display your earnings on your profile</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showEarnings}
                  onChange={(e) => setSettings({ ...settings, showEarnings: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Require Tip Message</p>
                    <p className="text-sm text-muted-foreground">Supporters must leave a message</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireMessage}
                  onChange={(e) => setSettings({ ...settings, requireMessage: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
              </div>

              <Button onClick={saveSettings} disabled={saving} className="w-full">
                <Save className="mr-2 w-4 h-4" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 w-4 h-4" />
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This action cannot be undone
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
