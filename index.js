const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3u9wf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const courseCollection = client.db('courseDB').collection('course')
        const usersCollection = client.db('courseDB').collection('users')
        const ordersCollection = client.db('courseDB').collection('orders')

        // Course Related apis
        // Get Courses
        app.get('/courses', async (req, res) => {
            const cursor = courseCollection.find()
            const result = await cursor.toArray()
            res.send(result)

        })

        // Get course of a specific id
        app.get('/courses/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await courseCollection.findOne(query)

            res.send(result)
        })


        // Get courses of a specific email
        app.get('/user-courses/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await ordersCollection.find(query).toArray()

            res.send(result)
        })


        // Add course
        app.post('/add-course', async (req, res) => {
            const newCourse = req.body
            const result = await courseCollection.insertOne(newCourse)

            console.log('inserted', newCourse)
            res.send(result)
        })


        // Delete course 
        app.delete('/courses/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await courseCollection.deleteOne(query)

            res.send(result)
        })


        // Updated course 
        app.put('/courses/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedCourse = req.body
            const course = {
                $set: {
                    title: updatedCourse.title,
                    thumbnailUrl: updatedCourse.thumbnailUrl,
                    description: updatedCourse.description,
                    regularPrice: updatedCourse.regularPrice,
                    discountedPrice: updatedCourse.discountedPrice,
                    isOnCart: updatedCourse.isOnCart
                }
            }

            const result = await courseCollection.updateOne(filter, course, options)
            res.send(result)
        })

        // Update isOnCart
        app.patch('/courses/:id', async(req, res) => {
            const id = req.params.id
            const filter = {_id: new ObjectId(id)}
            const updatedDoc = {
                $set: {
                    isOnCart: req.body.isOnCart
                }
            }

            const result = await courseCollection.updateOne(filter, updatedDoc)
            res.send(result)

            console.log(req.body)
        })


        
        // Users related apis
        // Get users
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        // Create users
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            console.log(user)
            res.send(result)
        })


        app.patch('/users', async(req, res) => {
            const email = req.body.email
            const filter = {email}
            const updatedDoc = {
                $set: {
                    lastSignInTime: req.body?.lastSignInTime
                }
            }

            const result = await usersCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })




        // Orders related API

        // Get order
        app.get('/orders', async(req, res) => {
            const cursor = ordersCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        // Post order
        app.post('/orders', async(req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Elearning server is running')
})

app.listen(port, () => {
    console.log(`Elearning server is running on port ${port}`)
})