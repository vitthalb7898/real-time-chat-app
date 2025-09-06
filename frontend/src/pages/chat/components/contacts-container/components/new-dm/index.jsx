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
import { ScrollArea } from "@/components/ui/scroll-area"
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Lottie from "react-lottie"
import { animationDefaultOptions } from "@/lib/utils"
import { SEARCH_CONTACTS_ROUTE } from "@/config/constants";
import apiClient from "@/lib/api-client";
import { getcolor } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HOST } from "@/config/constants";
import { useDispatch } from "react-redux";
import { selectChatData } from "@/features/chatSlice";
import { selectChatType } from "@/features/chatSlice";


const NewDM = () => {
    const dispatch = useDispatch();
    const [openNewContactModal, setOpenNewContactModal] = useState(false);
    const [searchedContacts, setSearchedContacts] = useState([]);

    const searchContacts = async (searchTerm) => {

        try {
            if (searchTerm.length > 0) {
                const response = await apiClient.post(SEARCH_CONTACTS_ROUTE, { searchTerm });
                if (response.status === 200 && response.data.contacts) {
                    setSearchedContacts(response.data.contacts);
                }
            } else {
                setSearchedContacts([]);
            }

        } catch (error) {
            console.error("Error searching contacts:", error);
        }

    }

    const selectNewContact = (contact) => {
       setOpenNewContactModal(false);
       dispatch(selectChatData(contact));
       dispatch(selectChatType("contact"));
       setSearchedContacts([]);
    }

    return (

        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus
                            className="text-neutral-400 font-light text-opacity-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300"
                            onClick={() => setOpenNewContactModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent
                        className={`bg-[#1c1b1e] border-none text-white mb-2 p-3`}
                    >
                        <p>Select New Contact</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={openNewContactModal}
                onOpenChange={setOpenNewContactModal}>

                <DialogContent className={`bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col`}>
                    <DialogHeader>
                        <DialogTitle>Please select a Contact</DialogTitle>
                        <DialogDescription>
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder="Search for a contact..."
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                            onChange={e => searchContacts(e.target.value)}
                        />
                    </div>

                    {
                        searchContacts.length > 0 && (

                            <ScrollArea className={`h-[250px]`}>
                        <div className="flex flex-col gap-5">
                            {
                                searchedContacts.map((contact) => <div
                                    key={contact.id}
                                    className="flex gap-3 items-center cursor-pointer"
                                    onClick={() => selectNewContact(contact)}
                                    >
                                    <div className="w-12 h-12 relative">
                                        <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                            {contact.image ? <AvatarImage
                                                src={`${HOST}/${contact.image}`}
                                                alt="profile"
                                                className="object-cover w-full h-full bg-black rounded-full"
                                            >

                                            </AvatarImage>
                                                : <div className={`uppercase h-12 w-12 flex items-center justify-center text-lg border-[1px] rounded-full ${getcolor(contact.color)}`}>
                                                    {contact.firstName ? contact.firstName.slice(0, 1) : contact.email.slice(0, 1)}
                                                </div>}
                                        </Avatar>
                                    </div>
                                    <div className="flex flex-col">
                                        <span>

                                        {
                                            contact.firstName && contact.lastName ? (
                                                `${contact.firstName} ${contact.lastName}`
                                            ) : (
                                                contact.email
                                            )
                                        }
                                        </span>
                                        <span className={`text-xs`}>{contact.email}</span>
                                    </div>
                                </div>
                                )
                            }

                        </div>

                    </ScrollArea>

                        )
                    }
                    
                    {
                        searchedContacts.length <= 0 && (
                            <div className="flex-1 md:flex mt-5 md:mt-0 flex-col justify-center items-center duration-1000 transition-all">
                                <Lottie
                                    isClickToPauseDisabled={true}
                                    height={100}
                                    width={100}
                                    options={animationDefaultOptions}
                                ></Lottie>

                                <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center">
                                    <h3 className="poppins-medium">
                                        Search new
                                        <span className="text-purple-500"> Contact. </span>

                                    </h3>

                                </div>

                            </div>
                        )
                    }
                </DialogContent>
            </Dialog>

        </>
    )
}
export default NewDM;