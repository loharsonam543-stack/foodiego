
const db = require("./db");
require("dotenv").config();


const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FoodieGo Backend is running!");
});





app.get("/test-login", (req, res) => {
  res.send(`
    <h2>FoodieGo Login API Test</h2>

    <form action="/api/login" method="POST">
      <input
        name="email"
        value="sonam@example.com"
        placeholder="Email"
      />
      <br /><br />

      <input
        name="password"
        value="123456"
        placeholder="Password"
      />
      <br /><br />

      <button type="button" onclick="loginUser()">
        Login
      </button>



      <button type="button" onclick="getMyOrders()">
    Get My Orders
    </button>
    </form>

    <pre id="result"></pre>

    <script>
      async function loginUser() {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: document.querySelector('[name="email"]').value,
            password: document.querySelector('[name="password"]').value
          })
        });

        const data = await response.json();

        document.getElementById("result").textContent =
          JSON.stringify(data, null, 2);
      }





      async function getMyOrders() {
  const loginResponse = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "sonam@example.com",
      password: "123456"
    })
  });

  const loginData = await loginResponse.json();

  const ordersResponse = await fetch("/api/my-orders", {
    headers: {
      Authorization: "Bearer " + loginData.token
    }
  });

  const ordersData = await ordersResponse.json();

  document.getElementById("result").textContent =
    JSON.stringify(ordersData, null, 2);
}
    </script>
  `);
});




const bcrypt = require("bcryptjs");

// User Registration API
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(
      sql,
      [name, email, hashedPassword],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
              message: "Email already registered",
            });
          }

          console.error(err);
          return res.status(500).json({
            message: "Registration failed",
          });
        }

        res.status(201).json({
          message: "Registration successful",
          userId: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});


// Login API using MySQL and JWT
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Login failed",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = results[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
});


// JWT token verify karanare middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token missing. Please login first.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

// Protected My Orders API

// Protected My Orders API - Fetch orders from MySQL
app.get("/api/my-orders", verifyToken, (req, res) => {
  const userId = req.user.userId;

  const sql = `
    SELECT id, item_name, status, order_date
    FROM orders
    WHERE user_id = ?
    ORDER BY order_date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Orders fetch error:", err);

      return res.status(500).json({
        message: "Unable to fetch orders",
      });
    }

    res.json({
      message: "Orders fetched successfully",
      orders: results,
    });
  });
});


// Protected Place Order API
app.post("/api/place-order", verifyToken, (req, res) => {
  const { itemName } = req.body;

  if (!itemName) {
    return res.status(400).json({
      message: "Food item name is required",
    });
  }

  const userId = req.user.userId;

  const sql =
    "INSERT INTO orders (user_id, item_name, status) VALUES (?, ?, ?)";

  db.query(sql, [userId, itemName, "Preparing"], (err, result) => {
    if (err) {
      console.error("Place order error:", err);

      return res.status(500).json({
        message: "Unable to place order",
      });
    }

    res.status(201).json({
      message: "Order placed successfully!",
      orderId: result.insertId,
    });
  });
});


// Start FoodieGo Backend Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});