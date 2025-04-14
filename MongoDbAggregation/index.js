const express = require("express");
const app = new express();
const cors = require("cors");



app.use(express.json());


app.use(cors());






const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ishanrana950:Xi9Qot1VD3BjGk31@cluster0.5xmvgk6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        // strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const db = client.db("aggregation-framework");
        const salesCollection = db.collection("sales");
        const regionCollection = db.createCollection("region");

        app.get("/find-sales-data-by-year", async (req, res) => {
            try {
                const year = parseInt(req.body.year); // assuming year is a number
                console.log(year);

                const data = await salesCollection.aggregate(
                    [
                        {
                            $match:
                            /**
                             * query: The query in MQL.
                             */
                            {
                                year: 2023
                            }
                        },
                        {
                            $group:
                            /**
                             * _id: The id of the group.
                             * fieldN: The first field name.
                             */
                            {
                                _id: "$region",
                                totalSum: {
                                    $sum: "$amount"
                                }
                            }
                        },
                        {
                            $sort:
                            /**
                             * Provide any number of field/order pairs.
                             */
                            {
                                totalSum: 1
                            }
                        }
                    ]
                ).toArray();

                res.status(200).json({
                    status: "success",
                    data: data
                });

            } catch (error) {
                console.log(error.toString());
                return res.status(500).json({
                    status: "fail",
                    msg: "Something went wrong"
                });
            }
        });


        // lookup operator

        app.get("/lookup-operator",async(req,res)=>{
            try {
                
            } catch (error) {
                
            }
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

app.get("/", (req, res) => {
    res.send("Server run successfully");
})


app.listen(5500, () => {
    console.log(`server run successfully at http://localhost:5500`)
})