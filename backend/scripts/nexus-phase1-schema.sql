-- ============================================
-- NEXUS PHASE 1: DATABASE SCHEMA
-- Foundation for adaptive, intelligent profiles
-- ============================================

-- Visitor Sessions Table
-- Tracks all visitor interactions and context
CREATE TABLE IF NOT EXISTS linkinbio_visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL, -- Generated client-side, stored in cookie
  username TEXT NOT NULL,
  
  -- Geographic data
  ip_address TEXT,
  country_code TEXT,
  country_name TEXT,
  city TEXT,
  region TEXT,
  timezone TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Device & browser info
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  
  -- Referral tracking
  referrer TEXT,
  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Visit metadata
  is_first_visit BOOLEAN DEFAULT true,
  visit_count INTEGER DEFAULT 1,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  session_duration INTEGER, -- seconds
  pages_viewed INTEGER DEFAULT 1,
  
  -- Engagement data
  clicked_buttons TEXT[], -- Array of button IDs clicked
  viewed_spaces TEXT[], -- Array of space IDs viewed
  actions_taken JSONB DEFAULT '[]'::jsonb, -- Array of action objects
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adaptive Rules Table
-- Defines conditions and actions for content adaptation
CREATE TABLE IF NOT EXISTS linkinbio_adaptive_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher executes first
  
  -- Conditions (must all match for rule to apply)
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  /* Example structure:
  [
    {
      "type": "geo_country",
      "operator": "equals",
      "value": "US"
    },
    {
      "type": "time_of_day",
      "operator": "between",
      "value": ["06:00", "12:00"]
    }
  ]
  */
  
  -- Actions (executed when conditions match)
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  /* Example structure:
  [
    {
      "type": "reorder",
      "target": "button_id_123",
      "config": { "position": 0 }
    },
    {
      "type": "show",
      "target": "button_id_456"
    }
  ]
  */
  
  -- Metadata
  times_triggered INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integrations Table
-- Stores connected external services
CREATE TABLE IF NOT EXISTS linkinbio_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  
  service TEXT NOT NULL CHECK (service IN (
    'shopify', 'spotify', 'calendly', 'youtube', 
    'eventbrite', 'mailchimp', 'twitter', 'instagram'
  )),
  
  -- OAuth credentials (ENCRYPTED)
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  
  -- Service-specific data
  service_user_id TEXT,
  service_username TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  /* Service-specific metadata:
  Shopify: { "shop_url", "shop_name" }
  Spotify: { "artist_id", "artist_name" }
  Calendly: { "calendar_url", "event_types" }
  YouTube: { "channel_id", "channel_name" }
  */
  
  -- Sync configuration
  auto_sync BOOLEAN DEFAULT true,
  sync_frequency INTEGER DEFAULT 60, -- minutes
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'error', 'paused', 'disconnected')),
  sync_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, service)
);

-- Content Items Table
-- Unified storage for all content (manual + integrated)
CREATE TABLE IF NOT EXISTS linkinbio_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES linkinbio_integrations(id) ON DELETE SET NULL,
  
  -- Content type and source
  type TEXT NOT NULL CHECK (type IN (
    'button', 'social', 'product', 'event', 'video', 
    'music', 'booking', 'article', 'custom'
  )),
  source TEXT NOT NULL DEFAULT 'manual', -- manual, shopify, spotify, etc.
  external_id TEXT, -- ID from external service
  
  -- Content data
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  
  -- Type-specific data
  price NUMERIC,
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}'::jsonb,
  /* Type-specific metadata:
  Product: { "inventory", "variants", "tags" }
  Event: { "date", "location", "tickets_available" }
  Video: { "duration", "views", "published_at" }
  Music: { "album", "artists", "duration_ms" }
  */
  
  -- Display configuration
  style JSONB DEFAULT '{}'::jsonb,
  visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  
  -- Flags
  auto_generated BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  external_created_at TIMESTAMPTZ,
  external_updated_at TIMESTAMPTZ
);

-- Spaces Table
-- Multi-layered access-controlled content areas
CREATE TABLE IF NOT EXISTS linkinbio_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL path: username.nexus/slug
  type TEXT NOT NULL CHECK (type IN ('public', 'vip', 'press', 'swag', 'custom')),
  
  -- Access control
  access_type TEXT NOT NULL DEFAULT 'open' CHECK (access_type IN (
    'open', 'password', 'email_gate', 'payment', 'waitlist'
  )),
  password_hash TEXT, -- For password-protected spaces
  allowed_emails TEXT[], -- For email-gated spaces
  price NUMERIC, -- For paid spaces
  currency TEXT DEFAULT 'USD',
  
  -- Content
  description TEXT,
  cover_image TEXT,
  content_ids UUID[], -- References to content_items
  
  -- Styling
  style_overrides JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  enabled BOOLEAN DEFAULT true,
  visit_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, slug)
);

-- A/B Tests Table
-- For testing different content variations
CREATE TABLE IF NOT EXISTS linkinbio_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Test configuration
  variant_a JSONB NOT NULL, -- Original version
  variant_b JSONB NOT NULL, -- Test version
  traffic_split INTEGER DEFAULT 50 CHECK (traffic_split >= 0 AND traffic_split <= 100),
  
  -- Metric to optimize
  metric TEXT NOT NULL CHECK (metric IN ('clicks', 'conversions', 'engagement', 'revenue')),
  goal_value NUMERIC,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  
  -- Results
  variant_a_visitors INTEGER DEFAULT 0,
  variant_b_visitors INTEGER DEFAULT 0,
  variant_a_conversions INTEGER DEFAULT 0,
  variant_b_conversions INTEGER DEFAULT 0,
  variant_a_value NUMERIC DEFAULT 0,
  variant_b_value NUMERIC DEFAULT 0,
  winner TEXT, -- 'a', 'b', or 'inconclusive'
  confidence NUMERIC, -- Statistical confidence %
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nexus Insights Table
-- AI-generated recommendations and alerts for Nexus features
CREATE TABLE IF NOT EXISTS linkinbio_nexus_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'alert', 'optimization', 'opportunity')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Actionable data
  action_type TEXT, -- create_rule, update_content, connect_integration, etc.
  action_data JSONB,
  
  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'dismissed', 'acted')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  acted_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Visitor sessions indexes
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_username ON linkinbio_visitor_sessions(username, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id ON linkinbio_visitor_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country ON linkinbio_visitor_sessions(country_code);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_device ON linkinbio_visitor_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_referrer ON linkinbio_visitor_sessions(referrer_domain);

-- Adaptive rules indexes
CREATE INDEX IF NOT EXISTS idx_adaptive_rules_user ON linkinbio_adaptive_rules(user_id, enabled, priority DESC);
CREATE INDEX IF NOT EXISTS idx_adaptive_rules_enabled ON linkinbio_adaptive_rules(enabled);

-- Integrations indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user ON linkinbio_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_service ON linkinbio_integrations(service);
CREATE INDEX IF NOT EXISTS idx_integrations_sync ON linkinbio_integrations(next_sync_at) WHERE linkinbio_integrations.auto_sync = true AND linkinbio_integrations.sync_status = 'active';

-- Content items indexes
CREATE INDEX IF NOT EXISTS idx_content_items_user ON linkinbio_content_items(user_id, visible, order_index);
CREATE INDEX IF NOT EXISTS idx_content_items_integration ON linkinbio_content_items(integration_id);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON linkinbio_content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_source ON linkinbio_content_items(source);

-- Spaces indexes
CREATE INDEX IF NOT EXISTS idx_spaces_user ON linkinbio_spaces(user_id);
CREATE INDEX IF NOT EXISTS idx_spaces_slug ON linkinbio_spaces(slug);

-- Nexus insights indexes
CREATE INDEX IF NOT EXISTS idx_nexus_insights_user ON linkinbio_nexus_insights(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nexus_insights_priority ON linkinbio_nexus_insights(priority) WHERE linkinbio_nexus_insights.status = 'new';

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nexus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to new tables
CREATE TRIGGER update_visitor_sessions_updated_at BEFORE UPDATE ON linkinbio_visitor_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_nexus_updated_at();

CREATE TRIGGER update_adaptive_rules_updated_at BEFORE UPDATE ON linkinbio_adaptive_rules 
  FOR EACH ROW EXECUTE FUNCTION update_nexus_updated_at();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON linkinbio_integrations 
  FOR EACH ROW EXECUTE FUNCTION update_nexus_updated_at();

CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON linkinbio_content_items 
  FOR EACH ROW EXECUTE FUNCTION update_nexus_updated_at();

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON linkinbio_spaces 
  FOR EACH ROW EXECUTE FUNCTION update_nexus_updated_at();

CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON linkinbio_ab_tests 
  FOR EACH ROW EXECUTE FUNCTION update_nexus_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE linkinbio_visitor_sessions IS 'Tracks visitor context and interactions for adaptive content';
COMMENT ON TABLE linkinbio_adaptive_rules IS 'Defines conditional content display rules based on visitor context';
COMMENT ON TABLE linkinbio_integrations IS 'Connected external services with OAuth credentials';
COMMENT ON TABLE linkinbio_content_items IS 'Unified content storage (manual + auto-synced from integrations)';
COMMENT ON TABLE linkinbio_spaces IS 'Multi-layered access-controlled content areas (VIP, press, etc.)';
COMMENT ON TABLE linkinbio_ab_tests IS 'A/B testing configurations and results';
COMMENT ON TABLE linkinbio_nexus_insights IS 'AI-generated recommendations and proactive alerts for Nexus features';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Nexus Phase 1 schema created successfully!';
  RAISE NOTICE 'Tables created: 7';
  RAISE NOTICE 'Indexes created: 16';
  RAISE NOTICE 'Triggers created: 6';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Install dependencies: npm install geoip-lite ua-parser-js uuid';
  RAISE NOTICE '2. Add to .env.local: INTEGRATION_ENCRYPTION_KEY=your_key';
  RAISE NOTICE '3. Implement backend services (visitor tracking, rules engine)';
END $$;
