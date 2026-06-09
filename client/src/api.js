import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Automatic Security Interceptor: Attaches token to every outgoing request
API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('wecare_user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- Auth Endpoints ---
export const registerUser = async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (userData) => {
    const response = await API.post('/auth/login', userData);
    return response.data;
};

// --- Task Endpoints ---
export const getTasks = async () => {
    const response = await API.get('/tasks');
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await API.post('/tasks', taskData);
    return response.data;
};

export const updateTask = async (id, updatedFields) => {
    const response = await API.put(`/tasks/${id}`, updatedFields);
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await API.delete(`/tasks/${id}`);
    return response.data;
};
