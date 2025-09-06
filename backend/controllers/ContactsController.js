import { $Enums, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const searchContacts = async (req, res) => {


    try {
        const userId = req.userId;
        console.log(userId);
        const { searchTerm } = req.body;
        if (searchTerm === undefined || searchTerm === null) {
            return res.status(400).json({ message: "Search term is required" });
        }

        const contacts = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: userId } },
                    {
                        OR: [
                            { firstName: { contains: searchTerm.trim() } },
                            { lastName: { contains: searchTerm.trim() } },
                            { email: { contains: searchTerm.trim() } },
                        ]
                    },
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                image: true,
                color: true,

            }
        });
        res.status(200).json({ contacts });
    } catch (error) {
        res.status(500).json({ message: "Error searching contacts" });
    }
};

export const getContactsForDMList = async (req, res) => {
    try {

        let userId = req.userId;

        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { recipientId: userId }],
            },
            orderBy: { timestamp: "desc" },
            include: {
                sender: true,
                recipient: true,
            },
        });

        const contactsMap = new Map();

        for (const msg of messages) {

            if (!msg.sender || !msg.recipient) {
                continue;
            }
            const otherUser = msg.senderId === userId ? msg.recipient : msg.sender;

             if (!otherUser || !otherUser.id) {
                continue;
            }
            
            if (!contactsMap.has(otherUser.id)) {
                contactsMap.set(otherUser.id, {
                    id: otherUser.id,
                    lastMessageTime: msg.timestamp,
                    email: otherUser.email,
                    firstName: otherUser.firstName,
                    lastName: otherUser.lastName,
                    image: otherUser.image,
                    color: otherUser.color,
                });
            }
        }

        const contacts = Array.from(contactsMap.values()).sort(
            (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
        );



        res.status(200).json({ contacts });
    } catch (error) {
        console.error("Error fetching contacts for DM list:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllContacts = async (req, res) => {


    try {
        const userId = req.userId;

        const users = await prisma.user.findMany({
            where: {
                id: { not: userId },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,

            }
        });

        const contacts = users.map((user)=>{
            return {
                label : user.firstName?`${user.firstName} ${user.lastName}`:user.email,
                value: user.id

            }
        })
        res.status(200).json({ contacts });
    } catch (error) {
        res.status(500).json({ message: "Error searching contacts" });
    }
};