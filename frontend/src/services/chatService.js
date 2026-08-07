import axios from 'axios';

export const sendChatMessage = async ({ message, history, pageContext, signal }) => {
  const response = await axios.post('/api/chat/message', { message, history, pageContext }, { signal });
  return response.data;
};
