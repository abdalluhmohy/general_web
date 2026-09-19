import app

app.initialize_database()
connection = app.connect_db()
print([row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'").fetchall()])
connection.close()
