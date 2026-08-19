-- Create GAA Answer Bank Table
CREATE TABLE IF NOT EXISTS gaa_answer_bank (
  id SERIAL PRIMARY KEY,
  answer TEXT NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 1,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Rugby Answer Bank Table
CREATE TABLE IF NOT EXISTS rugby_answer_bank (
  id SERIAL PRIMARY KEY,
  answer TEXT NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 1,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_gaa_answer_bank_answer ON gaa_answer_bank USING gin(to_tsvector('english', answer));
CREATE INDEX IF NOT EXISTS idx_gaa_answer_bank_usage ON gaa_answer_bank(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_rugby_answer_bank_answer ON rugby_answer_bank USING gin(to_tsvector('english', answer));
CREATE INDEX IF NOT EXISTS idx_rugby_answer_bank_usage ON rugby_answer_bank(usage_count DESC);

-- Populate GAA Answer Bank from existing questions
INSERT INTO gaa_answer_bank (answer, category)
SELECT DISTINCT 
  unnest(answers) as answer,
  'stadium' as category
FROM gaa_tenaball_questions
ON CONFLICT (answer) 
DO UPDATE SET 
  usage_count = gaa_answer_bank.usage_count + 1,
  updated_at = CURRENT_TIMESTAMP;

-- Populate Rugby Answer Bank from existing questions
INSERT INTO rugby_answer_bank (answer, category)
SELECT DISTINCT 
  unnest(answers) as answer,
  'general' as category
FROM rugby_tenaball_questions
ON CONFLICT (answer) 
DO UPDATE SET 
  usage_count = rugby_answer_bank.usage_count + 1,
  updated_at = CURRENT_TIMESTAMP;

-- Add some common GAA answers manually
INSERT INTO rugby_answer_bank (answer, category) VALUES
  ('New Zealand', 'country'),
  ('South Africa', 'country'),
  ('England', 'country'),
  ('Australia', 'country'),
  ('Ireland', 'country'),
  ('France', 'country'),
  ('Wales', 'country'),
  ('Scotland', 'country'),
  ('Argentina', 'country'),
  ('Italy', 'country')
ON CONFLICT (answer) DO NOTHING;

-- Function to update answer bank when new questions are added
CREATE OR REPLACE FUNCTION update_answer_bank()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'gaa_tenaball_questions' THEN
    INSERT INTO gaa_answer_bank (answer, category)
    SELECT unnest(NEW.answers), 'general'
    ON CONFLICT (answer) 
    DO UPDATE SET 
      usage_count = gaa_answer_bank.usage_count + 1,
      updated_at = CURRENT_TIMESTAMP;
  ELSIF TG_TABLE_NAME = 'rugby_tenaball_questions' THEN
    INSERT INTO rugby_answer_bank (answer, category)
    SELECT unnest(NEW.answers), 'general'
    ON CONFLICT (answer) 
    DO UPDATE SET 
      usage_count = rugby_answer_bank.usage_count + 1,
      updated_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update answer banks
DROP TRIGGER IF EXISTS update_gaa_answer_bank ON gaa_tenaball_questions;
CREATE TRIGGER update_gaa_answer_bank
AFTER INSERT OR UPDATE ON gaa_tenaball_questions
FOR EACH ROW
EXECUTE FUNCTION update_answer_bank();

DROP TRIGGER IF EXISTS update_rugby_answer_bank ON rugby_tenaball_questions;
CREATE TRIGGER update_rugby_answer_bank
AFTER INSERT OR UPDATE ON rugby_tenaball_questions
FOR EACH ROW
EXECUTE FUNCTION update_answer_bank();
