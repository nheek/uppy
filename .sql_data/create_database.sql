CREATE TABLE IF NOT EXISTS uppy.public."Users" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS uppy.public."Files" (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES uppy.public."Users"(id),
  original_name VARCHAR(255) NOT NULL,
  saved_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(255) NOT NULL UNIQUE,
  upload_time TIMESTAMP DEFAULT NOW()
);