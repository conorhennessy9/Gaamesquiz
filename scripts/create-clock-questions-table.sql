-- Create table for Rugby Against the Clock questions
CREATE TABLE IF NOT EXISTS rugby_clock_questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  answers TEXT[] NOT NULL,
  question_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for GAA Against the Clock questions  
CREATE TABLE IF NOT EXISTS gaa_clock_questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  answers TEXT[] NOT NULL,
  question_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default Rugby Against the Clock questions
INSERT INTO rugby_clock_questions (question_text, answers, question_date) VALUES
('Name Rugby World Cup winning countries', ARRAY['South Africa', 'New Zealand', 'Australia', 'England', 'France'], '2024-12-04'),
('Name Six Nations Championship teams', ARRAY['England', 'France', 'Ireland', 'Italy', 'Scotland', 'Wales'], '2024-12-05'),
('Name positions in rugby union', ARRAY['Hooker', 'Prop', 'Lock', 'Flanker', 'Number 8', 'Scrum-half', 'Fly-half', 'Centre', 'Wing', 'Fullback'], '2024-12-06')
ON CONFLICT (question_date) DO NOTHING;

-- Insert some default GAA Against the Clock questions
INSERT INTO gaa_clock_questions (question_text, answers, question_date) VALUES
('Name All-Ireland Football winning counties', ARRAY['Kerry', 'Dublin', 'Galway', 'Mayo', 'Cork', 'Tyrone', 'Donegal', 'Meath'], '2024-12-04'),
('Name All-Ireland Hurling winning counties', ARRAY['Kilkenny', 'Cork', 'Tipperary', 'Limerick', 'Galway', 'Clare', 'Wexford', 'Waterford'], '2024-12-05'),
('Name GAA provincial championships', ARRAY['Leinster', 'Munster', 'Ulster', 'Connacht'], '2024-12-06')
ON CONFLICT (question_date) DO NOTHING;
