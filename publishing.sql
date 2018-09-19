CREATE TABLE favorites (
  url varchar(128),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  slug char(10)
);
