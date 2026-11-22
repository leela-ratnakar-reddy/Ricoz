-- ==============================================================================
-- RICOZ Operations Suite V4.2 — Migration 003: AI Operations Intelligence
-- Target Database: InsForge PostgreSQL
-- Purpose: Schema for AI usage tracking, intelligence logs, and conversation history.
-- Note: Review and execute in database console according to Rule 13.
-- ==============================================================================

-- 1. Create admin_ai_usage_logs table
CREATE TABLE IF NOT EXISTS public.admin_ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  feature_used TEXT NOT NULL,
  provider TEXT NOT NULL,
  prompt_summary TEXT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'fallback')),
  tokens_used INTEGER,
  latency_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create admin_ai_conversations table for AI Assistant history
CREATE TABLE IF NOT EXISTS public.admin_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_ai_usage_created_at ON public.admin_ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_ai_usage_feature ON public.admin_ai_usage_logs(feature_used);
CREATE INDEX IF NOT EXISTS idx_admin_ai_usage_admin_id ON public.admin_ai_usage_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_ai_conversations_admin ON public.admin_ai_conversations(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_ai_conversations_updated ON public.admin_ai_conversations(updated_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.admin_ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_ai_conversations ENABLE ROW LEVEL SECURITY;

-- 5. Policies: Restrict access to authenticated administrators
CREATE POLICY "Admins have full access to admin_ai_usage_logs"
  ON public.admin_ai_usage_logs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Admins have full access to admin_ai_conversations"
  ON public.admin_ai_conversations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND status = 'active'
  ));
