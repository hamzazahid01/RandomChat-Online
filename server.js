const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/randomChat")
.then(()=> console.log("MongoDB Connected"))
.catch(err=> console.log(err));

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static("public"));

app.use(session({
    secret:"secretkey",
    resave:false,
    saveUninitialized:false
}));

// Use Routes
app.use(authRoutes);
app.use(roomRoutes);
app.use(adminRoutes);

// ------------------- Socket.IO Room Logic -------------------
io.on("connection", (socket)=>{
    console.log("A user connected");

    // Join room
    socket.on("joinRoom", ({ roomId, nickname })=>{
        socket.join(roomId);
        console.log(`${nickname} joined room ${roomId}`);
    });

    // Send message (text + voice)
    socket.on("chatMessage", ({ roomId, user, message, id })=>{
        io.to(roomId).emit("chatMessage", { roomId, user, message, id });
    });

    // Delete / Unsend message
    socket.on("deleteMessage", ({ roomId, id })=>{
        io.to(roomId).emit("deleteMessage", { id });
    });

    socket.on("disconnect", ()=>{
        console.log("User disconnected");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=> console.log("Server running"));