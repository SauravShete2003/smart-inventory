import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
configDotenv();
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';

import { postLogin, postSignup } from "./controllers/user.js";
import { authenticateToken, authorizeRole } from "./middleware/auth.js";
import { getInventory, postInventory, putInventory } from "./controllers/inventory.js";
import { postSales, getSales } from "./controllers/sales.js";

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static('dist', {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
  

app.use(cors({
    origin: '*'
  }));
  

const mongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};
mongoDB();

// Health check API
app.get("/health", (req, res) => {
    res.json({ message: "Server is running", success: true });
});

// User APIs
app.post("/signup", postSignup);
app.post("/login", postLogin);

// Inventory APIs
app.get("/inventories", authenticateToken, getInventory);
app.post("/inventories", authenticateToken, authorizeRole(["admin", "manager"]), postInventory);
app.put("/inventories/:id", authenticateToken, authorizeRole(["admin", "manager"]), putInventory);
app.delete("/inventories/:id", authenticateToken, authorizeRole(["admin"]));

// Sales APIs
app.get("/sales", authenticateToken, getSales);
app.post("/sales", authenticateToken, postSales);

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
