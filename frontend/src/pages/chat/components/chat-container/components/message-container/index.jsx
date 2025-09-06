import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import moment from "moment";
import apiClient from "@/lib/api-client";
import { GET_ALL_MESSAGES_ROUTE } from "@/config/constants";
import { selectChatMessages } from "@/features/chatSlice";
import { HOST } from "@/config/constants";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { setIsDownloading } from "@/features/chatSlice";
import { setFileDownloadProgress } from "@/features/chatSlice";
import { GET_CHANNEL_MESSAGES_ROUTE } from "@/config/constants";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getcolor } from "@/lib/utils";
import { AvatarFallback } from "@radix-ui/react-avatar";

export const MessageContainer = () => {
  const scrollRef = useRef();
  const selectedChatData = useSelector((state) => state.chat.selectedChatData);
  const selectedChatType = useSelector((state) => state.chat.selectedChatType);
  const selectedChatMessages = useSelector((state) => state.chat.selectedChatMessages);
  const userInfo = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(GET_ALL_MESSAGES_ROUTE, { id: selectedChatData.id });
        if (response.status === 200 && response.data.messages) {
          dispatch(selectChatMessages(response.data.messages));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }

    }

    const getChannelMessages = async()=>{
      try {
        const response = await apiClient.get(`${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData.id}`);

        if(response.status === 200 && response.data.messages){
          dispatch(selectChatMessages(response.data.messages));
        }

      }
      catch(error){

      }
    }
    if (selectedChatData.id) {
      if (selectedChatType === "contact") {
        getMessages();
      }
      if(selectedChatType === "channel"){
        getChannelMessages();
      }
    }
  }, [selectedChatData, selectedChatType, dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|svg|ico|heic|heif|webp)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && <div className="text-center text-gray-500 my-2">
            {moment(message.timestamp).format("LL")}
          </div>}
          {
            selectedChatType === "contact" && renderDmMessages(message)
          }
          {
            selectedChatType === "channel" && renderChannelMessages(message)
          }
        </div>
      )
    })
  };

  const downloadFile = async (fileUrl) => {
    dispatch(setIsDownloading(true));
    dispatch(setFileDownloadProgress(0));
    const response = await apiClient.get(`${HOST}/${fileUrl}`, {
      responseType: 'blob',
      onDownloadProgress: (data) => {
        const progress = Math.round((data.loaded * 100) / data.total);
        dispatch(setFileDownloadProgress(progress));
      }

    });

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = urlBlob;
    link.setAttribute('download', fileUrl.split('/').pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    dispatch(setIsDownloading(false));
    dispatch(setFileDownloadProgress(0));
  }

  const renderDmMessages = (message) => (
    <div className={`${message.senderId === selectedChatData.id ? "text-left" : "text-right"}`}>
      {
        message.messageType === "text" && (
          <div className={`${message.senderId !== selectedChatData.id
            ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
            : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
            {message.content}
          </div>

        )
      }
      {
        message.messageType === "file" && (
          <div className={`${message.senderId !== selectedChatData.id
            ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
            : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
            {
              checkIfImage(message.fileUrl)
                ? <div className="cursor-pointer"
                  onClick={() => {
                    setShowImage(true);
                    setImageUrl(message.fileUrl);
                  }}
                >
                  <img src={`${HOST}/${message.fileUrl}`} alt="Uploaded" height={300} width={300} />
                </div>
                : <div className="flex items-center justify-center gap-4">
                  <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3"><MdFolderZip /></span>
                  <span>{message.fileUrl.split('/').pop()}</span>
                  <span className=" bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                    onClick={() => downloadFile(message.fileUrl)}><IoMdArrowRoundDown /></span>
                </div>
            }
          </div>
        )
      }
      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>

    </div>
  )

  const renderChannelMessages = (message) => (
    <div className={`mt-5 ${message.senderId !== userInfo.id ? "text-left" : "text-right"}`}>
      {
        message.messageType === "text" && (
          <div className={`${message.senderId === userInfo.id
            ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
            : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}>
            {message.content}

          </div>

        )
      }

      

      {
        message.messageType === "file" && (
          <div className={`${message.senderId === userInfo.id
            ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
            : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
            {
              checkIfImage(message.fileUrl)
                ? <div className="cursor-pointer"
                  onClick={() => {
                    setShowImage(true);
                    setImageUrl(message.fileUrl);
                  }}
                >
                  <img src={`${HOST}/${message.fileUrl}`} alt="Uploaded" height={300} width={300} />
                </div>
                : <div className="flex items-center justify-center gap-4">
                  <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3"><MdFolderZip /></span>
                  <span>{message.fileUrl.split('/').pop()}</span>
                  <span className=" bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                    onClick={() => downloadFile(message.fileUrl)}><IoMdArrowRoundDown /></span>
                </div>
            }
          </div>
          
        )
      }

      {
        message.senderId !== userInfo.id ? <div className="flex items-center justify-start gap-3">
          <Avatar className="h-8 w-8 rounded-full overflow-hidden">
            {message.sender.image && <AvatarImage
              src={`${HOST}/${message.sender.image}`}
              alt="profile"
              className="object-cover w-full h-full bg-black"
            >

            </AvatarImage>}
            <AvatarFallback className={`uppercase h-8 w-8 flex items-center justify-center text-lg border-[1px] rounded-full ${getcolor(message.sender.color)}`}>
              {message.sender.firstName ? message.sender.firstName.slice(0, 1) : message.sender.email.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
          <span className="text-xs text-white/60">{
            moment(message.timestamp).format("LT")
          }</span>
        </div> 
        : <div className="text-xs text-white/60 mt-1">{
          moment(message.timestamp).format("LT")
        }</div>
      }
     

    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef}></div>
      {
        showImage && (
          <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
            <div>
              <img src={`${HOST}/${imageUrl}`}
                className="h-[80vh] w-full bg-cover" />
            </div>
            <div className="flex gap-5 fixed top-0 mt-5">
              <button className=" bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={() => downloadFile(imageUrl)}>
                <IoMdArrowRoundDown /></button>
              <button className=" bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={() => {
                  setShowImage(false)
                  setImageUrl(null);
                }

                }><IoMdClose /></button>
            </div>
          </div>
        )
      }
    </div>
  )
}
