import { Server as SocketIoServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const setupSocket = (server) =>{

    const io = new SocketIoServer(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    const userSocketMap = new Map();

    const disconnect = (socket) =>{
        console.log(`Client Disconnected: ${socket.id}`);
        for(const [userId, socketId] of userSocketMap.entries()){
            if(socketId === socket.id){
                userSocketMap.delete(userId);
                console.log(`User Disconnected: ${userId}`);
                break;
            }
        }
    };

    const sendMessage = async(message) =>{
       const senderSocketId = userSocketMap.get(message.sender);
            const recipientSocketId = userSocketMap.get(message.recipient);

            
            const createdMessage = await prisma.message.create({
                data: {
                    senderId: message.sender,
                    recipientId: message.recipient,
                    content: message.content,
                    fileUrl: message.fileUrl,
                    messageType: message.messageType,
                    
                }
            });

            
            const messageData = await prisma.message.findUnique({
                where: { id: createdMessage.id },
                include: {
                    sender: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            image: true,
                            color: true,
                        }
                    },
                    recipient: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            image: true,
                            color: true
                        }
                    }
                }
            });

        if(recipientSocketId){
            io.to(recipientSocketId).emit("receiveMessage", messageData);
        }
        if(senderSocketId){
            io.to(senderSocketId).emit("receiveMessage", messageData);
        }

    }

    const sendChannelMessage = async(message) =>{
        const {channelId , sender , content , messageType , fileUrl} = message;
        
        const createdMessage = await prisma.message.create({
                data: {
                    senderId: sender,
                    recipientId: null,
                    content: content,
                    fileUrl: fileUrl,
                    messageType: messageType,
                    channelId: channelId,
                    timestamp: new Date(),
                },
            });

            const messageData = await prisma.message.findUnique({
                where: { id: createdMessage.id },
                include:{
                    sender:{
                        select:{
                            id:true,
                            email:true,
                            firstName:true,
                            lastName:true,
                            image:true,
                            color:true
                        }
                    },
        
                }
            });
            

            await prisma.channel.update({
                where:{id : channelId},
                data:{
                    messages:{
                        connect : {id : createdMessage.id}
                    }
                },
            });

            const channel = await prisma.channel.findUnique({
                where : {id : channelId},
                include:{
                    members:{
                        select:{
                            id:true,
                        }
                    }
                }
            })

            const finalData = {...messageData , channel : {id : channel.id , name : channel.name}};

            if(channel && channel.members){
                channel.members.forEach((member) => {
                    const memberSocketId = userSocketMap.get(member.id.toString());
                    if(memberSocketId){
                        io.to(memberSocketId).emit("receive-channel-message", finalData);
                    }
                    
                });
                const adminSocketId = userSocketMap.get(channel.adminId.toString());
                    if(adminSocketId){
                        io.to(adminSocketId).emit("receive-channel-message", finalData);
                    }
            }


            
        }

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`User connected: ${userId}`);   
        }
        else{
            console.log("User connected without ID");
        }

        socket.on("sendMessage", sendMessage)
        socket.on("send-channel-message", sendChannelMessage);

        socket.on("disconnect", () => disconnect(socket));
    });
}


export default setupSocket;