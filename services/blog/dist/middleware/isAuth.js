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
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not defined");
        }
        // verify token
        const decoded = jwt.verify(token, secret);
        // validate payload
        if (!decoded?.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
        }
        // attach ONLY userId to request
        // req.userId = decoded.userId;
        req.user = {
            userId: decoded.userId,
            name: decoded.name,
            image: decoded.image
        };
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