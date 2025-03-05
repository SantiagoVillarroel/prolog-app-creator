// import axios from 'axios';
import { URL_SERVER } from "../../config.js";

// Generate a new editor route
export const generateNewEditorRoute = async () => {
    try {
        const response = await axios.get(`${URL_SERVER}edit`);
        return response.data;  // The route ID or redirection URL
    } catch (error) {
        console.error('Error generating new editor route:', error);
        throw error;
    }
};

// Get an existing editor page
export const getEditorPage = async (routeId) => {
    try {
        const response = await axios.get(`${URL_SERVER}edit/${routeId}`);
        return response.data;  // Returns the HTML content of the page
    } catch (error) {
        console.error('Error getting editor page:', error);
        throw error;
    }
};

export const getEditorPageInfo = async (routeId) => {
    try {
        const response = await axios.get(`${URL_SERVER}editPageInfo/${routeId}`);
        return response.data;  // Returns the HTML content of the page
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn('Project not found for the given ID:', routeId);
            return null;
        } else {
            console.error('Error getting editor page info:', error);
            throw error;
        }
    }
};

// Save the editor page
export const saveEditorPage = async (editRoute, html, globalState) => {
    try {
        const response = await axios.post(`${URL_SERVER}saveEditPage`, {
            editRoute,
            html,
            globalState
        });
        return response.data;  // Confirmation message
    } catch (error) {
        console.error('Error saving editor page:', error);
        throw error;
    }
};
