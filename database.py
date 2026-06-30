import sqlite3

conn = sqlite3.connect("appointments.db")

conn.execute("""
CREATE TABLE IF NOT EXISTS appointments(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    date TEXT,
    time TEXT
)
""")

conn.close()

print("Database created successfully")