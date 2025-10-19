"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Share2, Sparkles, Instagram, Facebook, Twitter, Linkedin, Music, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { sendTip, connectWallet, isWalletConnected } from "@/lib/stacks";
import { formatCurrency } from "@/lib/utils";
import { visitorTracker } from "@/lib/visitor-tracking";

// Social media platform configuration
const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "#1877F2" },
  { value: "twitter", label: "Twitter/X", icon: Twitter, color: "#1DA1F2" },
  { value: "tiktok", label: "TikTok", icon: Music, color: "#000000" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  { value: "snapchat", label: "Snapchat", icon: Camera, color: "#FFFC00" },
];

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  walletAddress: string;
  buttons: any[];
  style: any;
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState<any>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [sendingTip, setSendingTip] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
    
    // Cleanup: End session when leaving page
    return () => {
      visitorTracker.endSession().catch(console.error);
    };
  }, [username]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${username}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        
        // Track visitor session with Nexus
        visitorTracker.trackVisit(username).then((session) => {
          console.log('📊 Visitor session started:', session);
        }).catch((error) => {
          console.error('Failed to track visit:', error);
        });
      } else {
        toast.error("Profile not found");
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async (buttonId: string) => {
    try {
      // Track with Nexus visitor tracking
      await visitorTracker.trackButtonClick(buttonId);
      
      // Also track with old analytics for backward compatibility
      await fetch(`/api/analytics/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, buttonId }),
      });
    } catch (error) {
      console.error("Failed to track click:", error);
    }
  };

  const handleTipClick = (button: any) => {
    trackClick(button.id);
    setSelectedTip(button);
    setCustomAmount(button.amount?.toString() || "");
    setShowTipModal(true);
  };

  const handleSendTip = async () => {
    if (!profile?.walletAddress) {
      toast.error("Creator wallet not configured");
      return;
    }

    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check wallet connection
    if (!isWalletConnected()) {
      connectWallet(() => {
        processTip(amount);
      });
      return;
    }

    await processTip(amount);
  };

  const processTip = async (amount: number) => {
    setSendingTip(true);
    
    try {
      const txId = await sendTip(
        profile!.walletAddress,
        amount,
        tipMessage || undefined,
        anonymous
      );

      // Record tip in database
      await fetch("/api/tips/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorUsername: username,
          amount,
          txId,
          message: tipMessage,
          anonymous,
        }),
      });

      setShowTipModal(false);
      setShowSuccess(true);
      
      // Reset form
      setCustomAmount("");
      setTipMessage("");
      setAnonymous(false);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Tip error:", error);
      toast.error("Failed to send tip. Please try again.");
    } finally {
      setSendingTip(false);
    }
  };

  const shareProfile = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${profile?.displayName}'s LinkChain`,
        text: `Check out ${profile?.displayName} on LinkChain!`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The profile "@{username}" doesn't exist
          </p>
          <Button asChild>
            <a href="/">Go to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
        style={{ 
          background: profile.style?.background || "#ffffff",
          color: profile.style?.theme === "dark" ? "#ffffff" : "#000000"
        }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Share Button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={shareProfile}
              className="rounded-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.displayName}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 gradient-purple flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <h1 className="text-3xl font-bold mb-2">{profile.displayName}</h1>
            <p className="text-lg opacity-80 mb-3">{profile.bio}</p>
            
            {/* Social Icons */}
            {profile.buttons.filter(btn => btn.visible && btn.type === "social" && btn.platform).length > 0 && (
              <div className="flex justify-center gap-4 mb-3">
                {profile.buttons.filter(btn => btn.visible && btn.type === "social" && btn.platform).map((button, index) => {
                  const platform = SOCIAL_PLATFORMS.find(p => p.value === button.platform);
                  const Icon = platform?.icon;
                  return Icon ? (
                    <motion.a
                      key={button.id}
                      href={button.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackClick(button.id)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                      style={{ 
                        backgroundColor: profile.style?.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: platform?.color }} />
                    </motion.a>
                  ) : null;
                })}
              </div>
            )}
            
            <p className="text-sm opacity-60">@{profile.username}</p>
          </motion.div>

          {/* Buttons */}
          <div className="space-y-3">
            {profile.buttons.filter(btn => btn.visible && btn.type !== "social").map((button, index) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {button.type === "tip" ? (
                  <button
                    onClick={() => handleTipClick(button)}
                    className="w-full rounded-xl px-6 py-4 text-center font-semibold cursor-pointer btn-hover shadow-md"
                    style={{
                      backgroundColor: button.style.bgColor,
                      color: button.style.textColor,
                    }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>{button.title}</span>
                    </div>
                  </button>
                ) : button.type === "video" || button.type === "youtube_embed" ? (
                  <div className="w-full">
                    <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={button.url.replace('watch?v=', 'embed/')}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onClick={() => trackClick(button.id)}
                      />
                    </div>
                    {button.title && (
                      <p className="mt-2 text-sm font-medium text-center">{button.title}</p>
                    )}
                  </div>
                ) : (
                  <a
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(button.id)}
                    className="block w-full rounded-xl px-6 py-4 text-center font-semibold btn-hover shadow-md"
                    style={{
                      backgroundColor: button.style.bgColor,
                      color: button.style.textColor,
                    }}
                  >
                    {button.title}
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          {/* Powered By */}
          <div className="text-center mt-12 opacity-60">
            <a
              href="/"
              className="inline-flex items-center space-x-1 text-sm hover:opacity-100 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              <span>Powered by LinkChain</span>
            </a>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      <Dialog open={showTipModal} onOpenChange={setShowTipModal}>
        <DialogContent onClose={() => setShowTipModal(false)}>
          <DialogHeader>
            <DialogTitle>Support {profile.displayName}</DialogTitle>
            <DialogDescription>
              Send a tip to show your appreciation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Preset Amounts */}
            <div>
              <label className="text-sm font-medium mb-2 block">Amount (USD)</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[5, 10, 25, 50].map((amount) => (
                  <Button
                    key={amount}
                    variant={customAmount === amount.toString() ? "default" : "outline"}
                    onClick={() => setCustomAmount(amount.toString())}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
              <Input
                placeholder="Leave a kind message..."
                value={tipMessage}
                onChange={(e) => setTipMessage(e.target.value)}
                maxLength={280}
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="anonymous" className="text-sm">
                Send anonymously
              </label>
            </div>

            {/* Summary */}
            {customAmount && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{formatCurrency(parseFloat(customAmount))}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Network Fee (~2%)</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(customAmount) * 0.02)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(parseFloat(customAmount) * 1.02)}</span>
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSendTip}
              disabled={!customAmount || sendingTip}
              className="w-full gradient-purple text-white h-11"
            >
              {sendingTip ? (
                "Processing..."
              ) : isWalletConnected() ? (
                `Send ${customAmount ? formatCurrency(parseFloat(customAmount)) : "Tip"}`
              ) : (
                "Connect Wallet & Send"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent onClose={() => setShowSuccess(false)}>
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Heart className="w-10 h-10 text-green-600 fill-current" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Thank You! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              Your tip has been sent to {profile.displayName}
            </p>
            <p className="text-sm text-muted-foreground">
              Transaction confirmed on the blockchain
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
