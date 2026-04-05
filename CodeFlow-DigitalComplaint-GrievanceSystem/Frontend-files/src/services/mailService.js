import api from './api';

export const mailService = {
  // Get inbox for logged-in user
  getInbox: async () => {
    try {
      const response = await api.get('/messages/inbox');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching inbox:', error);
      return [];
    }
  },

  // Get sent messages for logged-in user
  getSentMessages: async () => {
    try {
      const response = await api.get('/messages/sent');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sent messages:', error);
      return [];
    }
  },

  // Send a new message
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/messages', messageData);
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    try {
      const response = await api.put(`/messages/${messageId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
};

export default mailService;