import { MongoClient, ServerApiVersion } from 'mongodb';
import { randomBytes } from 'crypto';
import { DATABASE, DB_URI as uri } from '../config.js';

export default class RouteManager {
    constructor() {
        // this.client = new MongoClient(url);
        this.database = null;
        this.colProjectsEdit = null;
        this.colProjectsExport = null;

        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
    }

    // Create a MongoClient with a MongoClientOptions object to set the Stable API version

    async connectToDatabase() {
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await this.client.connect();

            // Choose a specific database
            this.database = this.client.db(DATABASE);  // Replace 'yourDatabaseName' with the actual DB name

            // Get a list of collections
            const collections = await this.database.listCollections().toArray();

            // Log the collections for inspection
            console.log("Collections in the database:", collections);

            this.colProjectsEdit = this.database.collection("projects-edit");
            this.colProjectsExport = this.database.collection("projects-export");
      
            console.log('Connected to database!');

        } catch (error) {
            console.error('Error connecting to the database:', error);
        } /* finally {
            // Close the client connection after interacting with the DB
            await this.client.close();
        } */
    }


    async generateNewEditRoute() {
        const newRoute = this.generateRandomString(64);


        const doc = {
            id: newRoute
        };

        try {
            const result = await this.colProjectsEdit.insertOne(doc);

            console.log(`A document was inserted with the _id: ${result.insertedId} \n route: ${newRoute}`);

            return newRoute;

        } catch (error) {
            console.error("Error occurred inserting project in design:", error);
            throw error;
        }
    }

    async saveEditPageInfo(editId, html, globalState) {
        const filter = { id: editId };
        const updateDoc = {
            $set: {
                html: html,
                globalState: globalState,
            }
        };

        try {
            await this.colProjectsEdit.updateOne(filter, updateDoc)
        } catch (error) {
            console.error("Error occurred updating project in design:", error);
            throw error;
        }
    }

    async getEditPageInfo(editId) {
        try {
            const result = await this.colProjectsEdit.findOne({ id: editId });

            return result;
        } catch (error) {
            console.error("Error occurred getting project in design:", error);
            throw error;
        }
    }

    async savePageInfo(editRoute, dynamicHTML, req) {
        const result = await this.colProjectsEdit.findOne({ id: editRoute });

        let exportRoute = result.exportId || this.generateRandomString(64);

        if (!result.exportId) {
            const updateDoc = {
                $set: {
                    exportId: exportRoute
                }
            };

            await this.colProjectsEdit.updateOne({ id: editRoute }, updateDoc);

            console.log(`A document was updated`);
            const doc = {
                id: exportRoute,
                html: dynamicHTML,
                code: req.body.code,
                predicatesInfo: req.body.predicatesInfo,
                predicateQueriesIds: req.body.predicateQueriesIds
            };

            const resultInserted = await this.colProjectsExport.insertOne(doc);

            console.log(`A document was inserted (projects-export) with the _id: ${resultInserted.insertedId}`);
        } else {
            const updateDoc = {
                $set: {
                    html: dynamicHTML,
                    code: req.body.code,
                    predicatesInfo: req.body.predicatesInfo,
                    predicateQueriesIds: req.body.predicateQueriesIds
                }
            };

            await this.colProjectsExport.updateOne({ id: exportRoute }, updateDoc);

            console.log(`A document was updated (projects-export)`);
        }

        return exportRoute;
    }

    async getPageInfo(route) {
        try {
            const result = await this.colProjectsExport.findOne({ id: route });

            return result;

        } catch (error) {
            console.error("Error occurred getting exported project:", error);
            throw error;
        }
    }

    generateRandomString(length) {
        return randomBytes(length / 2).toString('hex'); // Generates a random string of the given length
    }
}