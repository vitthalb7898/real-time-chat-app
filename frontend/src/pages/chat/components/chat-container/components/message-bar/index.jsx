import { useEffect, useState } from "react";
import { GrAttachment } from "react-icons/gr"
import { RiEmojiStickerLine } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/context/SocketContext";
import { UPLOAD_FILE_ROUTE } from "@/config/constants";
import apiClient from "@/lib/api-client";
import { useDispatch } from "react-redux";
import { setIsUploading } from "@/features/chatSlice";
import { setFileUploadProgress } from "@/features/chatSlice";



export const MessageBar = () => {
    const emojiRef = useRef();
    const fileInputRef = useRef();
    const [message, setMessage] = useState("");
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const selectedChatType = useSelector((state) => state.chat.selectedChatType);
    const selectedChatData = useSelector((state) => state.chat.selectedChatData);
    const userInfo = useSelector((state) => state.auth.user);
    const socket = useSocket();
    const dispatch = useDispatch();

    useEffect(() => {
        function handleClickOutside(event) {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setEmojiPickerOpen(false);
            }

        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [emojiRef])

    const handleAddEmoji = (emoji) => {
        setMessage((msg) => msg + emoji.emoji)

    }

    const handleSendMessage = async () => {
        if (selectedChatType === "contact") {
             socket.emit("sendMessage", {
                sender: userInfo.id,
                recipient: selectedChatData.id,
                content: message,
                messageType: "text",
                fileUrl: undefined,
            });
        } else if (selectedChatType === "channel") {
            socket.emit("send-channel-message", {
                sender: userInfo.id,
                channelId: selectedChatData.id,
                content: message,
                messageType: "text",
                fileUrl: undefined,
            });
        }

        setMessage("");

    }

    const handleAttachmentClick = () => {
        if(fileInputRef.current){

            fileInputRef.current.click();   
        }
    }

    const handleAttachmentChange = async (event) => {
        try{
            const file = event.target.files[0];
            if(file){
                const formData = new FormData();
                formData.append("file" ,file);
                dispatch(setIsUploading(true));
                dispatch(setFileUploadProgress(0));
                const response = await apiClient.post(UPLOAD_FILE_ROUTE , formData , {
                    onUploadProgress: (data)=>{
                        const progress = Math.round((data.loaded * 100) / data.total);
                        dispatch(setFileUploadProgress(progress));
                    }
                });
                if(response.status === 200 && response.data.filePath){
                    dispatch(setIsUploading(false));
                    if (selectedChatType === "contact") {
                        socket.emit("sendMessage", {
                           sender: userInfo.id,
                           recipient: selectedChatData.id,
                           content: undefined,
                           messageType: "file",
                           fileUrl: response.data.filePath,
                       });
                   }
                   else if (selectedChatType === "channel") {
                       socket.emit("send-channel-message", {
                           sender: userInfo.id,
                           channelId: selectedChatData.id,
                           content: undefined,
                           messageType: "file",
                           fileUrl: response.data.filePath,
                       });
                   }
                }
            }
        }catch(error){
            dispatch(setIsUploading(false));
            console.error("Error uploading file:", error);
        }
    }

    return (
        <div className="h-[10vh] bg-[#1c1d25] flex items-center justify-center px-8 mb-6 gap-6">
            <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
                <input
                    type="text"
                    className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none" placeholder="Enter Message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                    onClick={handleAttachmentClick}
                >
                    <GrAttachment className="text-2xl"></GrAttachment>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleAttachmentChange} />
                <div className="relative">
                    <button
                        className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                        onClick={() => setEmojiPickerOpen(true)}
                    >
                        <RiEmojiStickerLine className="text-2xl"></RiEmojiStickerLine>
                    </button>
                    <div className="absolute bottom-16 right-0" ref={emojiRef}>
                        <EmojiPicker
                            theme="dark"
                            open={emojiPickerOpen}
                            onEmojiClick={handleAddEmoji}
                            autoFocusSearch={false}
                        />
                    </div>
                </div>
            </div>
            <button
                className="bg-[#8417ff] rounded-md flex items-center justify-center p-5  focus:border-none hover:bg-[#741bda] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all"
                onClick={handleSendMessage}
            >
                <IoSend className="text-2xl"></IoSend>
            </button>
        </div>
    )
}
