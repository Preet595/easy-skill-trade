import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

dotenv.config({ override: true });

const app = express();
const port = Number(process.env.API_PORT || 3001);

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "easy_skill_trade",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

const mapUser = (row) => ({
  id: String(row.id),
  name: row.name,
  email: row.email,
  avatar: row.avatar,
});

const mapSkill = (row) => ({
  id: String(row.id),
  name: row.name,
});

const mapUserSkill = (row) => ({
  userId: String(row.user_id),
  skillId: String(row.skill_id),
  type: row.type,
});

const mapSwapRequest = (row) => ({
  id: String(row.id),
  senderId: String(row.sender_id),
  receiverId: String(row.receiver_id),
  skillId: String(row.skill_id),
  status: row.status,
  createdAt: row.created_at,
});

const mapMessage = (row) => ({
  id: String(row.id),
  swapRequestId: String(row.swap_request_id),
  senderId: String(row.sender_id),
  body: row.body,
  createdAt: row.created_at,
  kind: row.kind || "text",
  audioUrl: row.audio_path || null,
});

const makeAvatar = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const loadBootstrapData = async () => {
  const [usersRows] = await pool.query("SELECT id, name, email, avatar FROM users ORDER BY id");
  const [skillsRows] = await pool.query("SELECT id, name FROM skills ORDER BY id");
  const [userSkillsRows] = await pool.query("SELECT user_id, skill_id, type FROM user_skills");
  const [swapRows] = await pool.query(
    "SELECT id, sender_id, receiver_id, skill_id, status, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM swap_requests ORDER BY created_at DESC, id DESC"
  );

  return {
    users: usersRows.map(mapUser),
    skills: skillsRows.map(mapSkill),
    userSkills: userSkillsRows.map(mapUserSkill),
    swapRequests: swapRows.map(mapSwapRequest),
  };
};

const ensureTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_skills (
      user_id BIGINT NOT NULL,
      skill_id BIGINT NOT NULL,
      type ENUM('offer', 'learn') NOT NULL,
      PRIMARY KEY (user_id, skill_id, type),
      CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS swap_requests (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      sender_id BIGINT NOT NULL,
      receiver_id BIGINT NOT NULL,
      skill_id BIGINT NOT NULL,
      status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
      created_at DATE NOT NULL,
      CONSTRAINT fk_swap_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_swap_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_swap_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      swap_request_id BIGINT NOT NULL,
      sender_id BIGINT NOT NULL,
      body TEXT NOT NULL,
      kind ENUM('text', 'audio') NOT NULL DEFAULT 'text',
      audio_path TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_messages_swap_request FOREIGN KEY (swap_request_id) REFERENCES swap_requests(id) ON DELETE CASCADE,
      CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

// Ensure messages table has columns for voice messages even if it was created before kind/audio_path existed
const ensureMessageSchema = async () => {
  try {
    await pool.query("ALTER TABLE messages ADD COLUMN kind ENUM('text', 'audio') NOT NULL DEFAULT 'text'");
  } catch (error) {
    if (error && error.code !== "ER_DUP_FIELDNAME") {
      throw error;
    }
  }

  try {
    await pool.query("ALTER TABLE messages ADD COLUMN audio_path TEXT NULL");
  } catch (error) {
    if (error && error.code !== "ER_DUP_FIELDNAME") {
      throw error;
    }
  }
};

const seedDefaultsIfEmpty = async () => {
  const [[skillsCount]] = await pool.query("SELECT COUNT(*) AS count FROM skills");
  if (skillsCount.count === 0) {
    const skills = [
      [1, "JavaScript"],
      [2, "Python"],
      [3, "Guitar"],
      [4, "Photography"],
      [5, "Cooking"],
      [6, "Spanish"],
      [7, "Yoga"],
      [8, "Drawing"],
      [9, "React"],
      [10, "Machine Learning"],
      [11, "Video Editing"],
      [12, "Public Speaking"],
    ];
    await pool.query("INSERT INTO skills (id, name) VALUES ?", [skills]);
  }

  const [[usersCount]] = await pool.query("SELECT COUNT(*) AS count FROM users");
  if (usersCount.count === 0) {
    const users = [
      [1, "Alex Rivera", "alex@example.com", "demo-password", "AR"],
      [2, "Priya Sharma", "priya@example.com", "demo-password", "PS"],
      [3, "Jordan Lee", "jordan@example.com", "demo-password", "JL"],
      [4, "Sam Chen", "sam@example.com", "demo-password", "SC"],
      [5, "Maria Garcia", "maria@example.com", "demo-password", "MG"],
    ];
    await pool.query("INSERT INTO users (id, name, email, password, avatar) VALUES ?", [users]);
  }

  const [[userSkillsCount]] = await pool.query("SELECT COUNT(*) AS count FROM user_skills");
  if (userSkillsCount.count === 0) {
    const userSkills = [
      [1, 1, "offer"],
      [1, 9, "offer"],
      [1, 3, "learn"],
      [1, 6, "learn"],
      [2, 2, "offer"],
      [2, 10, "offer"],
      [2, 4, "learn"],
      [2, 5, "learn"],
      [3, 3, "offer"],
      [3, 8, "offer"],
      [3, 1, "learn"],
      [3, 9, "learn"],
      [4, 4, "offer"],
      [4, 11, "offer"],
      [4, 2, "learn"],
      [5, 5, "offer"],
      [5, 6, "offer"],
      [5, 7, "offer"],
      [5, 8, "learn"],
    ];
    await pool.query("INSERT INTO user_skills (user_id, skill_id, type) VALUES ?", [userSkills]);
  }

  const [[swapCount]] = await pool.query("SELECT COUNT(*) AS count FROM swap_requests");
  if (swapCount.count === 0) {
    await pool.query(
      "INSERT INTO swap_requests (id, sender_id, receiver_id, skill_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [1, 3, 1, 1, "pending", "2026-02-14"]
    );
  }
};

app.get("/api/health", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/bootstrap", async (_req, res, next) => {
  try {
    const data = await loadBootstrapData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.post("/api/skills", async (req, res, next) => {
  try {
    const { name } = req.body;
    const trimmed = (name || "").trim();

    if (!trimmed) {
      res.status(400).json({ message: "Skill name is required" });
      return;
    }

    const [existingRows] = await pool.query("SELECT id, name FROM skills WHERE LOWER(name) = LOWER(?) LIMIT 1", [trimmed]);
    if (existingRows.length > 0) {
      res.json({ skill: mapSkill(existingRows[0]) });
      return;
    }

    const [result] = await pool.query("INSERT INTO skills (name) VALUES (?)", [trimmed]);
    const [rows] = await pool.query("SELECT id, name FROM skills WHERE id = ?", [result.insertId]);

    res.status(201).json({ skill: mapSkill(rows[0]) });
  } catch (error) {
    if (error && error.code === "ER_DUP_ENTRY") {
      try {
        const { name } = req.body;
        const trimmed = (name || "").trim();
        const [rows] = await pool.query("SELECT id, name FROM skills WHERE LOWER(name) = LOWER(?) LIMIT 1", [trimmed]);
        if (rows.length > 0) {
          res.json({ skill: mapSkill(rows[0]) });
          return;
        }
      } catch (innerErr) {
        console.error("Failed to recover from duplicate skill entry", innerErr);
      }
    }
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const [rows] = await pool.query("SELECT id, name, email, avatar FROM users WHERE email = ? LIMIT 1", [email]);
    const user = rows[0];

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    res.json({ user: mapUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    const [existingRows] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existingRows.length > 0) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)",
      [name, email, password, makeAvatar(name)]
    );

    const [rows] = await pool.query("SELECT id, name, email, avatar FROM users WHERE id = ?", [result.insertId]);
    res.status(201).json({ user: mapUser(rows[0]) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/user-skills", async (req, res, next) => {
  try {
    const { userId, skillId, type } = req.body;
    if (!userId || !skillId || (type !== "offer" && type !== "learn")) {
      res.status(400).json({ message: "userId, skillId, and valid type are required" });
      return;
    }

    await pool.query("INSERT IGNORE INTO user_skills (user_id, skill_id, type) VALUES (?, ?, ?)", [userId, skillId, type]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.delete("/api/user-skills", async (req, res, next) => {
  try {
    const { userId, skillId, type } = req.query;
    if (!userId || !skillId || (type !== "offer" && type !== "learn")) {
      res.status(400).json({ message: "userId, skillId, and valid type are required" });
      return;
    }

    await pool.query("DELETE FROM user_skills WHERE user_id = ? AND skill_id = ? AND type = ?", [userId, skillId, type]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.post("/api/swap-requests", async (req, res, next) => {
  try {
    const { senderId, receiverId, skillId } = req.body;
    if (!senderId || !receiverId || !skillId) {
      res.status(400).json({ message: "senderId, receiverId, and skillId are required" });
      return;
    }

    const [existingRows] = await pool.query(
      "SELECT id, sender_id, receiver_id, skill_id, status, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM swap_requests WHERE sender_id = ? AND receiver_id = ? AND skill_id = ? AND status = 'pending' LIMIT 1",
      [senderId, receiverId, skillId]
    );

    if (existingRows.length > 0) {
      res.json({ swapRequest: mapSwapRequest(existingRows[0]) });
      return;
    }

    const [result] = await pool.query(
      "INSERT INTO swap_requests (sender_id, receiver_id, skill_id, status, created_at) VALUES (?, ?, ?, 'pending', CURDATE())",
      [senderId, receiverId, skillId]
    );

    const [rows] = await pool.query(
      "SELECT id, sender_id, receiver_id, skill_id, status, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM swap_requests WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ swapRequest: mapSwapRequest(rows[0]) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/swap-requests/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== "accepted" && status !== "rejected") {
      res.status(400).json({ message: "status must be accepted or rejected" });
      return;
    }

    await pool.query("UPDATE swap_requests SET status = ? WHERE id = ?", [status, id]);

    const [rows] = await pool.query(
      "SELECT id, sender_id, receiver_id, skill_id, status, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM swap_requests WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "Request not found" });
      return;
    }

    res.json({ swapRequest: mapSwapRequest(rows[0]) });
  } catch (error) {
    next(error);
  }
});

// Chat messages for an accepted swap request
app.get("/api/chats/:swapRequestId", async (req, res, next) => {
  try {
    const { swapRequestId } = req.params;

    const [[swap]] = await pool.query(
      "SELECT id, sender_id, receiver_id, skill_id, status, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM swap_requests WHERE id = ?",
      [swapRequestId]
    );

    if (!swap) {
      res.status(404).json({ message: "Swap request not found" });
      return;
    }

    const [messageRows] = await pool.query(
      "SELECT id, swap_request_id, sender_id, body, kind, audio_path, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at FROM messages WHERE swap_request_id = ? ORDER BY created_at ASC, id ASC",
      [swapRequestId]
    );

    res.json({
      swapRequest: mapSwapRequest(swap),
      messages: messageRows.map(mapMessage),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/chats/:swapRequestId/messages", async (req, res, next) => {
  try {
    const { swapRequestId } = req.params;
    const { senderId, body, kind } = req.body;

    const messageKind = kind === "audio" ? "audio" : "text";
    const text = typeof body === "string" ? body.trim() : "";
    if (!senderId || !text) {
      res.status(400).json({ message: "senderId and non-empty body are required" });
      return;
    }

    const [[swap]] = await pool.query(
      "SELECT id, sender_id, receiver_id, skill_id, status, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM swap_requests WHERE id = ?",
      [swapRequestId]
    );

    if (!swap) {
      res.status(404).json({ message: "Swap request not found" });
      return;
    }

    if (swap.status !== "accepted") {
      res.status(400).json({ message: "Chat is only available for accepted requests" });
      return;
    }

    if (String(senderId) !== String(swap.sender_id) && String(senderId) !== String(swap.receiver_id)) {
      res.status(403).json({ message: "Sender must be part of this swap" });
      return;
    }

    let storedBody = text;
    let audioPath = null;

    if (messageKind === "audio") {
      try {
        const commaIndex = text.indexOf(",");
        const base64 = commaIndex >= 0 ? text.slice(commaIndex + 1) : text;
        const buffer = Buffer.from(base64, "base64");

        await fs.mkdir(uploadsDir, { recursive: true });
        const filename = `voice-${swapRequestId}-${Date.now()}-${Math.random().toString(36).slice(2)}.webm`;
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, buffer);
        audioPath = `/uploads/${filename}`;
        storedBody = "[voice message]";
      } catch (error) {
        console.error("Failed to store audio message", error);
        res.status(400).json({ message: "Invalid audio data" });
        return;
      }
    }

    const [result] = await pool.query(
      "INSERT INTO messages (swap_request_id, sender_id, body, kind, audio_path) VALUES (?, ?, ?, ?, ?)",
      [swapRequestId, senderId, storedBody, messageKind, audioPath]
    );

    const [rows] = await pool.query(
      "SELECT id, swap_request_id, sender_id, body, kind, audio_path, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at FROM messages WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ message: mapMessage(rows[0]) });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

const start = async () => {
  try {
    await ensureTables();
    await ensureMessageSchema();
    await seedDefaultsIfEmpty();

    app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start API server:", error);
    process.exit(1);
  }
};

start();
