-- ==============================================================================
-- RICOZ Operations Suite V4.1 — Migration 002: Incident War Room
-- Target Database: InsForge PostgreSQL
-- Purpose: Schema for enterprise incident management and operational war room.
-- Note: Review and execute in database console according to Rule 13.
-- ==============================================================================

-- 1. Create admin_incidents table
CREATE TABLE IF NOT EXISTS public.admin_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_ref TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  category TEXT NOT NULL CHECK (category IN ('infrastructure', 'security', 'billing', 'talent_dispute', 'platform_sla', 'compliance')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'in_progress', 'resolved', 'closed')),
  assigned_admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create admin_incident_updates table for chronological incident timeline
CREATE TABLE IF NOT EXISTS public.admin_incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.admin_incidents(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  update_note TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_incidents_severity ON public.admin_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_admin_incidents_status ON public.admin_incidents(status);
CREATE INDEX IF NOT EXISTS idx_admin_incidents_created_at ON public.admin_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_incident_updates_incident ON public.admin_incident_updates(incident_id);
