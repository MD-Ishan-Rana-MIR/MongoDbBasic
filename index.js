const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());
app.use(express.json());

// database connect 

const studentSchemaValidation = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Student Object Validation",
            required: ["address", "major", "name", "year", "email"],
            properties: {
                name: {
                    bsonType: "string",
                    description: "'name' must be a string and is required"
                },
                year: {
                    bsonType: "int",
                    minimum: 2017,
                    maximum: 3017,
                    description: "'year' must be an integer in [ 2017, 3017 ] and is required"
                },
                gpa: {
                    bsonType: ["double"],
                    description: "'gpa' must be a double if the field exists"
                },
                email: {
                    bsonType: "starting",
                    patern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
                    description: "email must be string and is required"
                }
            }
        }
    },
    validateAction : "error"

}


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
        await db.createCollection("students",studentSchemaValidation)
        const userCollection = db.collection('user');
        await db.createCollection("student",)
        const studentCollection = db.collection("students");




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


        // update one


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
                const data = await userCollection.updateOne(filter, { $set: update }, { upsert: true });


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


        // update many 


        app.put('/update-many', async (req, res) => {
            try {
                const reqBody = req.body;
                const update = {
                    ...req.body
                };
                const filter = {
                    age: {
                        $gte: 26
                    }
                };
                const data = await userCollection.updateMany(filter, { $set: update }, { upsert: true });
                return res.status(200).json({
                    status: 'success',
                    msg: 'Data update successully',
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


        // delete one 

        app.delete('/delete-one/:id', async (req, res) => {
            try {
                let { id } = req.params;
                const filter = {
                    _id: new ObjectId(id)
                };
                const data = await userCollection.deleteOne(filter);
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


        app.delete('/delete-many', async (req, res) => {
            const status = req.body.status;
            try {
                let filter = {
                    status: status
                };
                const data = await userCollection.deleteMany(filter);
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


        // mongodb query operator


        app.put("/update-users-by-age", async (req, res) => {
            try {
                const { age, role, status } = req.body;

                // Input validation
                if (age === undefined || role === undefined) {
                    return res.status(400).json({
                        status: 'fail',
                        message: 'Both age and role are required in request body'
                    });
                }

                if (typeof age !== 'number' || age < 0) {
                    return res.status(400).json({
                        status: 'fail',
                        message: 'Age must be a positive number'
                    });
                }

                const filter = {
                    $or: [
                        {
                            age: { $gte: age }
                        },
                        {
                            status: { $eq: status }
                        }
                    ]
                };

                const update = {
                    $set: {
                        role: role,
                        updatedAt: new Date() // Add timestamp
                    }
                };

                const options = {
                    upsert: false // Typically false for updates to prevent accidental document creation
                };

                const result = await userCollection.updateMany(filter, update, options);

                if (result.matchedCount === 0) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'No users found matching the criteria'
                    });
                }

                return res.status(200).json({
                    status: 'success',
                    message: `${result.modifiedCount} users updated successfully`,
                    data: {
                        ageThreshold: age,
                        newRole: role,
                        matchedCount: result.matchedCount,
                        modifiedCount: result.modifiedCount
                    }
                });

            } catch (error) {
                console.error('Bulk update error:', error);
                return res.status(500).json({
                    status: 'error',
                    message: 'Internal server error'
                });
            }
        });


        // regex 


        app.get("/search-user", async (req, res) => {
            try {
                let { status, role } = req.query;

                // // Decode and lowercase for case-insensitive matching
                // role = role ? decodeURI(role).toLowerCase() : null;
                // status = status ? decodeURI(status).toLowerCase() : null;

                // let resp = await userCollection.find().toArray();

                // if (role || status) {
                //     resp = resp.filter(data =>
                //         (!role || data.role?.toLowerCase().includes(role)) ||
                //         (!status || data.status?.toLowerCase().includes(status))

                //     );
                // }

                let filter = {}
                if (status) filter.status = status;
                if (role) filter.role = role;

                const resp = await userCollection.find(filter).toArray()

                return res.status(200).json({
                    status: 'success',
                    msg: 'Data fetched successfully',
                    data: resp
                });

            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    status: 'fail',
                    msg: 'Something went wrong'
                });
            }
        });

        // search by keyword 

        app.get("/search/:keyword", async (req, res) => {
            try {
                let searchRegex = {
                    "$regex": req.params.keyword, "$options": "i"
                };
                const searchValue = {
                    $or: [
                        {
                            name: searchRegex
                        },
                        {
                            role: searchRegex
                        }
                    ]
                };

                const data = await userCollection.find(searchValue).toArray()
                return res.status(200).json({
                    status: 'success',
                    msg: 'Data fetched successfully',
                    data: data
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    status: 'fail',
                    msg: 'Something went wrong'
                });
            }
        });


        // array all method 


        // pagenation 


        app.get("/user/pagination/:page", async (req, res) => {
            try {
                const page = parseInt(req.params.page);
                const limit = 5;
                const skip = (page - 1) * limit
                const data = await userCollection.find().sort({ age: -1 }).skip(skip).limit(limit).toArray();
                return res.status(200).json({
                    status: 'success',
                    msg: 'Data fetched successfully',
                    data: data
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    status: 'fail',
                    msg: 'Something went wrong'
                });
            }
        });

        // dynamic pagination 

        app.get("/dynamic-pagination", async (req, res) => {
            try {
                let page = parseInt(req.query.page) || 1;
                let limit = parseInt(req.query.limit) || 5;
                const skip = (page - 1) * limit;
                const data = await userCollection.find().skip(skip).limit(limit).toArray();
                const totalUser = await userCollection.countDocuments();
                return res.status(200).json({
                    status: 'success',
                    msg: 'Data fetched successfully',
                    totalUser: totalUser,
                    data: data
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    status: 'fail',
                    msg: 'Something went wrong'
                });
            }
        });

        // indexing 

        app.get("/indexing", async (req, res) => {
            try {
                const email = req.query.email;
                userCollection.createIndex({ name: 1, email: 1 });
                const userData = await userCollection.find({ email: email }).toArray();
                userCollection.dropIndex("name_1_email_1");
                userCollection.createIndex({ description: "text" });
                userCollection.createIndex({ name: 1 }, { sparse: true })

                return res.status(200).json({
                    status: 'success',
                    msg: 'Data fetched successfully',
                    data: userData
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    status: 'fail',
                    msg: 'Something went wrong'
                });
            }
        });


        app.post("/insert-student", async (req, res) => {
            try {
                let reqBody = req.body;
                const studentData = {
                    ...reqBody,
                    createdAt: Date.now()
                };
                const data = await studentCollection.insertOne(studentData)
                return res.status(200).json({
                    status: 'success',
                    msg: 'Data fetched successfully',
                    data: data
                });
            } catch (error) {
                console.error(error);
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