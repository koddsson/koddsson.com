CREATE TABLE notes (
  slug char(10),
  content varchar(1024),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
