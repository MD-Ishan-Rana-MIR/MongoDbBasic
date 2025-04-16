const express = require("express");
const app = new express();


const cors = require("cors");

app.use(express.json());




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ishanrana950:Xi9Qot1VD3BjGk31@cluster0.5xmvgk6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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


        const bank = client.db("bankTransitions");
        const accountCollection = bank.collection("accounts");
        const transictionsCollection = bank.collection("transitions");



        app.post("/post-account", async (req, res) => {
            try {
                const reqBody = req.body;
                const userData = await accountCollection.insertOne(reqBody);
                return res.status(201).json({
                    status: "success",
                    data: userData,
                    msg: "Account data insert successfully"
                })
            } catch (error) {
                return res.status(500).json({
                    status: "fail",
                    msg: "Something went wrong"
                })
            }
        });






























        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(5500, () => {
    console.log(`Server run successfully at http://localhost:5500`);
})