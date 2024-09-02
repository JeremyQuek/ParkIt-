Student Club Database

CREATE TABLE clubs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  meeting_day TEXT NOT NULL,
  meeting_time TEXT NOT NULL
);

CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  club_id INTEGER,
  FOREIGN KEY (club_id) REFERENCES clubs(id)
);

INSERT INTO clubs (name, description, meeting_day, meeting_time)
VALUES
  ('Chess Club', 'For students interested in playing chess', 'Monday', '4:00 PM'),
  ('Science Fiction Club', 'Discuss and explore sci-fi literature and movies', 'Wednesday', '7:00 PM'),
  ('Hiking Club', 'Organize outdoor hiking trips', 'Saturday', '9:00 AM');

INSERT INTO members (first_name, last_name, email, club_id)
VALUES
  ('John', 'Doe', 'john.doe@example.com', 1),
  ('Jane', 'Smith', 'jane.smith@example.com', 1),
  ('Bob', 'Johnson', 'bob.johnson@example.com', 2),
  ('Alice', 'Williams', 'alice.williams@example.com', 2),
  ('Tom', 'Brown', 'tom.brown@example.com', 3),
  ('Emily', 'Davis', 'emily.davis@example.com', 3);
