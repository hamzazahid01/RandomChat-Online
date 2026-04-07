import express from "express";
import http from "http";
import { Server } from "socket.io";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// DB
import connectDB from "./config/db.js";

// ================= Setup =================
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// __dirname fix (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= Middlewares =================
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// session (IMPORTANT: production ready config)
app.use(
    session({
        secret: process.env.SESSION_SECRET || "secretkey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // production mein true (HTTPS)
            httpOnly: true
        }
    })
);

// ================= Upload Folder =================
const uploadDir = path.join(__dirname, "public/uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ================= Multer =================
const allowedTypes = /jpeg|jpg|png|webp/;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const extOk = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimeOk = allowedTypes.test(file.mimetype);

    if (extOk && mimeOk) {
        cb(null, true);
    } else {
        cb(new Error("Only jpg, jpeg, png, webp images allowed"));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

// ================= Routes =================
app.use(authRoutes);
app.use(roomRoutes);
app.use(adminRoutes);

// ================= Upload Route =================
app.post("/upload-image", upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        res.json({
            imageUrl: `/uploads/${req.file.filename}`
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ================= Global Error Handler =================
app.use((err, req, res, next) => {
    console.error("Error:", err.message);

    res.status(500).json({
        error: err.message || "Internal Server Error"
    });
});

// ================= Socket.IO =================
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", ({ roomId, nickname }) => {
        socket.join(roomId);
    });

    socket.on("chatMessage", (data) => {
        io.to(data.roomId).emit("chatMessage", data);
    });

    socket.on("messageReaction", (data) => {
        io.to(data.roomId).emit("messageReaction", data);
    });

    socket.on("deleteMessage", ({ roomId, id }) => {
        io.to(roomId).emit("deleteMessage", { id });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// ================= Start Server =================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});