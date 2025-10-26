/*
  # Lifeline Emergency Response App - Initial Schema

  ## Overview
  This migration creates the core database structure for the Lifeline emergency response application.
  
  ## New Tables
  
  ### 1. `user_profiles`
  Stores medical and personal information for emergency responders
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text) - User's full name
  - `blood_type` (text) - Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
  - `has_diabetes` (boolean) - Diabetes status
  - `allergies` (text) - Known allergies (comma-separated)
  - `medical_conditions` (text) - Other medical conditions
  - `medications` (text) - Current medications
  - `emergency_notes` (text) - Additional emergency information
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. `emergency_contacts`
  Stores emergency contact information for each user
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to user_profiles
  - `name` (text) - Contact's full name
  - `relationship` (text) - Relationship to user (e.g., spouse, parent, friend)
  - `phone` (text) - Contact's phone number
  - `is_primary` (boolean) - Whether this is the primary contact
  - `created_at` (timestamptz) - Record creation timestamp
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on all tables
  - Users can only view and modify their own data
  - All policies require authentication
  
  ### Policies Created
  
  #### user_profiles:
  1. Users can view their own profile
  2. Users can insert their own profile
  3. Users can update their own profile
  4. Users can delete their own profile
  
  #### emergency_contacts:
  1. Users can view their own emergency contacts
  2. Users can insert their own emergency contacts
  3. Users can update their own emergency contacts
  4. Users can delete their own emergency contacts
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  blood_type text,
  has_diabetes boolean DEFAULT false,
  allergies text DEFAULT '',
  medical_conditions text DEFAULT '',
  medications text DEFAULT '',
  emergency_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for emergency_contacts
CREATE POLICY "Users can view own emergency contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own emergency contacts"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own emergency contacts"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own emergency contacts"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_primary ON emergency_contacts(user_id, is_primary);