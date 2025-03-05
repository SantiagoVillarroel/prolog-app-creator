

export function generateAndSave(projectManager) {
  return async (req, res) => {
    try {
      const dynamicHTML = req.body.html;
      const editRoute = req.body.editRoute;

      if (!dynamicHTML || !editRoute) {
        return res.status(400).send('Bad Request: Missing required data.');
      }

      // Generate export route and save the page info
      const exportRoute = await projectManager.savePageInfo(editRoute, dynamicHTML, req);

      console.log(`Export route generated: ${exportRoute}`);

      // Return the export route
      res.send(exportRoute);
    } catch (error) {
      console.error('Error while generating and saving export route:', error);
      res.status(500).send('Server Error');
    }
  };
}

export function accessExportedPage(projectManager) {
  return async (req, res) => {
    try {
      const route = req.params.route;
      const pageInfo = await projectManager.getPageInfo(route);

      if (!pageInfo) {
        return res.status(404).send('Not Found: No page info available for the given route.');
      }

      // Return the HTML content for the export page
      res.send(pageInfo.html);
    } catch (error) {
      console.error('Error while accessing exported page:', error);
      res.status(500).send('Server Error');
    }
  };
}

export function getExportedPageInfo(projectManager) {
  return async (req, res) => {
    try {
      const route = req.params.route;
      const pageInfo = await projectManager.getPageInfo(route);

      if (!pageInfo) {
        return res.status(404).send('Not Found: No page info available for the given route.');
      }

      // Return the HTML content for the export page
      res.send(pageInfo);
    } catch (error) {
      console.error('Error while accessing exported page:', error);
      res.status(500).send('Server Error');
    }
  };
}