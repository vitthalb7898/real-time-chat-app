import { Router } from "express";
import { signup } from "../controllers/AuthController.js";
import { login } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getUserInfo } from "../controllers/AuthController.js";
import { updateProfile } from "../controllers/ProfileController.js";
import { logout } from "../controllers/AuthController.js";
import multer from "multer";
import { addProfileImage , removeProfileImage } from "../controllers/ProfileController.js";

const upload = multer({ dest: "uploads/profiles/" });

const authRoutes = Router();

authRoutes.post("/signup" , signup);
authRoutes.post("/login" , login);
authRoutes.get("/user-info" ,verifyToken, getUserInfo);
authRoutes.post("/update-profile" , verifyToken, updateProfile);
authRoutes.post("/add-profile-image" , verifyToken, upload.single("profile-image"), addProfileImage);
authRoutes.delete("/remove-profile-image" , verifyToken, removeProfileImage);
authRoutes.post("/logout" , logout);
export default authRoutes;