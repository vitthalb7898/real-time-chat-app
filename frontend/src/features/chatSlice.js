import { createSlice, nanoid } from "@reduxjs/toolkit"

const initialState = {
    selectedChatData: null,
    selectedChatType: null,
    directMessagesContacts: [],
    selectedChatMessages: [],
    isUploading: false,
    isDownloading: false,
    fileUploadProgress: 0,
    fileDownloadProgress: 0,
    channels:[]
}

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {

        selectChatData: (state, action) => {
            state.selectedChatData = action.payload;
        },
        selectChatType: (state, action) => {
            state.selectedChatType = action.payload;
        },
        closeChat: (state) => {
            state.selectedChatData = null;
            state.selectedChatType = null;
            state.selectedChatMessages = [];
        },
        selectChatMessages: (state, action) => {
            state.selectedChatMessages = action.payload;
        },
        addMessage: (state, action) => {

            if (!action.payload) return;

            const message = action.payload;
            state.selectedChatMessages.push(message);

        },
        setDirectMessagesContacts: (state, action) => {
            state.directMessagesContacts = action.payload;
        },
        setIsUploading: (state, action) => {
            state.isUploading = action.payload;
        },
        setIsDownloading: (state, action) => {
            state.isDownloading = action.payload;
        },
        setFileUploadProgress: (state, action) => {
            state.fileUploadProgress = action.payload;
        },
        setFileDownloadProgress: (state, action) => {
            state.fileDownloadProgress = action.payload;
        },
        setChannels: (state, action) => {
            state.channels = action.payload;
        },
        addChannel: (state, action) => {
            if (!action.payload) return;
            state.channels.push(action.payload);
        },
        addChannelInChannelList: (state, action) => {
            const channels = state.channels;
            const data = channels.find(channel => channel.id === action.payload.channelId);
            const index = channels.findIndex(channel => channel.id === action.payload.channelId);
            if(index!== -1 && index!== undefined){
                channels.splice(index, 1);
                channels.unshift(data);
            }
        },
        addContactsInDMList: (  state, action) => {
            const message = action.payload.message;
            const userId = action.payload.userId;
            console.log(userId);
            const fromId = message.senderId === userId
                ? message.recipientId
                : message.senderId;

            const fromData = message.senderId === userId
                ? message.recipient
                : message.sender;

            const dmContacts = state.directMessagesContacts;
            const data = dmContacts.find((contact) => contact.id === fromId);
            const index = dmContacts.findIndex((contact) => contact.id === fromId);

            if (index !== -1 && index !== undefined) {
                dmContacts.splice(index, 1);
                dmContacts.unshift(data);
            }else{
                dmContacts.unshift(fromData);
            }

            state.directMessagesContacts = dmContacts;
        }
    },
});

export const {
    selectChatData,
    selectChatType,
    closeChat,
    selectChatMessages,
    addMessage,
    setDirectMessagesContacts,
    setIsUploading,
    setIsDownloading,
    setFileUploadProgress,
    setFileDownloadProgress,
    setChannels,
    addChannel,
    addChannelInChannelList,
    addContactsInDMList
} = chatSlice.actions;

export default chatSlice.reducer;