import { ChatHeader } from "./components/chat-header/index";
import {MessageBar} from "./components/message-bar/index";
import {MessageContainer} from "./components/message-container/index";
 
 export const ChatContainer = () => {
 
  return (
          <div className="fixed top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex flex-col md:static md:flex-1">
            <ChatHeader></ChatHeader>
            <MessageContainer></MessageContainer>
            <MessageBar></MessageBar>
          </div>
         )
}
