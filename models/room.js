import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    position: {
        type: Number,
        default: 0 // lower number = top
    }
});

const Room = mongoose.model("Room", RoomSchema);

export default Room;