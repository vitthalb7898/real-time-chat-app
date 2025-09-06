import bcrypt from "bcrypt";
import { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";




const prisma = new PrismaClient();

async function hashPassword(password) {

  const salt = await genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, user_id) => {
    return jwt.sign({ email, user_id }, process.env.JWT_KEY, { expiresIn: maxAge });
};

export const signup = async (req, res, next) => {

    try {
        const { email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }


    const hashedPassword = await hashPassword(password);

    

    
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            }
        });

        res.cookie("jwt", createToken(user.email, user.id), { secure: true, maxAge, sameSite: "None" });
        res.status(201).json({user:{
            id: user.id,
            email: user.email,
            profileSetup: user.profileSetup
        }});

    } catch (error) {
        console.error("Error in signup:", error);
        return res.status(500).json({ error: "AuthController :: signup" });
    }
}


export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Password is incorrect" });
        }

        res.cookie("jwt", createToken(user.email, user.id), { secure: true, maxAge, sameSite: "None" });
        res.status(200).json({ user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            color: user.color,
            profileSetup: user.profileSetup
        }});

    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ error: "AuthController :: login" });
    }
}

export const getUserInfo = async (req, res, next) => {
    try {
        const userData = await prisma.user.findUnique({ where: { id: req.userId } });

        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user: {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
            profileSetup: userData.profileSetup
        }});

    } catch (error) {
        console.error("Error in getUserInfo:", error);
        return res.status(500).json({ error: "AuthController :: getUserInfo" });
    }
}

export const logout = async (req , res , next) =>{
    res.cookie("jwt", "", { maxAge: 1 , secure: true , sameSite: "None" });
    res.status(200).json({ message: "Logged out successfully" });
}
