-- PostgreSQL schema for Edusched
-- File: schema.sql
-- Creates types, tables, constraints, indexes and inserts sample seed data

BEGIN;

-- Drop existing objects if present (safe when developing)
DROP TABLE IF EXISTS timetable_entries CASCADE;
DROP TABLE IF EXISTS conflicts CASCADE;
DROP TABLE IF EXISTS scheduling_rules CASCADE;
DROP TABLE IF EXISTS facilitators CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS school_config CASCADE;

DROP TYPE IF EXISTS subject_category_enum;
DROP TYPE IF EXISTS department_enum;
DROP TYPE IF EXISTS severity_enum;

-- Enums
CREATE TYPE subject_category_enum AS ENUM ('Core','Elective','Activity','Break','Intervention');
CREATE TYPE department_enum AS ENUM (
  'Creche',
  'Nursery',
  'Kindergarten',
  'Lower Basic',
  'Upper Basic',
  'Junior High School'
);
CREATE TYPE severity_enum AS ENUM ('normal','high');

-- Subjects
CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category subject_category_enum NOT NULL,
  color TEXT,
  goal TEXT
);

-- Time slots
CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT NOT NULL,
  is_break BOOLEAN DEFAULT FALSE,
  is_assembly BOOLEAN DEFAULT FALSE,
  is_support BOOLEAN DEFAULT FALSE,
  ordering INT DEFAULT 0
);

-- Facilitators (teachers)
CREATE TABLE facilitators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department department_enum NOT NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  available_days TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  periods_per_week INT DEFAULT 4
);

-- Scheduling rules (custom activities)
CREATE TABLE scheduling_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_dept TEXT NOT NULL, -- can be 'ALL' or any department_enum value
  day TEXT NOT NULL,
  slot_label TEXT NOT NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Timetable entries
CREATE TABLE timetable_entries (
  id BIGSERIAL PRIMARY KEY,
  day TEXT NOT NULL,
  slot_id INT REFERENCES time_slots(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_name TEXT NOT NULL,
  class_key TEXT NOT NULL,
  is_intervention BOOLEAN DEFAULT FALSE
);

-- Conflicts
CREATE TABLE conflicts (
  id BIGSERIAL PRIMARY KEY,
  teacher_name TEXT NOT NULL,
  day TEXT NOT NULL,
  start_time TIME NOT NULL,
  class_keys TEXT[] NOT NULL,
  severity severity_enum NOT NULL DEFAULT 'normal',
  detected_at TIMESTAMPTZ DEFAULT now()
);

-- School config (single row expected)
CREATE TABLE school_config (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  authorizer TEXT,
  term TEXT,
  academic_year TEXT
);

-- Indexes for common queries
CREATE INDEX idx_timetable_teacher_day_start ON timetable_entries (teacher_name, day);
CREATE INDEX idx_conflicts_teacher_day_start ON conflicts (teacher_name, day, start_time);
CREATE INDEX idx_facilitator_subject ON facilitators (subject_id);

-- Sample seed data
-- Subjects
INSERT INTO subjects (id, name, category, color, goal) VALUES
('math', 'Mathematics', 'Core', '#ffb300', 'Numeracy'),
('eng', 'English', 'Core', '#4fc3f7', 'Literacy'),
('sci', 'Science', 'Core', '#aed581', 'Inquiry'),
('assembly', 'Assembly', 'Break', '#9e9e9e', NULL),
('snack', 'Snack Break', 'Break', '#ffcc80', NULL),
('lunch', 'Lunch Break', 'Break', '#ffab91', NULL),
('pe', 'Physical Education', 'Activity', '#d1c4e9', 'Fitness');

-- Time slots (example sample day schedule)
INSERT INTO time_slots (start_time, end_time, label, is_break, is_assembly, ordering) VALUES
('08:00','08:15','Assembly', TRUE, TRUE, 1),
('08:15','09:00','Period 1', FALSE, FALSE, 2),
('09:00','09:45','Period 2', FALSE, FALSE, 3),
('09:45','10:00','Snack Break', TRUE, FALSE, 4),
('10:00','10:45','Period 3', FALSE, FALSE, 5),
('10:45','11:30','Period 4', FALSE, FALSE, 6),
('11:30','12:15','Lunch', TRUE, FALSE, 7),
('12:15','13:00','Period 5', FALSE, FALSE, 8);

-- Facilitators (example)
INSERT INTO facilitators (id, name, department, subject_id, available_days, periods_per_week) VALUES
(gen_random_uuid(), 'Alice Mensah', 'Lower Basic', 'math', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday'], 12),
(gen_random_uuid(), 'Kojo Owusu', 'Upper Basic', 'eng', ARRAY['Monday','Wednesday','Friday'], 8),
(gen_random_uuid(), 'Comfort Agyapong', 'Junior High School', 'sci', ARRAY['Tuesday','Thursday'], 6);

-- Scheduling rule example: Weekly Assembly on Monday Assembly slot
INSERT INTO scheduling_rules (name, target_dept, day, slot_label, subject_id, is_active) VALUES
('Monday Assembly', 'ALL', 'Monday', 'Assembly', 'assembly', TRUE),
('Snack Break', 'ALL', 'ANY', 'Snack Break', 'snack', TRUE);

-- Sample school config
INSERT INTO school_config (name, logo_url, authorizer, term, academic_year) VALUES
('Acme Academy', NULL, 'Board of Governors', 'Term 1', '2025/2026');

COMMIT;

-- How to use:
-- psql -d yourdb -f schema.sql
-- NOTE: gen_random_uuid() requires the pgcrypto extension or use uuid_generate_v4() if using uuid-ossp.

-- Optional (uncomment to enable pgcrypto if available):
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- End of file
