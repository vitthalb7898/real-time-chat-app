import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { selectChatType, selectChatData, selectChatMessages } from "@/features/chatSlice";
import { Avatar } from "@radix-ui/react-avatar";
import { getcolor } from "@/lib/utils";
import { AvatarImage } from "@/components/ui/avatar";
import { HOST } from "@/config/constants";


const ContactList = ({ contacts, isChannel = false }) => {

    const selectedChatData = useSelector((state) => state.chat.selectedChatData);
    const selectedChatType = useSelector((state) => state.chat.selectedChatType);
    const dispatch = useDispatch();

    const handleClick = (contact) => {
        if (isChannel) {
            dispatch(selectChatType("channel"));

        } else {
            dispatch(selectChatType("contact"));
        }
        dispatch(selectChatData(contact));
        if (selectedChatData && selectedChatData.id !== contact.id) {
            dispatch(selectChatMessages([]));
        }
    }

    return (
        <div className="mt-5">

            {
                contacts.map((contact) => (
                    <div key={contact.id} className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${selectedChatData && selectedChatData.id === contact.id
                        ? "bg-[#8417ff]/50 hover:bg-[#8417ff]/50"
                        : "hover:bg-[#f1f1f111]"}`}
                        onClick={() => handleClick(contact)}>
                        <div className="flex gap-5 items-center justify-start text-neutral-300">
                            {
                                !isChannel ? (
                                    <div className="flex gap-3 items-center justify-center">
                                        <div className="w-12 h-12 relative">
                                            <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                                                {contact.image ? <AvatarImage
                                                    src={`${HOST}/${contact.image}`}
                                                    alt="profile"
                                                    className="object-cover w-full h-full rounded-full bg-black"
                                                >

                                                </AvatarImage>
                                                    : <div className={` ${selectedChatData && selectedChatData.id === contact.id 
                                                        ? "border-white/50 bg-[#ffffff22]" 
                                                        : getcolor(contact.color)}
                                                    uppercase h-12 w-12 flex items-center justify-center text-lg border-[1px] rounded-full `}>
                                                        {contact.firstName ? contact.firstName.slice(0, 1) : contact.email.slice(0, 1)}
                                                    </div>}
                                            </Avatar>
                                        </div>
                                        <div>
                                            {
                                                contact.firstName && contact.lastName ? (
                                                    `${contact.firstName} ${contact.lastName}`
                                                ) : (
                                                    `${contact.email}`
                                                )
                                            }
                                        </div>
                                    </div>
                                ):(
                                    <><div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full text-xl">#</div><span>{`${contact.name}`}</span></>
                                )
                            }

                        </div>

                    </div>
                ))
            }
        </div>
    )
}
export default ContactList;