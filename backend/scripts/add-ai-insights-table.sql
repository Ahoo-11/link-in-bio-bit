-- AI Insights table for storing daily AI-generated insights
CREATE TABLE IF NOT EXISTS linkinbio_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  insights JSONB NOT NULL,
  score INTEGER,
  recommendations JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON linkinbio_ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_generated_at ON linkinbio_ai_insights(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_valid_until ON linkinbio_ai_insights(valid_until);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_valid ON linkinbio_ai_insights(user_id, valid_until DESC);

-- Function to get latest valid insights for a user
CREATE OR REPLACE FUNCTION get_latest_ai_insights(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  insights JSONB,
  score INTEGER,
  recommendations JSONB,
  generated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai.id,
    ai.insights,
    ai.score,
    ai.recommendations,
    ai.generated_at
  FROM linkinbio_ai_insights ai
  WHERE ai.user_id = p_user_id
    AND ai.valid_until > NOW()
  ORDER BY ai.generated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old insights (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_insights()
RETURNS void AS $$
BEGIN
  DELETE FROM linkinbio_ai_insights
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE linkinbio_ai_insights IS 'Stores daily AI-generated insights for users';
COMMENT ON COLUMN linkinbio_ai_insights.valid_until IS 'Insights are valid until this timestamp (24 hours from generation)';
