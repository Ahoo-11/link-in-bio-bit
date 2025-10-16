"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    const tests: any = {};

    // Test 1: Backend Health
    try {
      const res = await fetch('http://localhost:5000/health');
      tests.backendHealth = res.ok ? '✅ Backend is running' : '❌ Backend returned error';
    } catch (error) {
      tests.backendHealth = '❌ Backend not reachable on port 5000';
    }

    // Test 2: Check localStorage token
    const token = localStorage.getItem('token');
    tests.token = token ? `✅ Token exists: ${token.substring(0, 20)}...` : '❌ No token in localStorage';

    // Test 3: Test authenticated endpoint
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          tests.profile = `✅ Profile loaded: ${data.username}`;
        } else {
          const error = await res.text();
          tests.profile = `❌ Profile failed: ${res.status} ${error}`;
        }
      } catch (error: any) {
        tests.profile = `❌ Profile error: ${error.message}`;
      }
    } else {
      tests.profile = '⏭️ Skipped (no token)';
    }

    // Test 4: Supabase credentials
    tests.supabaseUrl = process.env.NEXT_PUBLIC_API_URL || 'Not set in .env.local';

    setResults(tests);
    setLoading(false);
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setResults({ ...results, token: '✅ Token cleared!' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Authentication Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testBackendConnection} disabled={loading}>
                {loading ? 'Testing...' : 'Run Tests'}
              </Button>
              <Button onClick={clearToken} variant="destructive">
                Clear Token
              </Button>
            </div>

            {Object.keys(results).length > 0 && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm">
                {Object.entries(results).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <strong>{key}:</strong> {String(value)}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="font-bold mb-2">🔍 Quick Fix Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click "Clear Token" to remove old session</li>
                <li>Go to <a href="/login" className="text-blue-600 underline">/login</a></li>
                <li>Click "Connect Wallet"</li>
                <li>Approve in your wallet</li>
                <li>Come back here and click "Run Tests"</li>
                <li>You should see ✅ for all tests</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm">
                <strong>⚠️ Common Issue:</strong> If you logged in with wallet BEFORE the latest code changes,
                your session is invalid. Clear the token and log in again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
