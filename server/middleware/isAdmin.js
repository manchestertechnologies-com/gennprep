// Runs AFTER the "protect" middleware, so req.user already exists
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next(); // admin: let them through
    }
    return res.status(403).json({ message: "Admins only" });
};

module.exports = isAdmin;