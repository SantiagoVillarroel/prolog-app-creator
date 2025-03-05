import express from 'express';
import {
    generateAndSave,
    accessExportedPage,
    getExportedPageInfo
} from '../controllers/exportController.js';

const router = express.Router();

export default function exportRoutes(projectManager) {

    router.post('/generateAndSave', generateAndSave(projectManager));
    router.get('/export/:route', accessExportedPage(projectManager));
    router.get('/pageInfo/:route', getExportedPageInfo(projectManager));

    return router
}