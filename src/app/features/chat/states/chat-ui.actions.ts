import { createActionGroup, props } from '@ngrx/store';

export const ChatUiActions = createActionGroup({
  source: 'Chat UI',
  events: {
    'Set Search Term': props<{ searchTerm: string }>(),
    'Set Sidebar Visible': props<{ showSidebar: boolean }>(),
    'Set Sidebar Exit': props<{ sidebarExit: boolean }>(),
    'Set Selected Message': props<{ selectedMessages: any }>(),
    'Set Initialized': props<{ isInitialized: boolean }>(),
    'Toggle Filter Button': props<{ showButton: boolean }>(),
    'Set Chat History': props<{
      chatHistory: {
        text: string;
        sendBy: 'User' | 'Bot';
        loading: boolean;
        llmType?: 'OLLAMA' | 'GROQ' | 'ERROR';
      }[];
    }>(),
    'Delete Last Chat History': props<{
      chatHistory: {
        text: string;
        sendBy: 'User' | 'Bot';
        loading: boolean;
        llmType?: 'OLLAMA' | 'GROQ' | 'ERROR';
      }[];
    }>(),
  },
});
