const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g75lc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("Creative Agency Server is working!")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderCollection = client.db("creativeAgency").collection("orders");
    const reviewCollection = client.db("creativeAgency").collection("reviews");
    const serviceCollection = client.db("creativeAgency").collection("services");
    const adminCollection = client.db("creativeAgency").collection("admins");

    app.post('/addOrder', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const service = req.body.service;
        const description = req.body.description;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
    
        var image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };
    
        orderCollection.insertOne({ name, email, service, description, price, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        })
    
    app.get('/orders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addReview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const designation = req.body.designation;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
    
        var image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };
    
        reviewCollection.insertOne({ name, designation, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        })
    
    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
        
        var icon = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };
        
        serviceCollection.insertOne({ title, description, icon })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        })
        
    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.post('/addAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.insertOne({email})
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })

});


app.listen(process.env.PORT || port);