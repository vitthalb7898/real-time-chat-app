import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {ContactsContainer} from "./components/contacts-container";
import {ChatContainer} from "./components/chat-container";
import {EmptyChatContainer} from "./components/empty-chat-container";


const Chat = () => {
     const userInfo = useSelector((state) => state.auth.user);
     const selectedChatType = useSelector((state) => state.chat.selectedChatType);
     const selectedChatData = useSelector((state) => state.chat.selectedChatData);
     const isUploading = useSelector((state) => state.chat.isUploading);
     const isDownloading = useSelector((state) => state.chat.isDownloading);
     const fileUploadProgress = useSelector((state) => state.chat.fileUploadProgress);
     const fileDownloadProgress = useSelector((state) => state.chat.fileDownloadProgress);

     const navigate = useNavigate();

     useEffect(() => {
          if (!userInfo.profileSetup) {
               toast('Please complete your profile setup');
               navigate("/profile");
          }
     }, [userInfo, navigate]);

  return (<div className="flex h-[100vh] text-white overflow-hidden">
     {
          isUploading && (
               <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
                   <h5 className="text-5xl animate-pulse">Uploading File</h5>
                   {fileUploadProgress}%
               </div>

          )
     }
     {
          isDownloading && (
               <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
                   <h5 className="text-5xl animate-pulse">Downloading File</h5>
                   {fileDownloadProgress}%
               </div>

          )
     }
       <ContactsContainer></ContactsContainer>
       {
          selectedChatType===null && selectedChatData===null ? (
               <EmptyChatContainer></EmptyChatContainer>
          ) : (
               <ChatContainer></ChatContainer>
          )}
  </div>
     )
}
export default Chat;