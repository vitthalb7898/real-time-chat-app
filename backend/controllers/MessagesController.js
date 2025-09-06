import {PrismaClient} from '@prisma/client';
import { mkdirSync, renameSync} from 'fs';

const prisma = new PrismaClient();

export const getMessages = async (req, res) => {
    try{
        const user1 = req.userId;
        const user2 = req.body.id;

        if(!user1 || !user2){
            return res.status(400).json({message : "User IDs are required"});
        }
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: user1, recipientId: user2 },
                    { senderId: user2, recipientId: user1 }
                ]
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        return res.status(200).json({messages});
    }catch(error){
        console.error("Error fetching messages:", error);
        return res.status(500).json({message : "Internal server error"});
    }
}

export const uploadFile = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({message : "No file uploaded"});
        }
        
        const date = Date.now();
        let fileDir = `uploads/files/${date}`;
        let fileName = `${fileDir}/${req.file.originalname}`;

        mkdirSync(fileDir, {recursive: true});
        renameSync(req.file.path, fileName);

        return res.status(200).json({message : "File uploaded successfully", filePath: fileName});

    }catch(error){
        console.error("Error uploading file:", error);
        return res.status(500).json({message : "Internal server error"});
    }
}

