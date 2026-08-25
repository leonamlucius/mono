import { createReducer, on } from '@ngrx/store';
import { ChatUiActions } from './chat-ui.actions';

export interface ChatUiState {
  chatHistory: {
    text: string;
    sendBy: 'User' | 'Bot';
    loading: boolean;
    llmType?: 'OLLAMA' | 'GROQ' | 'ERROR';
  }[];
  isInitialized: boolean;
  searchTerm: string;
  showButton: boolean;
  selectedMessages: any[];
  showSidebar: boolean;
  sideBarExit: boolean;
  showScrollButton?: boolean;
  voiceSelected: string;
}

export const initialChatUiState: ChatUiState = {
  chatHistory: [],
  isInitialized: false,
  searchTerm: '',
  showButton: false,
  selectedMessages: [],
  showSidebar: false,
  sideBarExit: false,
  showScrollButton: false,
  voiceSelected: '',
};

export const chatUiReducer = createReducer(
  initialChatUiState,
  on(ChatUiActions.setSearchTerm, (state, { searchTerm }) => ({
    ...state,
    searchTerm,
  })),

  on(ChatUiActions.clearSearchTerm, (state, { searchTerm }) => ({
    ...state,
    searchTerm: '',
  })),
  on(ChatUiActions.setSelectedMessage, (state, { selectedMessages }) => ({
    ...state,
    selectedMessages,
  })),
  on(ChatUiActions.deleteSelectedMessage, (state, { selectedMessages }) => ({
    ...state,
    selectedMessages: state.selectedMessages.filter(
      (msg, index) => !selectedMessages.includes(index)
    ),
  })),

  on(ChatUiActions.toggleFilterButton, (state, { showButton }) => ({
    ...state,
    showButton,
  })),
  on(ChatUiActions.setChatHistory, (state, { chatHistory }) => ({
    ...state,
    chatHistory: [...state.chatHistory, ...chatHistory],
  })),
  on(ChatUiActions.deleteLastChatHistory, (state) => ({
    ...state,
    chatHistory: state.chatHistory.slice(0, -1),
  })),

  on(ChatUiActions.replaceLastChatHistory, (state, { chatHistory }) => ({
    ...state,
    chatHistory: [...state.chatHistory.slice(0, -1), ...chatHistory],
  })),

  on(ChatUiActions.toggleScrollButton, (state, { showScrollButton }) => ({
    ...state,
    showScrollButton,
  })),

  on(ChatUiActions.setVoiceSelected, (state, { voiceSelected }) => ({
    ...state,
    voiceSelected,
  }))
);
