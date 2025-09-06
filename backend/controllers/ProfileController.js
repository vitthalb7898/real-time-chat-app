import { PrismaClient } from "@prisma/client";

import {renameSync , unlinkSync} from "fs"

const prisma = new PrismaClient();

export const updateProfile = async (req, res) => {
    const userId = req.userId;
    const { firstName, lastName, color } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        

       const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: firstName,
                lastName: lastName,
                color: color,
                profileSetup: true,
            },
        });

       return res.status(200).json({user:{
           id: updatedUser.id,
           email: updatedUser.email,
           firstName: updatedUser.firstName,
           lastName: updatedUser.lastName,
           color: updatedUser.color,
           image: updatedUser.image,
           profileSetup: updatedUser.profileSetup,
       }});

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addProfileImage = async (req, res) => {


    try {

    const userId = req.userId;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const date = Date.now();
    let fileName = "uploads/profiles/"+ date + file.originalname;

    renameSync(file.path , fileName);

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

       const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                image: fileName,
            },
        });

        return res.status(200).json({ image: updatedUser.image });
    } catch (error) {
        console.error("Error adding profile image:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const removeProfileImage = async (req, res) => {
     
    try {
        const userId = req.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if(user.image){
            unlinkSync(user.image);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                image: null,
            },
        });

        return res.status(200).json({ image: updatedUser.image });
    } catch (error) {
        console.error("Error removing profile image:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};