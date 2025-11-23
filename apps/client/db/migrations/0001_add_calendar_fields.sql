-- Add calendar event fields to people table
ALTER TABLE people ADD COLUMN calendar_event_id TEXT;
ALTER TABLE people ADD COLUMN calendar_event_title TEXT;
ALTER TABLE people ADD COLUMN calendar_event_start_date INTEGER;
ALTER TABLE people ADD COLUMN calendar_event_end_date INTEGER;

CREATE INDEX IF NOT EXISTS people_calendar_event_id_idx ON people(calendar_event_id);
