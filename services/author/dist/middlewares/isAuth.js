import chalk from "chalk";
import jwt from "jsonwebtoken";
// Authentication middleware for BLOG SERVICE - we don't query MongoDB here, we only verify JWT and extract userId
export const isAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; // read authorization header
        // validate header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token",
            });
        }
        // extract token
        const token = authHeader.split(" ")[1];
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // validate payload
        if (!decoded?.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
        }
        // attach ONLY userId to request
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        console.log(chalk.red.bold("Auth error-author:", error));
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token ",
        });
    }
};
//# sourceMappingURL=isAuth.js.map