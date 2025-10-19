/**
 * AI Action Executor Service
 * Handles all actions that the AI agent can perform on user profiles
 */

const supabase = require('../db');

class AIActionExecutor {
  constructor(userId) {
    this.userId = userId;
  }

  /**
   * Execute an action based on function call from AI
   */
  async executeAction(functionName, parameters) {
    const actionHandlers = {
      add_button: this.addButton.bind(this),
      update_button: this.updateButton.bind(this),
      delete_button: this.deleteButton.bind(this),
      reorder_buttons: this.reorderButtons.bind(this),
      add_social_link: this.addSocialLink.bind(this),
      update_social_link: this.updateSocialLink.bind(this),
      delete_social_link: this.deleteSocialLink.bind(this),
      update_profile: this.updateProfile.bind(this),
      update_style: this.updateStyle.bind(this),
      get_analytics: this.getAnalytics.bind(this),
    };

    const handler = actionHandlers[functionName];
    if (!handler) {
      throw new Error(`Unknown action: ${functionName}`);
    }

    return await handler(parameters);
  }

  /**
   * Get current user profile
   */
  async getCurrentProfile() {
    const { data: user, error } = await supabase
      .from('linkinbio_users')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (error) throw error;
    return user;
  }

  /**
   * Update user profile in database
   */
  async updateUserProfile(updates) {
    const { data, error } = await supabase
      .from('linkinbio_users')
      .update(updates)
      .eq('id', this.userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== BUTTON ACTIONS ====================

  async addButton(params) {
    const { type, title, url, amount, bgColor = '#8b5cf6', textColor = '#ffffff' } = params;

    const user = await this.getCurrentProfile();
    const buttons = user.buttons || [];

    // Validate button limit
    if (buttons.length >= 10) {
      throw new Error('Maximum 10 buttons allowed. Please delete some buttons first.');
    }

    // Create new button
    const newButton = {
      id: Date.now().toString(),
      type,
      title,
      url,
      amount: amount ? parseFloat(amount) : undefined,
      style: { bgColor, textColor },
      visible: true,
      order: buttons.length,
    };

    // Add to buttons array
    const updatedButtons = [...buttons, newButton];

    await this.updateUserProfile({ buttons: updatedButtons });

    return {
      success: true,
      message: `✅ Added ${type} button: "${title}"`,
      button: newButton,
    };
  }

  async updateButton(params) {
    const { buttonId, updates } = params;

    const user = await this.getCurrentProfile();
    const buttons = user.buttons || [];

    const buttonIndex = buttons.findIndex(b => b.id === buttonId);
    if (buttonIndex === -1) {
      throw new Error('Button not found');
    }

    // Update button
    buttons[buttonIndex] = {
      ...buttons[buttonIndex],
      ...updates,
      style: updates.style
        ? { ...buttons[buttonIndex].style, ...updates.style }
        : buttons[buttonIndex].style,
    };

    await this.updateUserProfile({ buttons });

    return {
      success: true,
      message: `✅ Updated button: "${buttons[buttonIndex].title}"`,
      button: buttons[buttonIndex],
    };
  }

  async deleteButton(params) {
    const { buttonId } = params;

    const user = await this.getCurrentProfile();
    const buttons = user.buttons || [];

    const button = buttons.find(b => b.id === buttonId);
    if (!button) {
      throw new Error('Button not found');
    }

    const updatedButtons = buttons.filter(b => b.id !== buttonId);

    await this.updateUserProfile({ buttons: updatedButtons });

    return {
      success: true,
      message: `✅ Deleted button: "${button.title}"`,
      deletedButton: button,
    };
  }

  async reorderButtons(params) {
    const { buttonIds } = params;

    const user = await this.getCurrentProfile();
    const buttons = user.buttons || [];

    // Reorder buttons based on provided IDs
    const reorderedButtons = buttonIds
      .map(id => buttons.find(b => b.id === id))
      .filter(Boolean)
      .map((btn, index) => ({ ...btn, order: index }));

    await this.updateUserProfile({ buttons: reorderedButtons });

    return {
      success: true,
      message: '✅ Reordered buttons',
      buttons: reorderedButtons,
    };
  }

  // ==================== SOCIAL LINK ACTIONS ====================

  async addSocialLink(params) {
    const { platform, url } = params;

    const user = await this.getCurrentProfile();
    const buttons = user.buttons || [];

    // Check if social link already exists
    const existingSocial = buttons.find(
      b => b.type === 'social' && b.platform === platform
    );

    if (existingSocial) {
      throw new Error(`${platform} link already exists. Use update instead.`);
    }

    const platformNames = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      twitter: 'Twitter/X',
      tiktok: 'TikTok',
      linkedin: 'LinkedIn',
      snapchat: 'Snapchat',
    };

    const newSocialLink = {
      id: Date.now().toString(),
      type: 'social',
      platform,
      title: platformNames[platform] || platform,
      url,
      icon: platform,
      style: { bgColor: '#f3f4f6', textColor: '#000000' },
      visible: true,
      order: buttons.length,
    };

    const updatedButtons = [...buttons, newSocialLink];

    await this.updateUserProfile({ buttons: updatedButtons });

    return {
      success: true,
      message: `✅ Added ${platformNames[platform]} link`,
      link: newSocialLink,
    };
  }

  async updateSocialLink(params) {
    const { linkId, platform, url, visible } = params;

    const user = await this.getCurrentProfile();
    const buttons = user.buttons || [];

    const linkIndex = buttons.findIndex(
      b => b.id === linkId && b.type === 'social'
    );

    if (linkIndex === -1) {
      throw new Error('Social link not found');
    }

    buttons[linkIndex] = {
      ...buttons[linkIndex],
      ...(platform && { platform }),
      ...(url && { url }),
      ...(visible !== undefined && { visible }),
    };

    await this.updateUserProfile({ buttons });

    return {
      success: true,
      message: `✅ Updated social link`,
      link: buttons[linkIndex],
    };
  }

  async deleteSocialLink(params) {
    const { linkId } = params;

    const user = await this.getCurrentProfile();
    const buttons = user.buttons || [];

    const link = buttons.find(b => b.id === linkId && b.type === 'social');
    if (!link) {
      throw new Error('Social link not found');
    }

    const updatedButtons = buttons.filter(b => b.id !== linkId);

    await this.updateUserProfile({ buttons: updatedButtons });

    return {
      success: true,
      message: `✅ Deleted ${link.platform} link`,
      deletedLink: link,
    };
  }

  // ==================== PROFILE ACTIONS ====================

  async updateProfile(params) {
    const { displayName, bio, avatar } = params;

    const updates = {};
    if (displayName) updates.display_name = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    await this.updateUserProfile(updates);

    return {
      success: true,
      message: '✅ Updated profile information',
      updates,
    };
  }

  // ==================== STYLE ACTIONS ====================

  async updateStyle(params) {
    const { theme, colorScheme, background } = params;

    const user = await this.getCurrentProfile();
    const currentStyle = user.style || {};

    const newStyle = {
      ...currentStyle,
      ...(theme && { theme }),
      ...(colorScheme && { colorScheme }),
      ...(background && { background }),
    };

    await this.updateUserProfile({ style: newStyle });

    return {
      success: true,
      message: '✅ Updated profile style',
      style: newStyle,
    };
  }

  // ==================== ANALYTICS ACTIONS ====================

  async getAnalytics(params) {
    const { timeframe = '7d' } = params;

    const user = await this.getCurrentProfile();

    // Calculate date range
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 365;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get analytics events
    const { data: events } = await supabase
      .from('linkinbio_analytics')
      .select('*')
      .eq('username', user.username)
      .gte('timestamp', startDate);

    // Get tips
    const { data: tips } = await supabase
      .from('linkinbio_tips')
      .select('*')
      .eq('creator_username', user.username)
      .eq('status', 'confirmed');

    const visits = (events || []).filter(e => e.event_type === 'visit').length;
    const clicks = (events || []).filter(e => e.event_type === 'click').length;
    const totalEarnings = (tips || []).reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
    const conversionRate = visits > 0 ? ((clicks / visits) * 100).toFixed(2) : 0;

    // Button performance
    const buttonClicks = {};
    (events || [])
      .filter(e => e.event_type === 'click')
      .forEach(event => {
        buttonClicks[event.button_id] = (buttonClicks[event.button_id] || 0) + 1;
      });

    const topButtons = Object.entries(buttonClicks)
      .map(([id, clicks]) => {
        const button = user.buttons?.find(b => b.id === id);
        return {
          title: button?.title || 'Unknown',
          clicks,
        };
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      success: true,
      analytics: {
        timeframe: `Last ${days} days`,
        visits,
        clicks,
        conversionRate: parseFloat(conversionRate),
        totalEarnings,
        tipCount: tips?.length || 0,
        topButtons,
      },
    };
  }
}

module.exports = AIActionExecutor;
