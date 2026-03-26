const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "instance", "students.db");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.serialize(() => {
    db.all("SELECT sql FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) {
            fs.writeFileSync("schema_dump.txt", err.message);
            return;
        }
        let out = "";
        rows.forEach(row => {
            out += row.sql + "\n-------------------\n";
        });
        fs.writeFileSync("schema_dump.txt", out);
        db.close();
    });
});
