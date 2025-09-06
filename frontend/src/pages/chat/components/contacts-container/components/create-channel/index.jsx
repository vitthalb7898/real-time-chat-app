
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FaPlus } from "react-icons/fa";
import { useEffect, useState} from "react";
import { Input } from "@/components/ui/input";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTE } from "@/config/constants";
import apiClient from "@/lib/api-client";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";
import { addChannel } from "@/features/chatSlice";


const CreateChannel = () => {
    const dispatch = useDispatch();
   
    const [newChannelModal, setNewChannelModal] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts , setSelectedContacts] = useState([]);
    const [channelName , setChannelName] = useState("");
    
    useEffect(() => {
        const getData = async ()=>{
            const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE);
            if(response.status === 200 && response.data.contacts){
               
                setAllContacts(response.data.contacts);
            }
        }
        getData();
    }, []);


   

   const createChannel = async() => {
    try{
        if(channelName.length > 0 && selectedContacts.length > 0){
            const response = await apiClient.post(CREATE_CHANNEL_ROUTE, {
                name : channelName,
                members:selectedContacts.map((contact) =>contact.value)
            });
            if(response.status === 201 && response.data.channel){
                setChannelName("");
                setSelectedContacts([]);
                setNewChannelModal(false);
                dispatch(addChannel(response.data.channel));
            }
        }

    }catch(error){
        console.error("Error creating channel:", error);
    }

   }

    return (

        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus
                            className="text-neutral-400 font-light text-opacity-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300"
                            onClick={() => setNewChannelModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent
                        className={`bg-[#1c1b1e] border-none text-white mb-2 p-3`}
                    >
                        <p>Create New channel</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={newChannelModal}
                onOpenChange={setNewChannelModal}>

                <DialogContent className={`bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col`}>
                    <DialogHeader>
                        <DialogTitle>Please fill up the details for new channel</DialogTitle>
                        <DialogDescription>
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder="Channel Name"
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                            onChange={e => setChannelName(e.target.value)}
                            value={channelName}
                        />
                    </div>
                    <div >
                        <MultipleSelector
                        className="rounded -lg bg-[#2c2e3b] border-none py-2 text-white "
                        defaultOptions={allContacts}
                        placeholder="Select Contacts"
                        value={selectedContacts}
                        onChange={setSelectedContacts}
                        emptyIndicator={<p className="text-center text-lg leading-10 text-gray-600">No result found</p>}
                        >

                        </MultipleSelector>
                        
                    </div>
                    <Button className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
                        onClick={createChannel}
                    >Create Channel</Button>
                </DialogContent>
            </Dialog>

        </>
    )
}
export default CreateChannel;