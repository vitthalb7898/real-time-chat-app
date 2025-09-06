import { RiCloseFill } from "react-icons/ri"
import { useSelector, useDispatch } from "react-redux"
import { closeChat } from "@/features/chatSlice"
import { HOST } from "@/config/constants"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { getcolor } from "@/lib/utils"


export const ChatHeader = () => {

    const dispatch = useDispatch();

    const handleCloseChat = () => {
        dispatch(closeChat());
    }

    const selectedChatData = useSelector((state) => state.chat.selectedChatData);
    const selectedChatType = useSelector((state) => state.chat.selectedChatType);



    return (
        <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20 ">
            <div className="flex gap-5 items-center w-full justify-between">
                <div className="flex gap-3 items-center justify-center">
                    <div className="w-12 h-12 relative">
                        {
                            selectedChatType === "contact"
                                ? <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                    {selectedChatData.image ? <AvatarImage
                                        src={`${HOST}/${selectedChatData.image}`}
                                        alt="profile"
                                        className="object-cover w-full h-full bg-black"
                                    >

                                    </AvatarImage>
                                        : <div className={`uppercase h-12 w-12 flex items-center justify-center text-lg border-[1px] rounded-full ${getcolor(selectedChatData.color)}`}>
                                            {selectedChatData.firstName ? selectedChatData.firstName.slice(0, 1) : selectedChatData.email.slice(0, 1)}
                                        </div>}
                                  </Avatar> 
                                : <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">#</div>

                        }

                    </div>
                    {
                        selectedChatType === "channel" && (
                             <div>
                                <span>
                                    {selectedChatData.name}
                                </span>

                            </div>

                        )
                    }
                    {
                        selectedChatType === "contact" && (
                            <div>
                                <span>

                                    {
                                        selectedChatData.firstName && selectedChatData.lastName ? (
                                            `${selectedChatData.firstName} ${selectedChatData.lastName}`
                                        ) : (
                                            selectedChatData.email
                                        )
                                    }
                                </span>

                            </div>

                        )
                    }

                </div>
                <div className="flex items-center justify-center gap-5">
                    <button
                        className="text-neutral-500  focus:outline-none focus:text-white duration-300 transition-all"
                        onClick={handleCloseChat}
                    >
                        <RiCloseFill className="text-3xl"></RiCloseFill>
                    </button>
                </div>
            </div>
        </div>
    )
}
