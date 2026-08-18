import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatUiState } from './chat-ui-reducer';

export const selectChatUiState = createFeatureSelector<ChatUiState>('chatUi');

export const selectChatHistory = createSelector(
  selectChatUiState,
  (s) => s.chatHistory
);
export const selectSearchTerm = createSelector(
  selectChatUiState,
  (s) => s.searchTerm
);

export const selectShowButton = createSelector(
  selectChatUiState,
  (s) => s.showButton
);
export const selectSelectedMessages = createSelector(
  selectChatUiState,
  (s) => s.selectedMessages
);
