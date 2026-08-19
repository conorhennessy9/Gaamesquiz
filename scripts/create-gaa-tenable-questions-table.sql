-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create GAA TenaBall questions table
CREATE TABLE IF NOT EXISTS gaa_tenaball_questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  answers TEXT[] NOT NULL,
  question_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on question_date for faster lookups
CREATE INDEX IF NOT EXISTS idx_gaa_tenaball_questions_date ON gaa_tenaball_questions(question_date);

-- Insert sample data for today and upcoming days
INSERT INTO gaa_tenaball_questions (question_text, answers, question_date) VALUES
(
  'Name All-Ireland Football winning counties',
  ARRAY['Kerry', 'Dublin', 'Galway', 'Mayo', 'Cork', 'Tyrone', 'Donegal', 'Meath', 'Down', 'Offaly'],
  CURRENT_DATE
),
(
  'Name All-Ireland Hurling winning counties',
  ARRAY['Kilkenny', 'Cork', 'Tipperary', 'Limerick', 'Galway', 'Clare', 'Wexford', 'Waterford', 'Dublin', 'Offaly'],
  CURRENT_DATE + INTERVAL '1 day'
),
(
  'Name current GAA stadiums with a capacity over 25,000',
  ARRAY['Croke Park', 'Semple Stadium', 'Páirc Uí Chaoimh', 'Fitzgerald Stadium', 'Pearse Stadium', 'MacHale Park', 'Casement Park', 'St. Tiernach''s Park', 'Nowlan Park', 'Gaelic Grounds'],
  CURRENT_DATE + INTERVAL '2 days'
),
(
  'Name GAA provincial championships',
  ARRAY['Leinster Championship', 'Munster Championship', 'Ulster Championship', 'Connacht Championship', 'All-Ireland Championship', 'National League', 'Club Championship', 'Minor Championship', 'Under-21 Championship', 'Intermediate Championship'],
  CURRENT_DATE + INTERVAL '3 days'
),
(
  'Name famous GAA players from Kerry',
  ARRAY['Colm Cooper', 'Maurice Fitzgerald', 'Páidí Ó Sé', 'Mick O''Connell', 'Jack O''Shea', 'Mikey Sheehy', 'Pat Spillane', 'Seamus Moynihan', 'Tomás Ó Sé', 'Paul Galvin'],
  CURRENT_DATE + INTERVAL '4 days'
)
ON CONFLICT (question_date) DO NOTHING;
