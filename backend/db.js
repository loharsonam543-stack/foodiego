
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pass@123",
  database: "foodiego_db",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }

  console.log("FoodieGo Database Connected Successfully!");
});

module.exports = db;
