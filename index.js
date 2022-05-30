const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const jwt = require('jsonwebtoken');
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
        const orders = client.db('car-doctor').collection('orders');
        const reviewCollection = client.db('car-doctor').collection('reviews');
        const users = client.db('car-doctor').collection('users');
        const admins = client.db('car-doctor').collection('admin');
        const profile = client.db('car-doctor').collection('profile');
        const projects = client.db('car-doctor').collection('projects');
        // log in 

        app.put('/api/login', async (req, res) => {

            const email = req.body.email;
            console.log(email);
            const filter = { email: email };
            const user = { email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await users.updateOne(filter, updateDoc, options);
            const accessToken = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '3d'
            });
            res.send({ result, accessToken });
        })

        app.get('/api/admin',  async (req, res) => {
            const email = req.query.email
            const result = await admins.findOne({ email });
            res.send(result);
        })

        // get all users
        app.get('/api/users', async (req, res) => {
            const adminCollection = await admins.find().toArray()
            const usersCollection = await users.find().toArray();
            usersCollection.forEach(user => {
                const admin = adminCollection.find(admin => admin.email === user.email);
                if (admin) {
                    user.isAdmin = true;
                } else {
                    user.isAdmin = false;
                }
            })
            res.send(usersCollection);

        })

        // get user profile
        app.get('/api/users/profile/:email', async (req, res) => {
            const email = req.params.email;
            const result = await profile.findOne({ email });
            if (result) {
                res.send(result);
            }
            else {
                res.send('User not found');
            }


        })

        /**
         * --------------------------------------------------
         * Get all products
         * --------------------------------------------------
         */

        app.get('/products', async (req, res) => {
            const query = req.query;
            const cursor = query ? query : {};
            const products = await productCollection.find(cursor).toArray();
            res.send(products);
        });

        app.get('/api/products/:id', async (req, res) => {
            const id = req.params.id;
            const product = await productCollection.findOne({ _id: ObjectId(id) });
            res.send(product);
        })
        // order
        app.post('/api/order', async (req, res) => {
            const order = req.body;
            console.log(order);
            const product = await productCollection.findOne({ _id: ObjectId(order?.product) })
            if (product) {

                let qtn = parseInt(product?.quantity) - parseInt(order?.quantity);
                const pay = parseFloat(product?.price) * parseInt(order?.quantity);
                console.log(parseInt(order?.quantity))
                console.log(parseInt(product?.price));
                console.log(parseInt(order?.quantity));
                console.log(parseInt(product?.quantity));
                console.log(pay);
                if (pay < 999999) {
                    order.pay = pay;
                    await productCollection.updateOne({ _id: ObjectId(order?.product) }, { $set: { quantity: qtn } });

                    const result = await orders.insertOne(order);
                    return res.send(result);
                }
                else {
                    return res.send({ message: `you can't order more than $999,999.99` });
                }

            }
            res.send({ message: 'Product not found' });

        })
        app.get('/api/orders', async (req, res) => {
            const email = req.query.email;
            const result = await orders.find({ user: email }).toArray();
            res.send(result);
        })

        
        /**
         * --------------------------------------------------------------------
         * add product route for admin
         * --------------------------------------------------------------------
         */

         app.post('/api/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })
        /**
         * --------------------------------------------------------------------
         * delete product admin route
         * --------------------------------------------------------------------
         */

         app.delete('/api/products/:id', async (req, res) => {
            const product = req.params.id;
            const result = await productCollection.deleteOne({ _id: ObjectId(product) });
            res.send(result);
        })

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