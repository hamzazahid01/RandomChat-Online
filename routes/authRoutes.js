const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Register page
router.get("/register", (req,res)=> res.render("register"));

// Register POST
router.post("/register", async (req,res)=>{
    try {
        const { nickname,email,password } = req.body;

        const existing = await User.findOne({ email });
        if(existing) return res.send("Email already registered");

        const hashed = await bcrypt.hash(password,10);
        await User.create({ nickname,email,password:hashed });

        res.redirect("/login");
    } catch(err){
        console.log(err);
        res.send("Error during registration");
    }
});

// Login page
router.get("/login", (req,res)=> res.render("login"));

// Login POST
router.post("/login", async (req,res)=>{
    try {
        const { email,password } = req.body;
        const user = await User.findOne({ email });
        if(!user) return res.send("User not found");

        const match = await bcrypt.compare(password,user.password);
        if(!match) return res.send("Wrong password");

        req.session.userId = user._id;
        req.session.nickname = user.nickname;

        res.redirect("/rooms");
    } catch(err){
        console.log(err);
        res.send("Error during login");
    }
});

// Logout
router.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/login");
});

module.exports = router;