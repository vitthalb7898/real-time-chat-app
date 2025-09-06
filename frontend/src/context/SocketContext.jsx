import { HOST } from "@/config/constants";
import { createContext, useContext, useEffect, useRef ,useState} from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { addMessage } from "@/features/chatSlice";
import { store } from "@/app/store";
import { addChannelInChannelList } from "@/features/chatSlice";
import { addContactsInDMList } from "@/features/chatSlice";


const SocketContext = createContext(null);


export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const socket = useRef();
    const userInfo = useSelector((state) => state.auth.user);
    const userId = userInfo ? userInfo.id : null;
    const [socketInstance , setSocketInstance] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (userInfo) {
            socket.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id }
            })
            socket.current.on("connect", () => {
                console.log('Connected to socket server');
                setSocketInstance(socket.current);
            });


            const handleReceivedMessage = (message) => {

                const currentState = store.getState();
                const selectedChatData = currentState.chat.selectedChatData;
                const selectedChatType = currentState.chat.selectedChatType;

                

                if (selectedChatType !== null && (selectedChatData.id === message.senderId || selectedChatData.id === message.recipientId)) {
                    dispatch(addMessage(message));
                }

                dispatch(addContactsInDMList({message , userId}));
            };

            const handleReceivedChannelMessage = (message) => {

                const currentState = store.getState();
                const selectedChatData = currentState.chat.selectedChatData;
                const selectedChatType = currentState.chat.selectedChatType;

                if (selectedChatType !== null && (selectedChatData.id === message.channelId)) {
                    dispatch(addMessage(message));
                }
                dispatch(addChannelInChannelList(message));
            };

            socket.current.on("receiveMessage", handleReceivedMessage);
            socket.current.on("receive-channel-message", handleReceivedChannelMessage);
            setSocketInstance(socket.current);

            return (() => {
                socket.current.disconnect();
                setSocketInstance(null);
            })
        }

    }, [userInfo , dispatch]);

    return (
        <SocketContext.Provider value={socketInstance}>
            {children}
        </SocketContext.Provider>
    )
};
