// LinkedInCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you use React Router
import axios from 'axios';

const LinkedInCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This function runs once when the page loads
    const exchangeCodeForToken = async () => {
      try {
        // 1. Get the temporary code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          // 2. Send the code to your backend server
          const response = await axios.post('/api/linkedin/exchange-token', { code });
          
          const { accessToken } = response.data;

          // 3. Save the access token securely (e.g., in localStorage)
          localStorage.setItem('linkedin_access_token', accessToken);

          // 4. Redirect user to their dashboard or home page
          navigate('/dashboard'); 
        }
      } catch (error) {
        console.error('Failed to handle LinkedIn callback:', error);
        // Redirect to an error page or home
        navigate('/');
      }
    };

    exchangeCodeForToken();
  }, [navigate]);

  return <div>Loading... Please wait.</div>;
};

export default LinkedInCallback;