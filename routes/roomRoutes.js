import express from "express";
import Room from "../models/room.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = express.Router();

// Root redirect
router.get("/", (req, res) => {
    res.redirect("/rooms");
});

// Rooms list
router.get("/rooms", isLoggedIn, async (req, res) => {
    const rooms = await Room.find({}).sort({ position: 1 });

    res.render("rooms", {
        nickname: req.session.nickname,
        rooms
    });
});

// Chat page
router.get("/chat/:roomId", isLoggedIn, async (req, res) => {
    const room = await Room.findById(req.params.roomId);

    if (!room) return res.send("Room not found");

    res.render("chat", {
        nickname: req.session.nickname,
        roomId: room._id,
        roomName: room.name
    });
});

export default router;