"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, TrendingUp, Users, MousePointer, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { downloadCSV, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard?range=${timeRange}`,
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

  // Sample data for demonstration
  const trafficData = [
    { date: "Mon", visits: 234, clicks: 89 },
    { date: "Tue", visits: 312, clicks: 121 },
    { date: "Wed", visits: 289, clicks: 98 },
    { date: "Thu", visits: 401, clicks: 156 },
    { date: "Fri", visits: 478, clicks: 189 },
    { date: "Sat", visits: 523, clicks: 201 },
    { date: "Sun", visits: 445, clicks: 167 },
  ];

  const buttonClickData = [
    { name: "Support me - $5", clicks: 145, fill: "#8b5cf6" },
    { name: "Instagram", clicks: 234, fill: "#ec4899" },
    { name: "Twitter", clicks: 189, fill: "#3b82f6" },
    { name: "Website", clicks: 98, fill: "#10b981" },
  ];

  const sourceData = [
    { name: "Direct", value: 45, fill: "#8b5cf6" },
    { name: "Instagram", value: 30, fill: "#ec4899" },
    { name: "Twitter", value: 15, fill: "#3b82f6" },
    { name: "Other", value: 10, fill: "#6b7280" },
  ];

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
            value="2,384"
            change="+12.5%"
            icon={<Users className="w-5 h-5" />}
            positive
          />
          <MetricCard
            title="Total Clicks"
            value="1,021"
            change="+8.2%"
            icon={<MousePointer className="w-5 h-5" />}
            positive
          />
          <MetricCard
            title="Click Rate"
            value="42.8%"
            change="-2.1%"
            icon={<TrendingUp className="w-5 h-5" />}
            positive={false}
          />
          <MetricCard
            title="Total Earnings"
            value="$1,234"
            change="+23.4%"
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

        {/* Traffic Sources */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Performing Buttons</CardTitle>
              <CardDescription>Most clicked buttons on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buttonClickData.map((button, index) => (
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
                            width: `${(button.clicks / Math.max(...buttonClickData.map(b => b.clicks))) * 100}%`,
                            backgroundColor: button.fill,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where visitors come from</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
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
