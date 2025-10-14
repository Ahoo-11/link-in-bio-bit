"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Lock, BarChart3, Palette, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LandingPage() {
  const [username, setUsername] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-purple rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-purple bg-clip-text text-transparent">
                LinkChain
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="gradient-purple text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Powered by Stacks Blockchain
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Link in Bio,
            <br />
            <span className="gradient-purple bg-clip-text text-transparent">
              Powered by Crypto
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Share your links, accept tips, and get paid instantly. 
            The easiest way for creators to receive blockchain payments.
          </p>

          {/* Quick Signup */}
          <div className="max-w-md mx-auto mb-12">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Choose your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-lg"
              />
              <Link href={`/signup?username=${username}`}>
                <Button size="lg" className="gradient-purple text-white px-8">
                  Start Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              linkchain.app/{username || "yourname"}
            </p>
          </div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-purple blur-3xl opacity-20"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full gradient-purple mx-auto"></div>
                  <h3 className="font-semibold text-lg">@creator</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Content Creator & Artist
                  </p>
                  <div className="space-y-2">
                    <div className="h-12 bg-gradient-purple rounded-lg flex items-center justify-center text-white font-medium">
                      Support me - $5
                    </div>
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      Instagram
                    </div>
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      Twitter
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold gradient-purple bg-clip-text text-transparent">
                      $1,234
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Earnings
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">12 Tips Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Feature-rich platform that rivals traditional link-in-bio tools
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Instant Payments"
            description="Receive tips and payments directly to your wallet. No middleman, no delays."
          />
          <FeatureCard
            icon={<Palette className="w-8 h-8" />}
            title="Full Customization"
            description="Choose from beautiful templates, colors, and layouts. Make it truly yours."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Analytics Dashboard"
            description="Track your earnings, tips, and visitor stats with beautiful charts."
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="Secure & Private"
            description="Built on Stacks blockchain with enterprise-grade security."
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="Easy to Use"
            description="Set up in 5 minutes. No crypto knowledge required."
          />
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8" />}
            title="Mobile Optimized"
            description="Perfect experience on desktop, tablet, and mobile devices."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="gradient-purple rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators earning with LinkChain
          </p>
          <Link href="/signup">
            <Button size="xl" variant="secondary" className="btn-hover">
              Create Your Profile
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 LinkChain. Built with ❤️ for creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg border card-hover"
    >
      <div className="w-12 h-12 rounded-lg gradient-purple flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}
