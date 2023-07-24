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
        // await client.connect();
        const collegeCollection = client.db("college-compass").collection("colleges");
        const applicationCollection = client.db("college-compass").collection("Application");
        const reviewsCollection = client.db("college-compass").collection("reviews");
        const usersCollection = client.db("college-compass").collection("users");

        app.get('/all-college', async (req, res) => {
            const result = await collegeCollection.find().toArray();
            res.send(result);
        })

        app.get('/myCollege', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await applicationCollection.findOne(query);
            res.send(result)
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().sort({ date: -1 }).limit(3).toArray();
            res.send(result);
        })
        app.get("/users", async (req, res) => {
            const email = req.query.email;
            const result = await usersCollection.findOne({ email: email });
            res.send(result);
        })

        // all applications 
        app.post('/myCollege', async (req, res) => {
            const data = req.body;
            const available = await applicationCollection.findOne({ email: data.email })
            if (!available) {
                const result = await applicationCollection.insertOne(data);
                res.send(result)
            } else {
                res.send({ message: "You have already Admitted on a College" })
            }
        })
        // reviews 
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const available = await reviewsCollection.findOne({ collegeId: review.collegeId, email: review.email })
            if (available) {
                const filter = { collegeId: review.collegeId, email: review.email }
                const updateDoc = {
                    $set: {
                        message: review.message,
                        date: review.date
                    },
                };
                const result = await reviewsCollection.updateOne(filter, updateDoc)
                res.send(result);
            }
            else {
                const result = await reviewsCollection.insertOne(review);
                res.send(result);
            }
        })
        //   users 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const isAvailable = await usersCollection.findOne({ email: user.email })
            if (!isAvailable) {
                const result = await usersCollection.insertOne(user);
                res.send(result);
            }
        })

        // update user 
        app.patch('/userDetails', async (req, res) => {
            const data = req.body;
            const query = { email: data.email }
            const updateDoc = {
                $set: {
                    collegeName: data.college,
                    collegeId: data.collegeId,
                    name: data.name,
                    address: data.address,
                    subject: data.subject
                },
            };
            const result1 = await applicationCollection.updateOne(query, updateDoc);
            const updateUser = {
                $set: {
                    name: data.name,
                },
            };
            const result2 = await usersCollection.updateOne(query, updateUser)
            res.send([result1, result2])
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