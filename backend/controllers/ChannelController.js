import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createChannel = async (req , res, next) =>{
    try{
        const {name , members } = req.body;
        if(!name || !members || members.length === 0){
            return res.status(400).json({message : "Channel name and members are required"});
        }

        const userId = req.userId;
        
        const admin = await prisma.user.findUnique({
            where : {id : userId},
            select:{
                id : true,
                email:true,
                firstName:true,
                lastName:true,
                image:true,
                color:true,
            }
        });

        if(!admin){
            return res.status(404).json({message : "User not found"});
        }

        const validMembers = await prisma.user.findMany({
            where : {
                id : {
                    in : members
                }
            },
            select:{
                id : true,
                email:true,
                firstName:true,
                lastName:true,
                image:true,
                color:true,
            }
        });

        if(validMembers.length !== members.length){
            return res.status(400).json({message : "Some members are invalid"});
        }

        const channel = await prisma.channel.create({
            data : {
                name,
                adminId : userId,
                members : {
                    connect : [
                        ...validMembers.map((member) => ({id : member.id})),
                    ]
                    },
                },
               include: {
                members: {
                    select: {
                        id: true,
                        
                    }
                }
            }
        });

        res.status(201).json({channel});

    }catch(error){
     console.log(error);
        res.status(500).json({message : "Error creating channel"});   
    }

}


export const getUserChannels = async (req , res , next) =>{
    try{
        const userId = req.userId;

        const channels = await prisma.channel.findMany({
            where :{
                OR : [
                    {adminId : userId},
                    {members : {
                        some : {
                            id : userId
                        }}}
                    ]
                },
            orderBy:{
                updatedAt : 'desc'
            },
            include: {
                members:{
                    select: {
                        id:true,
                    }
                },
                
            },
            
        });

        res.status(200).json({channels});

    }catch(error){
        res.status(500).json({message : "Error fetching channels"});
    }
}

export const getChannelMessages = async (req , res , next) =>{
    try{
        const {channelId} = req.params;
        const userId = req.userId;

        const channel = await prisma.channel.findUnique({
            where : {id : channelId},
            include:{
                members:{
                    select:{
                        id:true,
                    },
                },
                admin:{
                    select:{
                        id:true,
                        firstName:true,
                        lastName:true,
                        email:true,
                        image:true,
                        color:true,
                    }
                },
                messages:true,
                
            }
        });

        if(!channel){
            return res.status(404).json({message : "Channel not found"});
        }

        const messages = await prisma.message.findMany({
            where : {channelId : channelId},
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

            },});

        return res.status(200).json({messages});

    }catch(error){
        res.status(500).json({message : "Error fetching channel messages"});
    }
}