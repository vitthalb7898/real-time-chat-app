import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.userId = payload.user_id;
        next();
    });
};
