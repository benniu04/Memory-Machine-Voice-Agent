import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const processSentiment = async (text) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/process_text`, {
      text: text,
    }, {
      timeout: 10000, // 10 second timeout
    });

    return response.data;
  } catch (error) {
    console.error('Error processing sentiment:', error);
    
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.detail || 'Failed to process sentiment');
    } else if (error.request) {
      // Request made but no response
      throw new Error('Backend server is not responding. Make sure it is running.');
    } else {
      // Something else happened
      throw new Error('Failed to send request to backend');
    }
  }
};

