"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  Save,
  ArrowLeft,
  Instagram,
  Twitter,
  Youtube,
  Link as LinkIcon,
  DollarSign,
  Wallet,
  Facebook,
  Linkedin,
  Music,
  Camera,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { connectWallet, disconnectWallet, getUserAddress, isWalletConnected } from "@/lib/stacks";

interface LinkButton {
  id: string;
  type: "tip" | "social" | "link" | "video" | "youtube_embed";
  title: string;
  url?: string;
  amount?: number;
  icon?: string;
  platform?: string;
  style: {
    bgColor: string;
    textColor: string;
  };
  visible: boolean;
}

// Social media platform configuration
const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "#1877F2" },
  { value: "twitter", label: "Twitter/X", icon: Twitter, color: "#1DA1F2" },
  { value: "tiktok", label: "TikTok", icon: Music, color: "#000000" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  { value: "snapchat", label: "Snapchat", icon: Camera, color: "#FFFC00" },
];

interface ProfileStyle {
  template: string;
  colorScheme: string;
  theme: "light" | "dark";
  font: string;
  background: string;
}

export default function EditorPage() {
  const [profile, setProfile] = useState({
    displayName: "Your Name",
    bio: "Creator & Artist",
    avatar: "",
    coverImage: "",
    walletAddress: "",
  });

  const [buttons, setButtons] = useState<LinkButton[]>([
    {
      id: "1",
      type: "tip",
      title: "Support me - $5",
      amount: 5,
      style: { bgColor: "#8b5cf6", textColor: "#ffffff" },
      visible: true,
    },
    {
      id: "2",
      type: "social",
      title: "Instagram",
      url: "https://instagram.com",
      icon: "instagram",
      style: { bgColor: "#f3f4f6", textColor: "#000000" },
      visible: true,
    },
  ]);

  const [style, setStyle] = useState<ProfileStyle>({
    template: "centered",
    colorScheme: "purple",
    theme: "light",
    font: "inter",
    background: "#ffffff",
  });

  const [socialLinks, setSocialLinks] = useState<LinkButton[]>([]);
  const [activeTab, setActiveTab] = useState<"buttons" | "style" | "social" | "profile" | "integrations">("buttons");
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [syncedContent, setSyncedContent] = useState<any[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  useEffect(() => {
    loadProfile();
    setWalletConnected(isWalletConnected());
  }, []);

  useEffect(() => {
    if (activeTab === "integrations") {
      loadIntegrations();
    }
  }, [activeTab]);

  const loadIntegrations = async () => {
    try {
      setLoadingIntegrations(true);
      const token = localStorage.getItem("token");
      
      // Load integrations
      const intResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/integrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (intResponse.ok) {
        const data = await intResponse.json();
        setIntegrations(data.integrations || []);
      }
      
      // Load synced content
      const contentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/integrations/content`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (contentResponse.ok) {
        const data = await contentResponse.json();
        setSyncedContent(data.content || []);
      }
    } catch (error) {
      console.error("Load integrations error:", error);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          displayName: data.display_name || "Your Name",
          bio: data.bio || "Creator & Artist",
          avatar: data.avatar || "",
          coverImage: data.cover_image || "",
          walletAddress: data.wallet_address || "",
        });
        if (data.buttons && data.buttons.length > 0) {
          // Separate social links from regular buttons
          const regularButtons = data.buttons.filter((btn: LinkButton) => btn.type !== "social");
          const socials = data.buttons.filter((btn: LinkButton) => btn.type === "social");
          setButtons(regularButtons);
          setSocialLinks(socials);
        }
        if (data.style) {
          setStyle(data.style);
        }
      }
    } catch (error) {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const addButton = (type: LinkButton["type"]) => {
    const newButton: LinkButton = {
      id: Date.now().toString(),
      type,
      title: type === "tip" ? "New Tip Button" : type === "social" ? "Social Link" : "New Link",
      style: { bgColor: "#f3f4f6", textColor: "#000000" },
      visible: true,
    };
    setButtons([...buttons, newButton]);
  };

  const updateButton = (id: string, updates: Partial<LinkButton>) => {
    setButtons(buttons.map(btn => btn.id === id ? { ...btn, ...updates } : btn));
  };

  const deleteButton = (id: string) => {
    setButtons(buttons.filter(btn => btn.id !== id));
    toast.success("Button deleted");
  };

  const addSocialLink = () => {
    const newSocial: LinkButton = {
      id: Date.now().toString(),
      type: "social",
      title: "",
      platform: "",
      url: "",
      style: { bgColor: "#f3f4f6", textColor: "#000000" },
      visible: true,
    };
    setSocialLinks([...socialLinks, newSocial]);
  };

  const updateSocialLink = (id: string, updates: Partial<LinkButton>) => {
    setSocialLinks(socialLinks.map(link => link.id === id ? { ...link, ...updates } : link));
  };

  const deleteSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
    toast.success("Social link removed");
  };

  const detectPlatformFromUrl = (url: string): string => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('instagram.com')) return 'instagram';
    if (urlLower.includes('facebook.com')) return 'facebook';
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
    if (urlLower.includes('tiktok.com')) return 'tiktok';
    if (urlLower.includes('linkedin.com')) return 'linkedin';
    if (urlLower.includes('snapchat.com')) return 'snapchat';
    return '';
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      // Merge buttons and social links for saving
      const allButtons = [...buttons, ...socialLinks];
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile, buttons: allButtons, style }),
      });

      if (response.ok) {
        toast.success("Profile saved successfully!");
      } else {
        toast.error("Failed to save profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleConnectWallet = () => {
    connectWallet(async (userData) => {
      const address = getUserAddress();
      if (address) {
        setProfile({ ...profile, walletAddress: address });
        setWalletConnected(true);
        
        // Save wallet address
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

  const colorSchemes = [
    { name: "Purple", primary: "#8b5cf6", secondary: "#a78bfa" },
    { name: "Blue", primary: "#3b82f6", secondary: "#60a5fa" },
    { name: "Green", primary: "#10b981", secondary: "#34d399" },
    { name: "Pink", primary: "#ec4899", secondary: "#f472b6" },
    { name: "Orange", primary: "#f59e0b", secondary: "#fbbf24" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 w-4 h-4" />
                Preview
              </Button>
              <Button onClick={saveProfile} size="sm" className="gradient-purple text-white">
                <Save className="mr-2 w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Customize Your Profile</h2>
              <p className="text-muted-foreground">Design your perfect link-in-bio page</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 bg-white dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("buttons")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "buttons"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Buttons
              </button>
              <button
                onClick={() => setActiveTab("style")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "style"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Style
              </button>
              <button
                onClick={() => setActiveTab("social")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "social"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Social
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("integrations")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "integrations"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Integrations
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === "buttons" && (
                <>
                  {/* Add Buttons */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-4">Add New Button</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Buttons are interactive actions like tips or links. For social profiles, use the Social tab.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="flex flex-col h-24"
                          onClick={() => addButton("tip")}
                        >
                          <DollarSign className="w-6 h-6 mb-2" />
                          <span className="text-sm font-medium">Tip Button</span>
                          <span className="text-xs text-muted-foreground">Receive payments</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col h-24"
                          onClick={() => addButton("link")}
                        >
                          <LinkIcon className="w-6 h-6 mb-2" />
                          <span className="text-sm font-medium">Custom Link</span>
                          <span className="text-xs text-muted-foreground">Link anywhere</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Button List */}
                  <div className="space-y-3">
                    {buttons.map((button) => (
                      <Card key={button.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start space-x-3">
                            <GripVertical className="w-5 h-5 text-gray-400 mt-2 cursor-move" />
                            <div className="flex-1 space-y-3">
                              <Input
                                value={button.title}
                                onChange={(e) => updateButton(button.id, { title: e.target.value })}
                                placeholder="Button title"
                              />
                              {button.type === "link" && (
                                <Input
                                  value={button.url || ""}
                                  onChange={(e) => updateButton(button.id, { url: e.target.value })}
                                  placeholder="https://..."
                                />
                              )}
                              {button.type === "tip" && (
                                <Input
                                  type="number"
                                  value={button.amount || ""}
                                  onChange={(e) => updateButton(button.id, { amount: Number(e.target.value) })}
                                  placeholder="Amount in USD"
                                />
                              )}
                              <div className="flex space-x-2">
                                <Input
                                  type="color"
                                  value={button.style.bgColor}
                                  onChange={(e) => updateButton(button.id, { 
                                    style: { ...button.style, bgColor: e.target.value }
                                  })}
                                  className="w-20"
                                />
                                <Input
                                  type="color"
                                  value={button.style.textColor}
                                  onChange={(e) => updateButton(button.id, { 
                                    style: { ...button.style, textColor: e.target.value }
                                  })}
                                  className="w-20"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteButton(button.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "social" && (
                <>
                  {/* Add Social Platform */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Add Social Platforms</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect your profiles so visitors can find you everywhere.
                      </p>
                      <Button
                        onClick={addSocialLink}
                        variant="outline"
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Social Platform
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Social Links List */}
                  <div className="space-y-3">
                    {socialLinks.map((link) => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.value === link.platform);
                      const Icon = platform?.icon;
                      
                      return (
                        <Card key={link.id}>
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              {/* Platform Icon and Name */}
                              {platform && (
                                <div className="flex items-center space-x-2 pb-2 border-b">
                                  {Icon && <Icon className="w-5 h-5" style={{ color: platform.color }} />}
                                  <span className="font-medium">{platform.label}</span>
                                </div>
                              )}

                              {/* Platform Selection */}
                              <div>
                                <label className="text-xs font-medium mb-1 block">Social Platform</label>
                                <select
                                  value={link.platform || ""}
                                  onChange={(e) => {
                                    const selectedPlatform = SOCIAL_PLATFORMS.find(p => p.value === e.target.value);
                                    updateSocialLink(link.id, { 
                                      platform: e.target.value,
                                      title: selectedPlatform?.label || "",
                                      icon: e.target.value
                                    });
                                  }}
                                  className="w-full px-3 py-2 border rounded-md bg-background"
                                >
                                  <option value="">Select a platform</option>
                                  {SOCIAL_PLATFORMS.map(platform => (
                                    <option key={platform.value} value={platform.value}>
                                      {platform.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* URL Input with Auto-Detection */}
                              <div>
                                <label className="text-xs font-medium mb-1 block">Profile URL</label>
                                <Input
                                  value={link.url || ""}
                                  onChange={(e) => {
                                    const url = e.target.value;
                                    const detectedPlatform = detectPlatformFromUrl(url);
                                    
                                    if (detectedPlatform && !link.platform) {
                                      const platform = SOCIAL_PLATFORMS.find(p => p.value === detectedPlatform);
                                      updateSocialLink(link.id, { 
                                        url,
                                        platform: detectedPlatform,
                                        title: platform?.label || "",
                                        icon: detectedPlatform
                                      });
                                    } else {
                                      updateSocialLink(link.id, { url });
                                    }
                                  }}
                                  placeholder="https://instagram.com/yourname"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Paste your full profile URL — we'll auto-detect the platform!
                                </p>
                              </div>

                              {/* Visibility Toggle and Delete */}
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`visible-${link.id}`}
                                    checked={link.visible}
                                    onChange={(e) => updateSocialLink(link.id, { visible: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300"
                                  />
                                  <label htmlFor={`visible-${link.id}`} className="text-sm">
                                    Show icon on profile
                                  </label>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSocialLink(link.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Empty State */}
                  {socialLinks.length === 0 && (
                    <Card>
                      <CardContent className="pt-6 pb-6 text-center">
                        <Instagram className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground mb-1">No social platforms added yet</p>
                        <p className="text-sm text-muted-foreground">
                          Add your social profiles to help visitors connect with you
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {activeTab === "style" && (
                <>
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Color Scheme</label>
                        <div className="grid grid-cols-5 gap-2">
                          {colorSchemes.map((scheme) => (
                            <button
                              key={scheme.name}
                              onClick={() => setStyle({ ...style, colorScheme: scheme.name.toLowerCase() })}
                              className={`h-12 rounded-lg border-2 ${
                                style.colorScheme === scheme.name.toLowerCase()
                                  ? "border-primary"
                                  : "border-transparent"
                              }`}
                              style={{ background: `linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary})` }}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Background Template</label>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Gradient Purple */}
                          <button
                            onClick={() => setStyle({ ...style, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" })}
                            className="relative h-24 rounded-lg overflow-hidden border-2 hover:border-purple-500 transition-all group"
                            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                          >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                              <span className="text-white font-medium text-xs opacity-0 group-hover:opacity-100">Purple Dream</span>
                            </div>
                          </button>

                          {/* Gradient Sunset */}
                          <button
                            onClick={() => setStyle({ ...style, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" })}
                            className="relative h-24 rounded-lg overflow-hidden border-2 hover:border-pink-500 transition-all group"
                            style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}
                          >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                              <span className="text-white font-medium text-xs opacity-0 group-hover:opacity-100">Sunset Glow</span>
                            </div>
                          </button>

                          {/* Solid White */}
                          <button
                            onClick={() => setStyle({ ...style, background: "#ffffff" })}
                            className="h-24 rounded-lg border-2 hover:border-gray-400 transition-all bg-white flex items-center justify-center"
                          >
                            <span className="text-gray-700 font-medium text-xs">Clean White</span>
                          </button>

                          {/* Solid Dark */}
                          <button
                            onClick={() => setStyle({ ...style, background: "#1a1a1a" })}
                            className="h-24 rounded-lg border-2 hover:border-gray-600 transition-all bg-gray-900 flex items-center justify-center"
                          >
                            <span className="text-white font-medium text-xs">Dark Mode</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Theme</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={style.theme === "light" ? "default" : "outline"}
                            onClick={() => setStyle({ ...style, theme: "light" })}
                          >
                            Light
                          </Button>
                          <Button
                            variant={style.theme === "dark" ? "default" : "outline"}
                            onClick={() => setStyle({ ...style, theme: "dark" })}
                          >
                            Dark
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Custom Background</label>
                        <Input
                          type="color"
                          value={style.background}
                          onChange={(e) => setStyle({ ...style, background: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Or use templates above</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {activeTab === "profile" && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Display Name</label>
                      <Input
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bio</label>
                      <Input
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Tell people about yourself"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Avatar URL</label>
                      <Input
                        value={profile.avatar}
                        onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Wallet Address (for receiving tips)</label>
                      {walletConnected && profile.walletAddress ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center space-x-2">
                            <Wallet className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-mono">
                              {profile.walletAddress.slice(0, 8)}...{profile.walletAddress.slice(-8)}
                            </span>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleDisconnectWallet}>
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={handleConnectWallet} variant="outline" className="w-full">
                          <Wallet className="mr-2 w-4 h-4" />
                          Connect Wallet
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "integrations" && (
                <>
                  {/* Connected Integrations */}
                  {integrations.length > 0 && (
                    <Card className="mb-6">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">Connected Channels</h3>
                        {integrations.map((integration) => (
                          <div key={integration.id} className="mb-4 last:mb-0 p-4 border rounded-lg bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                                  <Youtube className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{integration.service_username || integration.service}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    Last synced: {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Never'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem("token");
                                      const response = await fetch(
                                        `${process.env.NEXT_PUBLIC_API_URL}/api/integrations/${integration.id}/sync`,
                                        {
                                          method: "POST",
                                          headers: { Authorization: `Bearer ${token}` }
                                        }
                                      );
                                      if (response.ok) {
                                        toast.success("Syncing...");
                                        setTimeout(() => loadIntegrations(), 2000);
                                      }
                                    } catch (error) {
                                      toast.error("Sync failed");
                                    }
                                  }}
                                >
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Sync
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={async () => {
                                    if (confirm("Disconnect this integration?")) {
                                      try {
                                        const token = localStorage.getItem("token");
                                        await fetch(
                                          `${process.env.NEXT_PUBLIC_API_URL}/api/integrations/${integration.id}`,
                                          {
                                            method: "DELETE",
                                            headers: { Authorization: `Bearer ${token}` }
                                          }
                                        );
                                        toast.success("Disconnected");
                                        loadIntegrations();
                                      } catch (error) {
                                        toast.error("Failed to disconnect");
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Synced Videos */}
                  {syncedContent.length > 0 && (
                    <Card className="mb-6">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">Synced Videos ({syncedContent.length})</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Click "+ Add" to embed videos on your profile
                        </p>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {syncedContent.map((content) => {
                            const isAdded = buttons.some(btn => btn.url === content.url && (btn.type === "youtube_embed" || btn.type === "video"));
                            return (
                              <div key={content.id} className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${isAdded ? 'bg-green-50 dark:bg-green-900/10 border-green-200' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                <img
                                  src={content.thumbnail_url}
                                  alt={content.title}
                                  className="w-24 h-14 rounded object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">{content.title}</h4>
                                  <p className="text-xs text-muted-foreground truncate">{content.description}</p>
                                </div>
                                {isAdded ? (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setButtons(buttons.filter(btn => !(btn.url === content.url && (btn.type === "youtube_embed" || btn.type === "video"))));
                                      toast.success("Video removed from profile");
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Remove
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const newButton: LinkButton = {
                                        id: Date.now().toString(),
                                        type: "youtube_embed",
                                        title: content.title,
                                        url: content.url,
                                        icon: "youtube",
                                        style: { bgColor: "#ff0000", textColor: "#ffffff" },
                                        visible: true,
                                      };
                                      setButtons([...buttons, newButton]);
                                      toast.success("Video will be embedded on your profile!");
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Connect Your Content</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Auto-sync content from your favorite platforms
                      </p>

                      {/* YouTube Integration - Working */}
                      <div className="mb-6 p-4 border rounded-lg bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                              <Youtube className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold">YouTube</h4>
                              <p className="text-xs text-muted-foreground">Sync your latest videos</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Live
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <Input
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="Enter your YouTube channel URL"
                            className="bg-white dark:bg-gray-800"
                          />
                          <Button
                            onClick={async () => {
                              if (!youtubeUrl) {
                                toast.error("Please enter a YouTube URL");
                                return;
                              }
                              try {
                                const token = localStorage.getItem("token");
                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/integrations/manual`, {
                                  method: "POST",
                                  headers: {
                                    "Authorization": `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    service: "youtube",
                                    config: { channelUrl: youtubeUrl }
                                  })
                                });
                                
                                if (response.ok) {
                                  toast.success("YouTube channel connected! Videos syncing...");
                                  setYoutubeUrl("");
                                  // Reload integrations
                                  setTimeout(() => loadIntegrations(), 2000);
                                } else {
                                  const error = await response.json();
                                  toast.error(error.error || "Failed to connect");
                                }
                              } catch (error) {
                                toast.error("Connection failed");
                              }
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Youtube className="w-4 h-4 mr-2" />
                            Connect YouTube
                          </Button>
                        </div>
                      </div>

                      {/* Coming Soon - Spotify */}
                      <div className="mb-4 p-4 border rounded-lg opacity-60 cursor-not-allowed">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                              <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Spotify</h4>
                              <p className="text-xs text-muted-foreground">Sync your music & playlists</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                            Coming Soon
                          </span>
                        </div>
                      </div>

                      {/* Coming Soon - Shopify */}
                      <div className="mb-4 p-4 border rounded-lg opacity-60 cursor-not-allowed">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center">
                              <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Shopify</h4>
                              <p className="text-xs text-muted-foreground">Display your products</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                            Coming Soon
                          </span>
                        </div>
                      </div>

                      {/* Coming Soon - Calendly */}
                      <div className="p-4 border rounded-lg opacity-60 cursor-not-allowed">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                              <LinkIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Calendly</h4>
                              <p className="text-xs text-muted-foreground">Add booking links</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Live Preview - Phone Mockup */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="flex items-center justify-center">
              {/* iPhone Mockup */}
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-[320px] h-[650px] bg-gray-900 rounded-[50px] p-2 shadow-2xl border-[6px] border-gray-900">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[26px] bg-gray-900 rounded-b-3xl z-10"></div>
                  
                  {/* Screen */}
                  <div 
                    className="relative w-full h-full rounded-[38px] overflow-hidden"
                    style={{ 
                      background: style.background,
                      color: style.theme === "dark" ? "#ffffff" : "#000000"
                    }}
                  >
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 text-xs font-medium z-10">
                      <span className="opacity-80">9:41</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        <svg className="w-3 h-3 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-5 h-5 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        </svg>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="h-full overflow-y-auto px-6 pt-16 pb-8">
                      <div className="text-center mb-6">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt={profile.displayName}
                            className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-purple mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                            {profile.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <h2 className="text-xl font-bold mb-1">{profile.displayName}</h2>
                        <p className="text-sm opacity-70 mb-3">{profile.bio}</p>
                        
                        {/* Social Icons */}
                        {socialLinks.filter(link => link.visible && link.platform).length > 0 && (
                          <div className="flex justify-center gap-3 mb-4">
                            {socialLinks.filter(link => link.visible && link.platform).map((link) => {
                              const platform = SOCIAL_PLATFORMS.find(p => p.value === link.platform);
                              const Icon = platform?.icon;
                              return Icon ? (
                                <motion.a
                                  key={link.id}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                                  style={{ 
                                    backgroundColor: style.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                                  }}
                                >
                                  <Icon className="w-5 h-5" style={{ color: platform?.color }} />
                                </motion.a>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {buttons.filter(btn => btn.visible).map((button) => (
                          <motion.div
                            key={button.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl px-4 py-3 text-center font-medium text-sm shadow-sm"
                            style={{
                              backgroundColor: button.style.bgColor,
                              color: button.style.textColor,
                            }}
                          >
                            {button.title}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-900 dark:bg-white rounded-full opacity-30"></div>
                  </div>

                  {/* Volume Buttons */}
                  <div className="absolute left-[-4px] top-[120px] w-[4px] h-[30px] bg-gray-900 rounded-l"></div>
                  <div className="absolute left-[-4px] top-[165px] w-[4px] h-[50px] bg-gray-900 rounded-l"></div>
                  <div className="absolute left-[-4px] top-[230px] w-[4px] h-[50px] bg-gray-900 rounded-l"></div>
                  
                  {/* Power Button */}
                  <div className="absolute right-[-4px] top-[150px] w-[4px] h-[70px] bg-gray-900 rounded-r"></div>
                </div>

                {/* Phone Shadow */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20 rounded-[50px] pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
