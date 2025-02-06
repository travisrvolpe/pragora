import axios from "axios";

const API_BASE_URL = "http://localhost:8000/auth";
/*
* Create .env File in the Front End:
* REACT_APP_API_URL=http://localhost:8000/auth
* Use the Environment Variable in auth.js:
* const API_URL = process.env.REACT_APP_API_URL;
* */

/*export const loginUser = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, formData);
    const { access_token, user } = response.data;

    // Store the token in localStorage for subsequent authenticated requests
    localStorage.setItem('token', access_token);

    return user; // Return user details for UI updates or navigation
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};*/

export const loginUser = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, formData);
        const { access_token, user } = response.data;

        if (access_token) {
            localStorage.setItem('token', access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        }

        return user;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};


export const registerUser = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, formData);
    const { data } = response.data;

    // Store the token in localStorage for immediate login post-registration
    localStorage.setItem('token', data.access_token);

    return data.username; // Return username for confirmation or navigation
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserDetails = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await axios.get(`${API_BASE_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data; // Return user details
  } catch (error) {
    console.error('Fetching user details failed:', error.response?.data || error.message);
    throw error;
  }
};
