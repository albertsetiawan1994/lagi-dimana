/*
  # Create users and related tables for Lagi Dimana mobile app

  1. New Tables
    - `users` - Store user profiles and location data
      - `id` (uuid, primary key, auth.users.id)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text, optional)
      - `avatar` (text, optional)
      - `level` (integer, default 1)
      - `progress` (integer, default 0)
      - `family_group_id` (uuid, optional)
      - `location` (jsonb - {latitude, longitude})
      - `last_seen` (timestamp)
      - `is_online` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `family_groups` - Store family/group information
      - `id` (uuid, primary key)
      - `name` (text)
      - `owner_id` (uuid, references users)
      - `created_at` (timestamp)

    - `family_group_members` - Track group membership
      - `id` (uuid, primary key)
      - `group_id` (uuid, references family_groups)
      - `user_id` (uuid, references users)
      - `joined_at` (timestamp)

    - `location_history` - Store location tracking history
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can read/update own profile
    - Users can read locations of family group members
    - Users can insert own location history
*/

CREATE TABLE IF NOT EXISTS family_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  avatar text,
  level integer DEFAULT 1,
  progress integer DEFAULT 0,
  family_group_id uuid REFERENCES family_groups(id) ON DELETE SET NULL,
  location jsonb,
  last_seen timestamptz,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS location_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Family group members can view group"
  ON family_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_group_members
      WHERE family_group_members.group_id = family_groups.id
      AND family_group_members.user_id = auth.uid()
    ) OR owner_id = auth.uid()
  );

CREATE POLICY "Users can create family groups"
  ON family_groups FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can manage own groups"
  ON family_groups FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can view group memberships"
  ON family_group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_groups
      WHERE family_groups.id = family_group_members.group_id
      AND (family_groups.owner_id = auth.uid() OR family_group_members.user_id = auth.uid())
    )
  );

CREATE POLICY "Group owners can manage members"
  ON family_group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_groups
      WHERE family_groups.id = group_id
      AND family_groups.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own location history"
  ON location_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert location history"
  ON location_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_location_history_user_id ON location_history(user_id);
CREATE INDEX idx_location_history_timestamp ON location_history(timestamp);
CREATE INDEX idx_family_group_members_user_id ON family_group_members(user_id);
CREATE INDEX idx_family_group_members_group_id ON family_group_members(group_id);
