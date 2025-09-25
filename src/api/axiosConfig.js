import axios from 'axios';


const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';


const axiosInstance = axios.create({
baseURL: API_BASE,
headers: {
'Content-Type': 'application/json',
},
});


export default axiosInstance;