-- AI Agent Conversations and Messages Tables
-- Run this migration to add AI agent chat functionality

-- Conversations table - stores chat sessions
CREATE TABLE IF NOT EXISTS linkinbio_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  title TEXT, -- Auto-generated from first message
  context JSONB DEFAULT '{}'::jsonb, -- Current profile snapshot for context
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table - stores individual chat messages
CREATE TABLE IF NOT EXISTS linkinbio_ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES linkinbio_ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Action metadata for assistant messages
  actions_executed JSONB, -- Array of actions taken by AI
  function_call JSONB, -- Original function call from AI
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON linkinbio_ai_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON linkinbio_ai_messages(conversation_id, created_at ASC);

-- Function to get or create active conversation for a user
CREATE OR REPLACE FUNCTION get_or_create_conversation(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to get most recent conversation (within last 24 hours)
  SELECT id INTO v_conversation_id
  FROM linkinbio_ai_conversations
  WHERE user_id = p_user_id
    AND updated_at > NOW() - INTERVAL '24 hours'
  ORDER BY updated_at DESC
  LIMIT 1;
  
  -- If no recent conversation, create new one
  IF v_conversation_id IS NULL THEN
    INSERT INTO linkinbio_ai_conversations (user_id, title)
    VALUES (p_user_id, 'New Conversation')
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation timestamp and count
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE linkinbio_ai_conversations
  SET 
    updated_at = NOW(),
    message_count = message_count + 1,
    -- Auto-generate title from first user message
    title = CASE 
      WHEN title = 'New Conversation' AND NEW.role = 'user' THEN 
        LEFT(NEW.content, 50)
      ELSE 
        title
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
DROP TRIGGER IF EXISTS trg_update_conversation ON linkinbio_ai_messages;
CREATE TRIGGER trg_update_conversation
  AFTER INSERT ON linkinbio_ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to cleanup old conversations (optional, run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM linkinbio_ai_conversations
  WHERE updated_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE linkinbio_ai_conversations IS 'Stores AI agent chat conversation sessions';
COMMENT ON TABLE linkinbio_ai_messages IS 'Stores individual messages in AI conversations';
COMMENT ON COLUMN linkinbio_ai_messages.actions_executed IS 'Array of actions performed by AI (e.g., button_added, profile_updated)';
COMMENT ON COLUMN linkinbio_ai_conversations.context IS 'Snapshot of user profile state for AI context';
