const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    position: { type: Number, default: 0 } // lower number = top
});

module.exports = mongoose.model("Room", RoomSchema);