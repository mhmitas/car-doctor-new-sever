const express = require('express')
const cors = require('cors')
let jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


//middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())

// myMiddlewares.
const logger = async (req, res, next) => {
    // console.log('called', req.hostname, req.originalUrl)
    next()
}

async function varifyToken(req, res, next) {
    const token = req.cookies?.myToken
    // console.log('From varify token middleware', token);
    if (!token) {
        return res.status(401).send({ message: 'unAuthorize' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        // error
        if (err) {
            console.error('JWT verification failed:', err);
            return res.status(401).send({ message: 'Unauthorized' });
        }
        // if token is valid then would be decoded
        console.log(decoded);
        req.user = decoded
        next()
    })
}



app.get('/', (req, res) => {
    res.send('Car doctores are working')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jt5df8u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
        const database = client.db('carDoctorsDB')
        const serviceCollection = database.collection('services')
        const bookingCollection = database.collection('bookings')

        // auth relatd api
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }) // secret
            res
                .cookie('myToken', token, { httpOnly: true, secure: false, sameSite: false })
                .send({ success: true })
        })

        // services related api
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { title: 1, price: 1, service_id: 1 },
            };
            const result = await serviceCollection.findOne(query, options)
            res.send(result)
        })

        app.get('/bookings', logger, varifyToken, async (req, res) => {
            // console.log(req.cookies.myToken)
            console.log('User in the valid token:', req.user)
            const result = await bookingCollection.find().toArray()
            res.send(result)
        })


        // `````````````Post APIs`````````````
        app.post('/bookings', async (req, res) => {
            const doc = req.body
            const result = await bookingCollection.insertOne(doc)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!🥭🥭🥭");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Car doctor server is running on port ${port}`)
})