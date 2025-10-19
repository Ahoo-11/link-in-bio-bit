"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Monitor, Smartphone, Tablet, Users, Eye, Clock, MousePointer2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface VisitorAnalytics {
  totalVisits: number;
  uniqueVisitors: number;
  firstTimeVisitors: number;
  returningVisitors: number;
  avgSessionDuration: number;
  deviceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  topReferrers: Array<{ domain: string; count: number }>;
}

interface VisitorAnalyticsProps {
  username: string;
  timeframe?: string;
}

const DEVICE_COLORS = {
  mobile: "#ec4899",
  tablet: "#8b5cf6",
  desktop: "#3b82f6",
};

const DEVICE_ICONS = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export default function VisitorAnalytics({ username, timeframe = "7d" }: VisitorAnalyticsProps) {
  const [analytics, setAnalytics] = useState<VisitorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisitorAnalytics();
  }, [username, timeframe]);

  const loadVisitorAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/visitor/analytics/${username}?timeframe=${timeframe}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to load visitor analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Loading visitor insights...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  // Format device data for pie chart
  const deviceData = Object.entries(analytics.deviceBreakdown).map(([device, count]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: count,
    color: DEVICE_COLORS[device as keyof typeof DEVICE_COLORS] || "#6b7280",
  }));

  // Format country data for bar chart (top 5)
  const countryData = Object.entries(analytics.countryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({
      name: country,
      visitors: count,
    }));

  // Format session duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Visitor Insights</h2>
        <p className="text-muted-foreground">Detailed visitor analytics powered by Nexus</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{analytics.totalVisits.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Unique Visitors</p>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg. Session</p>
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{formatDuration(analytics.avgSessionDuration)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Returning</p>
              <MousePointer2 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">
              {analytics.totalVisits > 0
                ? Math.round((analytics.returningVisitors / analytics.totalVisits) * 100)
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Visitor devices used to access your profile</CardDescription>
          </CardHeader>
          <CardContent>
            {deviceData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="space-y-2">
                  {deviceData.map((device) => {
                    const Icon = DEVICE_ICONS[device.name.toLowerCase() as keyof typeof DEVICE_ICONS] || Monitor;
                    const percentage = ((device.value / analytics.totalVisits) * 100).toFixed(1);
                    return (
                      <div key={device.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: device.color }}
                          />
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{device.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{device.value} visits</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No device data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Top 5 countries visiting your profile</CardDescription>
          </CardHeader>
          <CardContent>
            {countryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={countryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No geographic data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
          <CardDescription>Where your visitors are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topReferrers.length > 0 ? (
            <div className="space-y-3">
              {analytics.topReferrers.map((referrer, index) => {
                const maxCount = Math.max(...analytics.topReferrers.map((r) => r.count));
                const percentage = ((referrer.count / analytics.totalVisits) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">{referrer.domain}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {referrer.count} visits ({percentage}%)
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${(referrer.count / maxCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No referrer data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Visitor Type Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visitor Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">First-time Visitors</span>
                <span className="text-2xl font-bold text-primary">{analytics.firstTimeVisitors}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(analytics.firstTimeVisitors / analytics.totalVisits) * 100}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm font-medium">Returning Visitors</span>
                <span className="text-2xl font-bold text-green-600">{analytics.returningVisitors}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(analytics.returningVisitors / analytics.totalVisits) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-muted-foreground">Total Sessions</span>
                <span className="font-bold">{analytics.totalVisits}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-muted-foreground">Unique Visitors</span>
                <span className="font-bold">{analytics.uniqueVisitors}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-muted-foreground">Avg. Session Duration</span>
                <span className="font-bold">{formatDuration(analytics.avgSessionDuration)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
