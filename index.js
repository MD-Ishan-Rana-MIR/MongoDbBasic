const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());
app.use(express.json());

// database connect 




const { MongoClient, ServerApiVersion, CURSOR_FLAGS, ObjectId } = require('mongodb');
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

        const db = client.db('user-management');
        const userCollection = db.collection('user');

        // post user data 

        app.post('/user', async (req, res) => {
            try {
                let reqBody = req.body;
                console.log(reqBody)
                let data = await userCollection.insertOne(reqBody);
                return res.status(201).json({
                    status: 'success',
                    msg: 'User data post successfully',
                    data: data
                })
            } catch (error) {
                console.log(error)
                return res.status(500).json({
                    status: 'fail',
                    msg: 'Something went wrong'
                })
            }
        });

        // insert many user 


        app.post('/user-post', async (req, res) => {
            try {
                let reqBody = req.body;
                const data = await userCollection.insertMany(reqBody);
                return res.status(201).json({
                    status: 'success',
                    msg: 'User post successfully',
                    data: data
                })
            } catch (error) {
                console.log(error)
                return res.status(500).json({
                    status: 'fail',
                    msg: 'Something went wrong'
                })
            }
        });



        // find user 

        app.get('/find-user', async (req, res) => {
            try {
                const data = await userCollection.find({
                    age: {
                        $gt: 30
                    },
                    status: {
                        $eq: 'active'
                    },
                    role: {
                        $eq: 'Product Manager'
                    }
                }).toArray();
                return res.status(200).json({
                    status: 'success',
                    msg: 'Data fetch successully',
                    data: data
                })
            } catch (error) {
                console.log(error)
                return res.status(500).json({
                    status: 'fail',
                    msg: 'Something went wrong'
                })
            }
        });


        // find with projection 


        app.get('/fint-projection', async (req, res) => {
            try {
                const data = await userCollection.find(
                    {
                        age: { $gte: 20 }  // Find documents where age is greater than or equal to 20
                    },
                    {
                        projection: {
                            name: 1,
                            role: 1,
                            age: 1
                        }
                    }
                ).limit(5).toArray();
                return res.status(200).json({
                    status: 'success',
                    msg: 'Data fetch successully',
                    data: data
                });
            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    status: 'fail',
                    msg: 'Something went wrong'
                });
            }
        });


        // update 


        app.put('/post-update/:id', async (req, res) => {
            try {
                let id = req.params.id;
                const filter = {
                    _id: new ObjectId(id)
                };
                const update = {
                    name: req.body.name,
                    email: req.body.email,
                    age: req.body.age,
                    role: req.body.role,
                    status: req.body.status
                };
                const data = await userCollection.updateOne(filter, {$set : update}, { upsert: true });


                return res.status(200).json({
                    status: 'success',
                    msg: 'Data fetch successully',
                    data: data
                });

            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    status: 'fail',
                    msg: 'Something went wrong'
                });

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



app.get('', (req, res) => {
    res.send('Home route')
})

app.listen(port, () => {
    console.log('server run successfully');
})


// Xi9Qot1VD3BjGk31