const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('college server running')
})



// mongo start
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kri1sc7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const collegeCollection = client.db("college-compass").collection("colleges");
        const ApplicationCollection = client.db("college-compass").collection("Application");
        const ReviewsCollection = client.db("college-compass").collection("reviews");

        app.get('/all-college', async (req, res) => {
            const result = await collegeCollection.find().toArray();
            res.send(result);
        })

        app.get('/myCollege', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await ApplicationCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/myCollege', async (req, res) => {
            const data = req.body;
            const result = await ApplicationCollection.insertOne(data);
            res.send(result)
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await ReviewsCollection.insertOne(review);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// mongo end 


app.listen(port, () => {
    console.log(`this website run on port : ${port}`);
})