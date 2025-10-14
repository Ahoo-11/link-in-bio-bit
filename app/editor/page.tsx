"use client";

import { useState } from "react";
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
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

interface LinkButton {
  id: string;
  type: "tip" | "social" | "link";
  title: string;
  url?: string;
  amount?: number;
  icon?: string;
  style: {
    bgColor: string;
    textColor: string;
  };
  visible: boolean;
}

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

  const [activeTab, setActiveTab] = useState<"buttons" | "style" | "profile">("buttons");

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

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile, buttons, style }),
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
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "buttons"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Buttons
              </button>
              <button
                onClick={() => setActiveTab("style")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "style"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Style
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Profile
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
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          className="flex flex-col h-20"
                          onClick={() => addButton("tip")}
                        >
                          <DollarSign className="w-5 h-5 mb-1" />
                          <span className="text-xs">Tip Button</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col h-20"
                          onClick={() => addButton("social")}
                        >
                          <Instagram className="w-5 h-5 mb-1" />
                          <span className="text-xs">Social Link</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col h-20"
                          onClick={() => addButton("link")}
                        >
                          <LinkIcon className="w-5 h-5 mb-1" />
                          <span className="text-xs">Custom Link</span>
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
                              {button.type !== "tip" && (
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
                        <label className="text-sm font-medium mb-2 block">Background</label>
                        <Input
                          type="color"
                          value={style.background}
                          onChange={(e) => setStyle({ ...style, background: e.target.value })}
                        />
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
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-purple mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold mb-1">{profile.displayName}</h2>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>

              <div className="space-y-3">
                {buttons.filter(btn => btn.visible).map((button) => (
                  <motion.div
                    key={button.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg px-4 py-3 text-center font-medium cursor-pointer hover:scale-105 transition-transform"
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
          </div>
        </div>
      </div>
    </div>
  );
}
