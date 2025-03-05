import express from 'express';
import {
    generateNewEditRoute,
    accessEditPage,
    saveEditPage,
    getEditPageInfo
} from '../controllers/editorController.js';

const router = express.Router();

export default function editorRoutes(projectManager) {

    // Generate new editor view route
    router.get('/edit', generateNewEditRoute(projectManager));

    // Access a project in editor view
    router.get('/edit/:route', accessEditPage(projectManager));

    router.get('/editPageInfo/:route', getEditPageInfo(projectManager));

    // Save a project in editor view
    router.post('/saveEditPage', saveEditPage(projectManager));

    return router;

}