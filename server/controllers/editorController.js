import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateNewEditRoute(projectManager) {
    return async (req, res) => {
        try {
            const newRoute = await projectManager.generateNewEditRoute();
            res.redirect(`/edit/${newRoute}`);
        } catch (error) {
            console.error("Error generating new edit route:", error);
            res.status(500).send('Server Error');
        }
    };
}

export function accessEditPage(projectManager) {
    return async (req, res) => {
        try {
            const editPageInfo = await projectManager.getEditPageInfo(req.params.route);
            if (!editPageInfo) {
                return res.status(404).send('Not Found');
            }
            if (!editPageInfo.html) {
                res.sendFile(path.join(__dirname, '../../client', '/html/index.html'));
            } else {
                res.send(editPageInfo.html);
            }
        } catch (error) {
            res.status(500).send('Server Error');
        }
    };
}

export function getEditPageInfo(projectManager) {
    return async (req, res) => {
        try {
            const editPageInfo = await projectManager.getEditPageInfo(req.params.route);
            if (!editPageInfo) {
                return res.status(404).send('Not Found');
            }
            if (!editPageInfo) {
                res.status(404).send('Error: Edit project not found');
            } else {
                res.send(editPageInfo);
            }
        } catch (error) {
            res.status(500).send('Server Error');
        }
    };
}

export function saveEditPage(projectManager) {
    return async (req, res) => {
        try {
            const dynamicHTML = req.body.html;
            const editRoute = req.body.editRoute;
            const globalState = req.body.globalState

            if (!dynamicHTML) {
                return res.status(400).send('Bad Request: HTML content is missing.');
            }

            await projectManager.saveEditPageInfo(editRoute, dynamicHTML, globalState);
            res.send('Success');
        } catch (error) {
            res.status(500).send('Server Error');
        }
    };
}