"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, TrendingUp, Users, MousePointer, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { downloadCSV, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import VisitorAnalytics from "@/components/visitor-analytics";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Get user info for username
      if (!username) {
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsername(userData.username);
        }
      }
      
      // Calculate date range
      const now = new Date();
      let startDate;
      switch (timeRange) {
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard?startDate=${startDate.toISOString()}&endDate=${now.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;

    const data = analytics.dailyStats.map((stat: any) => ({
      Date: stat._id.date,
      Visits: stat.eventType === 'visit' ? stat.count : 0,
      Clicks: stat.eventType === 'click' ? stat.count : 0,
    }));

    downloadCSV(data, `linkchain-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success("Analytics exported!");
  };

  // Process real data for charts
  const getTrafficData = () => {
    if (!analytics?.dailyStats) return [];
    
    const dataMap: Record<string, { visits: number; clicks: number }> = {};
    
    analytics.dailyStats.forEach((stat: any) => {
      const date = stat._id.date;
      if (!dataMap[date]) {
        dataMap[date] = { visits: 0, clicks: 0 };
      }
      if (stat._id.eventType === 'visit') {
        dataMap[date].visits = stat.count;
      } else if (stat._id.eventType === 'click') {
        dataMap[date].clicks = stat.count;
      }
    });

    return Object.entries(dataMap)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        ...data,
      }))
      .slice(-7); // Last 7 days
  };

  const getButtonClickData = () => {
    if (!analytics?.buttonStats) return [];
    
    const colors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];
    
    return analytics.buttonStats.slice(0, 5).map((stat: any, index: number) => ({
      name: stat._id,
      clicks: stat.clicks,
      fill: colors[index % colors.length],
    }));
  };

  const trafficData = getTrafficData();
  const buttonClickData = getButtonClickData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
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
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="mr-2 w-4 h-4" />
              Export Data
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your profile performance and engagement</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2 mb-6">
          {["24h", "7d", "30d", "90d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === "24h" ? "24 Hours" : range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </Button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Visits"
            value={analytics?.visits?.toLocaleString() || "0"}
            change="N/A"
            icon={<Users className="w-5 h-5" />}
            positive
          />
          <MetricCard
            title="Total Clicks"
            value={analytics?.clicks?.toLocaleString() || "0"}
            change="N/A"
            icon={<MousePointer className="w-5 h-5" />}
            positive
          />
          <MetricCard
            title="Click Rate"
            value={`${analytics?.conversionRate || 0}%`}
            change="N/A"
            icon={<TrendingUp className="w-5 h-5" />}
            positive
          />
          <MetricCard
            title="Total Earnings"
            value="$0.00"
            change="N/A"
            icon={<DollarSign className="w-5 h-5" />}
            positive
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Visits and clicks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visits" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicks" stroke="#ec4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Button Clicks */}
          <Card>
            <CardHeader>
              <CardTitle>Button Performance</CardTitle>
              <CardDescription>Clicks per button</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={buttonClickData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Buttons</CardTitle>
            <CardDescription>Most clicked buttons on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            {buttonClickData.length > 0 ? (
              <div className="space-y-4">
                {buttonClickData.map((button: any, index: number) => {
                  const maxClicks = Math.max(...buttonClickData.map((b: any) => b.clicks || 0), 1);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: button.fill }}
                        />
                        <span className="font-medium">{button.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">{button.clicks} clicks</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${(button.clicks / maxClicks) * 100}%`,
                              backgroundColor: button.fill,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No button clicks yet</p>
            )}
          </CardContent>
        </Card>

        {/* Nexus Visitor Analytics */}
        {username && (
          <div className="mt-8">
            <VisitorAnalytics username={username} timeframe={timeRange} />
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  positive 
}: { 
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
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
            {change} from last period
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
