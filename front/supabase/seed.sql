-- Seed file for development environment
-- This file is run after migrations in local development

-- Set search path
SET search_path TO public;

-- Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Note: This seed file should contain additional development data
-- The main sample data is in migration 20250127000007_sample_data.sql

-- You can add additional development-specific data here
-- For example:
-- INSERT INTO test_data ...
