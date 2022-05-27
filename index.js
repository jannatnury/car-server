const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());


/**
 * --------------------------------------------------
 * Config database
 * --------------------------------------------------
 * Mongo DB
 * --------------------------------------------------
 */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6t6ti.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        /**
         * --------------------------------------------------
         * Connect to MongoDB
         * --------------------------------------------------
         */
        await client.connect();
        const productCollection = client.db('car-doctor').collection('products');

    }
    finally {
        /**
         * --------------------------------------------------
         * disconnect from MongoDB
         * --------------------------------------------------
         */
        // client.close();
    }
};

run().catch(console.dir);

/**
* --------------------------------------------------
* root
* --------------------------------------------------
*/

app.get('/', (req, res) => {
    res.send("manufacturer server is running..");
});

app.listen(port, () => {
    console.log(`Server started on port... ${port}`);
});