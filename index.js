const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());;
app.use(express.json());

console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jd8zyik.mongodb.net/?retryWrites=true&w=majority`;

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
        const allAddedToys = client.db('toyStore').collection('addToys');

        // search index
        const indexKeys = { toyName: 1 };
        const indexOptions = { name: "searchedAllTos" };
        const result = await allAddedToys.createIndex(indexKeys, indexOptions);

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        app.post("/addToys", async (req, res) => {
            const body = req.body;
            if (!body) {
                return res.status(404).send({ message: "Not valid request" })
            }

            const result = await allAddedToys.insertOne(body);
            console.log(result);
            res.send(result)
        });


        app.get("/allToys", async (req, res) => {
            const result = await allAddedToys.find({}).limit(20).toArray();
            res.send(result)
        });

        app.get("/singleToy/:id", async (req, res) => {
            console.log(req.params.id);
            const toys = await allAddedToys.findOne({
              _id: new ObjectId(req.params.id),
            });
            res.send(toys);
          });

        app.get("/getToysBySearch/:name", async (req, res) => {
            const SearchToyName = req.params.name;
            const result = await allAddedToys.find(
                {
                    toyName: { $regex: SearchToyName, $options: "i" }
                })
                .toArray();
            res.send(result);
        });

        app.get("/myToys/:sellerEmail", async (req, res) => {
            console.log(req.params.sellerEmail);
            const result = await allAddedToys.find({ sellerEmail: req.params.sellerEmail }).toArray();
            res.send(result)
        })


    } finally {
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toy shop is on the way')
})

app.listen(port, () => {
    console.log(`Toy shop is running on port ${port}`)
})
