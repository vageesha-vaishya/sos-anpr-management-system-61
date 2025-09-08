-- PHASE 1: Foundation Enhancement - Role System Fix (Step 1: Drop conflicting policies)

-- Drop policies that reference the role column to allow type change
DROP POLICY IF EXISTS "Platform admins can insert continents" ON continents;
DROP POLICY IF EXISTS "Platform admins can update continents" ON continents;
DROP POLICY IF EXISTS "Platform admins can delete continents" ON continents;
DROP POLICY IF EXISTS "Platform admins can insert countries" ON countries;
DROP POLICY IF EXISTS "Platform admins can update countries" ON countries;
DROP POLICY IF EXISTS "Platform admins can delete countries" ON countries;
DROP POLICY IF EXISTS "Platform admins can insert cities" ON cities;
DROP POLICY IF EXISTS "Platform admins can update cities" ON cities;
DROP POLICY IF EXISTS "Platform admins can delete cities" ON cities;
DROP POLICY IF EXISTS "Platform Admins can Select buildings" ON buildings;
DROP POLICY IF EXISTS "Platform Admins can manage buildings" ON buildings;