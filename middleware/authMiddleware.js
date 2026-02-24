// middleware/authMiddleware.js

function isLoggedIn(req, res, next) {
    if (!req.session.userId) return res.redirect("/login");
    next();
}

function isAdmin(req, res, next) {
    if (!req.session.isAdmin) return res.send("Access Denied");
    next();
}

module.exports = { isLoggedIn, isAdmin };