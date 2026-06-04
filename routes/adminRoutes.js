import express from "express";
import Room from "../models/room.js";
import { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin page
router.get("/admin", async (req, res) => {
    if (req.session.isAdmin) {
        const rooms = await Room.find({}).sort({ position: 1 });
        return res.render("admin", { loggedIn: true, message: null, rooms });
    }

    res.render("admin", { loggedIn: false, message: null, rooms: [] });
});
// Login
router.post("/admin/login", (req, res) => {
    const { name, password } = req.body;

    if (name === "hamza" && password === "Hamza123") {
        req.session.isAdmin = true;
        return res.redirect("/admin");
    }

    res.render("admin", {
        loggedIn: false,
        message: "Invalid Credentials!",
        
        rooms: []
    });
});

// Create room
router.post("/admin/create-room", isAdmin, async (req, res) => {
    const { name } = req.body;

    if (!name) return res.send("Room name required");

    const maxRoom = await Room.findOne().sort({ position: -1 });
    const newPos = maxRoom ? maxRoom.position + 1 : 0;

    await Room.create({ name, position: newPos });
    res.redirect("/admin");
});

// Delete room
router.post("/admin/delete-room/:roomId", isAdmin, async (req, res) => {
    await Room.findByIdAndDelete(req.params.roomId);
    res.redirect("/admin");
});

// Update positions
router.post("/admin/update-positions", isAdmin, async (req, res) => {
    const positions = req.body.positions;

    for (const item of positions) {
        await Room.findByIdAndUpdate(item._id, {
            position: item.position
        });
    }

    res.send("Updated");
});

export default router;