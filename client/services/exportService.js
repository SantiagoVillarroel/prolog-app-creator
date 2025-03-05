// import axios from 'axios';
import { URL_SERVER } from "../config.js";

// Save and generate an exported project
export const generateExportedPage = async (editRoute, html, code, predicatesInfo, predicateQueriesIds) => {
    try {
        const response = await axios.post(`${URL_SERVER}generateAndSave`, {
            editRoute,
            html,
            code,
            predicatesInfo,
            predicateQueriesIds
        });
        return response.data;  // Export route ID
    } catch (error) {
        console.error('Error generating exported page:', error);
        throw error;
    }
};

// Get an existing export page
export const getExportPage = async (exportRoute) => {
    try {
        const response = await axios.get(`${URL_SERVER}export/${exportRoute}`);
        return response.data;  // Returns the HTML content of the exported page
    } catch (error) {
        console.error('Error getting export page:', error);
        throw error;
    }
};

export const getPageInfo = async (exportRoute) => {
    try {
        const response = await axios.get(`${URL_SERVER}pageInfo/${exportRoute}`);
        return response.data;  // Returns the HTML content of the exported page
    } catch (error) {
        console.error('Error getting export page:', error);
        throw error;
    }
};