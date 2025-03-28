import jwt from "jsonwebtoken"

export const sessionValidationMW = (req, res, next) => {
    const { sessionToken } = req.cookies;
    console.log("sessionToken = ", sessionToken);

    if (!sessionToken) {
        return res.status(401).json({ message: "No session token provided" });
    }
    try {
        console.log("decoding...");
        const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
        console.log("decoded = ", decoded);
        req.voterId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired session token" });
    }
}