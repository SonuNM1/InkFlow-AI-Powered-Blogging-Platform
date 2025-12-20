import chalk from "chalk";
import jwt, {} from "jsonwebtoken";
import User from "../model/user.model.js";
/*
This middleware protects routes. Flow:

1. Client sends request with "Authorization: Bearer <JWT>"

2. Middleware: Checks header exists, Extracts token, Verifies JWT, Attaches logged-in user to "req"

3. Calls next() -> request reaches controller

In JS, we can attach anything to req (req.user, req.id, etc)

In TS, we must declare it first. Otherwise, TS will throw an error.
That's the core difference.

*/
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; // read authorization header 
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Please Login - No auth header",
            });
            return;
        }
        // extract token
        const token = authHeader.split(" ")[1];
        // Verify JWT 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // validate payload 
        if (!decoded || !decoded.userId) {
            res.status(401).json({
                message: "Invalid token payload"
            });
            return;
        }
        // fetch user from DB
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(401).json({
                message: "User not found"
            });
            return;
        }
        req.user = user; // attach user to request
        next();
    }
    catch (error) {
        console.log(chalk.red.bold("Is Auth middleware error: ", error));
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
//# sourceMappingURL=isAuth.js.map