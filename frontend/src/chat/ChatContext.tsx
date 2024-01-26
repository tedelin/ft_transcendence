import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { Channel } from './types/channel';

interface ChatState {
  active: 'channels' | 'chat' | 'friends';
  channelTo: null | Channel;
  channels: Channel[];
  searchChannels: Channel[];
  sideBar: boolean;
}

type Action =
  | { type: 'fetchChannels'; channels: Channel[] }
  | { type: 'searchChannels'; channels: Channel[] }
  | { type: 'chat' }
  | { type: 'channel' }
  | { type: 'setChannel'; channelTo: Channel }
  | { type: 'toggleSideBar' }
  | { type: 'friends' };

interface ChatContextProps {
  children: ReactNode;
}


const initialChat: ChatState = {
	active: 'channels',
	channelTo: null,
	channels: [],
	searchChannels: [],
    sideBar: true,
};
  

export const ChatContext = createContext<ChatState | null>(null);
export const ChatDispatchContext = createContext<React.Dispatch<Action> | null>(null);

export function ChatProvider({ children }: ChatContextProps) {
  const [chat, dispatch] = useReducer(
    chatReducer,
    initialChat
  );

  return (
    <ChatContext.Provider value={chat}>
      <ChatDispatchContext.Provider value={dispatch}>
        {children}
      </ChatDispatchContext.Provider>
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export function useChatDispatch() {
  const dispatch = useContext(ChatDispatchContext);
  if (!dispatch) {
    throw new Error('useChatDispatch must be used within a ChatProvider');
  }
  return dispatch;
}

function chatReducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case 'toggleSideBar': {
        return {
            ...state,
            sideBar: !state.sideBar,
        };
    }
    case 'fetchChannels': {
      return {
        ...state,
        channels: action.channels,
      };
    }
    case 'searchChannels': {
      return {
        ...state,
        searchChannels: action.channels,
      };
    }
    case 'chat': {
      return {
        ...state,
        channelTo: null,
        active: 'chat',
      };
    }
    case 'channel': {
      return {
        ...state,
        channelTo: null,
        active: 'channels',
      };
    }
    case 'setChannel': {
      return {
        ...state,
        channelTo: action.channelTo,
      };
    }
    case 'friends': {
      return {
        ...state,
        channelTo: null,
        active: 'friends',
      };
    }
    default: {
      throw new Error('Unknown action');
    }
  }
}
