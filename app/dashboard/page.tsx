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
  ExternalLink,
  Sparkles,
  Lightbulb,
  Target,
  RefreshCw,
  BarChart3,
  Link as LinkIcon
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
    earningsChange: 0,
    tipsChange: 0,
    visitorsChange: 0,
    conversionChange: 0,
  });
  const [recentTips, setRecentTips] = useState<any[]>([]);
  const [username, setUsername] = useState("creator");
  const [displayName, setDisplayName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [earningsChartData, setEarningsChartData] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

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
      setDisplayName(profileData.display_name || profileData.username);

      // Get date ranges for current and last week
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Load analytics data for current week
      const analyticsData = await api.analytics.getDashboard(
        sevenDaysAgo.toISOString(),
        now.toISOString()
      );
      
      // Load analytics data for last week
      const lastWeekAnalyticsData = await api.analytics.getDashboard(
        fourteenDaysAgo.toISOString(),
        sevenDaysAgo.toISOString()
      );
      
      // Load tip stats
      const tipStats = await api.tips.getStats();

      // Calculate changes
      const earningsChange = calculatePercentageChange(tipStats.totalEarnings || 0, 0); // We don't have last week earnings yet
      const tipsChange = calculatePercentageChange(tipStats.tipCount || 0, 0);
      const visitorsChange = calculatePercentageChange(
        analyticsData.visits || 0,
        lastWeekAnalyticsData.visits || 0
      );
      const conversionChange = calculatePercentageChange(
        parseFloat(analyticsData.conversionRate) || 0,
        parseFloat(lastWeekAnalyticsData.conversionRate) || 0
      );

      setStats({
        totalEarnings: tipStats.totalEarnings || 0,
        tipCount: tipStats.tipCount || 0,
        visitors: analyticsData.visits || 0,
        conversionRate: parseFloat(analyticsData.conversionRate) || 0,
        earningsChange,
        tipsChange,
        visitorsChange,
        conversionChange,
      });

      // Process chart data from daily earnings
      if (tipStats.dailyEarnings) {
        const chartData = processChartData(tipStats.dailyEarnings);
        setEarningsChartData(chartData);
      }

      // Load recent tips
      const tipsData = await api.tips.getRecent();
      setRecentTips(tipsData || []);

      // Load AI insights
      loadAiInsights();
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

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const processChartData = (dailyEarnings: Record<string, number>) => {
    const now = new Date();
    const chartData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      
      chartData.push({
        date: dayName,
        earnings: dailyEarnings[dateStr] || 0,
      });
    }

    return chartData;
  };

  const loadAiInsights = async () => {
    setLoadingInsights(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/ai/insights', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data);
      }
    } catch (error) {
      console.error("Failed to load AI insights:", error);
    } finally {
      setLoadingInsights(false);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Welcome back, {displayName}! 👋</h2>
          <p className="text-lg text-muted-foreground">Here's what's happening with your LinkChain</p>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="flex items-center justify-between mb-12 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          {/* Primary Actions */}
          <div className="flex items-center gap-2">
            <Link href="/editor">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 transition-all"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Customize</span>
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={shareProfile}
              className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            
            <Link href="/analytics">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyProfileLink}
              className="flex items-center gap-2 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-700 transition-all"
            >
              <LinkIcon className="w-4 h-4" />
              <span className="hidden md:inline">Copy Link</span>
            </Button>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            
            <Link href={`/${username}`}>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-700 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden md:inline">View Profile</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            icon={<DollarSign className="w-5 h-5" />}
            change={stats.earningsChange}
            positive={stats.earningsChange >= 0}
          />
          <StatCard
            title="Total Tips"
            value={stats.tipCount.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            change={stats.tipsChange}
            positive={stats.tipsChange >= 0}
          />
          <StatCard
            title="Profile Visits"
            value={stats.visitors.toString()}
            icon={<Eye className="w-5 h-5" />}
            change={stats.visitorsChange}
            positive={stats.visitorsChange >= 0}
          />
          <StatCard
            title="Conversion"
            value={`${stats.conversionRate}%`}
            icon={<Users className="w-5 h-5" />}
            change={stats.conversionChange}
            positive={stats.conversionChange >= 0}
          />
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <Card className="mb-12 border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <CardTitle>AI Insights</CardTitle>
                  {aiInsights.cached && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Today's Insights
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadAiInsights}
                  disabled={loadingInsights}
                  title="Refresh insights"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingInsights ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <CardDescription>
                {aiInsights.generatedAt 
                  ? `Generated ${new Date(aiInsights.generatedAt).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })} • Updates daily`
                  : 'AI-powered recommendations to boost your profile'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Optimization Score */}
                {aiInsights.score !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Optimization Score</span>
                      <span className="text-2xl font-bold text-purple-600">{aiInsights.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                        style={{ width: `${aiInsights.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Insights */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center text-base">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                    Key Insights
                  </h4>
                  <div className="grid gap-3">
                    {aiInsights.insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-purple-600 dark:text-purple-400 text-xs font-semibold">{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center text-base">
                      <Target className="w-5 h-5 mr-2 text-green-500" />
                      Recommended Actions
                    </h4>
                    <div className="grid gap-4">
                      {aiInsights.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1">{rec.action}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                              rec.impact === 'high' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : rec.impact === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {rec.impact}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
  change: number;
  positive: boolean;
}) {
  const formattedChange = change === 0 ? "No change" : 
    `${positive ? '+' : ''}${change.toFixed(1)}% from last week`;
  
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
          <p className={`text-xs ${change === 0 ? 'text-gray-600' : positive ? 'text-green-600' : 'text-red-600'}`}>
            {formattedChange}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
