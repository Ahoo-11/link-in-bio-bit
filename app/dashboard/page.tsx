"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye, 
  Settings,
  Palette,
  Share2,
  Download,
  Copy,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { getCreatorEarnings, getTipCount } from "@/lib/stacks";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    tipCount: 0,
    visitors: 0,
    conversionRate: 0,
  });
  const [recentTips, setRecentTips] = useState<any[]>([]);
  const [username, setUsername] = useState("creator");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view dashboard");
      router.push("/login");
      return;
    }
    
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Load user profile
      const profileData = await api.user.getProfile();
      setUsername(profileData.username);

      // Load analytics data
      const analyticsData = await api.analytics.getDashboard();
      
      // Load tip stats
      const tipStats = await api.tips.getStats();

      setStats({
        totalEarnings: tipStats.totalEarnings || 0,
        tipCount: tipStats.tipCount || 0,
        visitors: analyticsData.visits || 0,
        conversionRate: parseFloat(analyticsData.conversionRate) || 0,
      });

      // Load recent tips
      const tipsData = await api.tips.getRecent();
      setRecentTips(tipsData || []);
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      
      // If unauthorized, redirect to login
      if (error.message?.includes("Failed to fetch profile") || error.message?.includes("401")) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        toast.error("Failed to load dashboard data. Make sure the backend server is running on port 5000.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(link);
    toast.success("Profile link copied!");
  };

  const shareProfile = () => {
    const link = `${window.location.origin}/${username}`;
    if (navigator.share) {
      navigator.share({
        title: "Check out my LinkChain profile",
        url: link,
      });
    } else {
      copyProfileLink();
    }
  };

  // Sample chart data
  const earningsChartData = [
    { date: "Mon", earnings: 45 },
    { date: "Tue", earnings: 78 },
    { date: "Wed", earnings: 123 },
    { date: "Thu", earnings: 95 },
    { date: "Fri", earnings: 167 },
    { date: "Sat", earnings: 210 },
    { date: "Sun", earnings: 189 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            <h1 className="text-xl font-bold">LinkChain</h1>
            <div className="flex items-center space-x-4">
              <Link href={`/${username}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 w-4 h-4" />
                  View Profile
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {username}! 👋</h2>
          <p className="text-muted-foreground">Here's what's happening with your LinkChain</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/editor">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
              <Palette className="w-6 h-6 mb-2" />
              <span className="text-sm">Customize</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center"
            onClick={shareProfile}
          >
            <Share2 className="w-6 h-6 mb-2" />
            <span className="text-sm">Share</span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center"
            onClick={copyProfileLink}
          >
            <Copy className="w-6 h-6 mb-2" />
            <span className="text-sm">Copy Link</span>
          </Button>
          <Link href="/analytics">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="text-sm">Analytics</span>
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            icon={<DollarSign className="w-5 h-5" />}
            change="+12.5%"
            positive
          />
          <StatCard
            title="Total Tips"
            value={stats.tipCount.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            change="+8.2%"
            positive
          />
          <StatCard
            title="Profile Visits"
            value={stats.visitors.toString()}
            icon={<Eye className="w-5 h-5" />}
            change="+23.1%"
            positive
          />
          <StatCard
            title="Conversion"
            value={`${stats.conversionRate}%`}
            icon={<Users className="w-5 h-5" />}
            change="-2.4%"
            positive={false}
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Earnings Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Your earnings over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={earningsChartData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorEarnings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tips</CardTitle>
              <CardDescription>Latest supporter activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTips.length > 0 ? (
                  recentTips.slice(0, 5).map((tip, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {tip.anonymous ? "Anonymous" : tip.sender}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(tip.timestamp)}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(tip.amount)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tips yet</p>
                    <p className="text-xs mt-1">Share your profile to start earning!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  positive 
}: { 
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  positive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
          <p className="text-2xl font-bold mb-1">{value}</p>
          <p className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {change} from last week
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
