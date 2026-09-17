import { createActionGroup, props, emptyProps } from '@ngrx/store';

export const ChatUiActions = createActionGroup({
  source: 'Chat UI',
  events: {
    'Initialize Chat UI': emptyProps(),
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
        date?: string;
      }[];
    }>(),
    'Delete Last Chat History': props<{
      chatHistory: {
        text: string;
        sendBy: 'User' | 'Bot';
        loading: boolean;
        llmType?: 'OLLAMA' | 'GROQ' | 'ERROR';
        date?: string;
      }[];
    }>(),

    'Replace Last Chat History': props<{
      chatHistory: {
        text: string;
        sendBy: 'User' | 'Bot';
        loading: boolean;
        llmType?: 'OLLAMA' | 'GROQ' | 'ERROR';
        date?: string;
      }[];
    }>(),

    'Toggle Scroll Button': props<{ showScrollButton: boolean }>(),

    'Set Voice Selected': props<{ voiceSelected: string }>(),
  },
});
