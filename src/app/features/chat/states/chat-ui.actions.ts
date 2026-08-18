import { createActionGroup, props } from '@ngrx/store';

export const ChatUiActions = createActionGroup({
  source: 'Chat UI',
  events: {
    'Set Search Term': props<{ searchTerm: string }>(),
    'Clear Search Term': props<{ searchTerm: string }>(),
    'Set Selected Message': props<{ selectedMessages: any }>(),
    'Delete Selected Message': props<{ selectedMessages: any }>(),
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
