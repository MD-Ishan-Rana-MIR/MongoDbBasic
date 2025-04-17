const express = require("express");
const app = new express();


const cors = require("cors");

app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        app.post("/transfer-money", async (req, res) => {
            console.log(req.body)
            const { formAccountNumber, toAccountNumber, amount } = req.body;
            if (!formAccountNumber || !toAccountNumber || !amount) {
                return res.status(400).json({
                    status: "fail",
                    msg: "form acctount number to account number and amount missing"
                });
            }
            const session = client.startSession();

            try {
                await session.withTransaction(async () => {
                    // sender account money withdraw
                    const withdrawResult = await accountCollection.updateOne(
                        {
                            _id: new ObjectId(formAccountNumber),
                            amount: { $gte: amount }
                        },
                        {
                            $inc: { amount: - amount }
                        },
                        {
                            session: session
                        }
                    );
                    if (withdrawResult.modifiedCount !== 1) {
                        return res.status(400).json({
                            status: "fail",
                            msg: "Insufficient balance. Transiction fail"
                        });
                    }
                    // step 2 
                    await accountCollection.updateOne(
                        {
                            _id: new ObjectId(formAccountNumber)
                        },
                        {
                            $inc: {
                                amount: amount
                            }
                        },
                        {
                            session: session
                        }
                    );

                    // step 3 

                    transictionsCollection.insertOne(
                        {
                            form: new ObjectId(),
                            to: new ObjectId(toAccountNumber),
                            amount,
                            timestamps: new Date()
                        },{
                            session : session
                        }
                    )


                });
                return res.status(200).json({
                    status : 'success',
                    msg : "Transiction successfully"
                })
            } catch (error) {
                return res.status(500).json({
                    status: "fail",
                    msg: "Something went wrong",
                    error: error
                });
            }finally{
                session.endSession();
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